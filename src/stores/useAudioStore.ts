import { create } from 'zustand';
import { ORIGINAL_TRACKS, MusicTrack } from '@/data/music';

interface AudioStoreState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
  playTrack: (track: MusicTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (val: number) => void;
  setCurrentTime: (val: number) => void;
  setDuration: (val: number) => void;
}

// Global Web Audio synth node references for procedural playback
let globalAudioCtx: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let masterGainNode: GainNode | null = null;
let currentHtmlAudio: HTMLAudioElement | null = null;
let proceduralTimer: NodeJS.Timeout | null = null;

function stopCurrentSynthOnly() {
  if (proceduralTimer) {
    clearInterval(proceduralTimer);
    proceduralTimer = null;
  }
  currentOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // already stopped
    }
  });
  currentOscillators = [];
}

function stopAllAudio() {
  stopCurrentSynthOnly();
  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentHtmlAudio = null;
  }
}

function playProceduralTrack(track: MusicTrack, volume: number) {
  if (typeof window === 'undefined') return;

  // If track has an actual audio file source defined, try HTMLAudio first
  if (track.src) {
    try {
      stopAllAudio();
      const audio = new Audio(track.src);
      audio.volume = Math.max(0, Math.min(1, volume));

      audio.onloadedmetadata = () => {
        useAudioStore.getState().setDuration(audio.duration || track.durationSeconds);
      };

      audio.ontimeupdate = () => {
        useAudioStore.getState().setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        useAudioStore.getState().nextTrack();
      };

      audio.play().then(() => {
        currentHtmlAudio = audio;
      }).catch(() => {
        // Fallback to Web Audio synthesis if file not found
        fallbackSynth(track, volume);
      });
      return;
    } catch {
      // Fallback
    }
  }

  fallbackSynth(track, volume);
}

function fallbackSynth(track: MusicTrack, volume: number) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioCtx();
    }

    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }

    stopCurrentSynthOnly();

    if (!masterGainNode) {
      masterGainNode = globalAudioCtx.createGain();
      masterGainNode.connect(globalAudioCtx.destination);
    }
    masterGainNode.gain.setValueAtTime(volume * 0.15, globalAudioCtx.currentTime);

    // Create lush multi-oscillator chord / arpeggio for ambient preview
    const freqs = track.synthFrequencies || [220, 261.63, 329.63, 392];
    freqs.forEach((freq, idx) => {
      if (!globalAudioCtx) return;
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);

      // Subtle vibrato/detune for organic warmth
      osc.detune.setValueAtTime((idx - 1) * 4, globalAudioCtx.currentTime);

      gain.gain.setValueAtTime(0.08 / freqs.length, globalAudioCtx.currentTime);

      osc.connect(gain);
      gain.connect(masterGainNode!);

      osc.start();
      currentOscillators.push(osc);
    });

    // Simple timer to tick currentTime for procedural preview
    if (proceduralTimer) clearInterval(proceduralTimer);
    proceduralTimer = setInterval(() => {
      const { currentTime, duration, isPlaying } = useAudioStore.getState();
      if (!isPlaying) return;
      if (currentTime >= duration) {
        useAudioStore.getState().nextTrack();
      } else {
        useAudioStore.getState().setCurrentTime(currentTime + 1);
      }
    }, 1000);
  } catch {
    // Audio synthesis fallback
  }
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: ORIGINAL_TRACKS[0],
  isPlaying: false,
  volume: 0.75,
  currentTime: 0,
  duration: ORIGINAL_TRACKS[0]?.durationSeconds || 180,

  playTrack: (track: MusicTrack) => {
    const { volume } = get();
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.durationSeconds || 180,
    });
    playProceduralTrack(track, volume);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, volume } = get();
    if (isPlaying) {
      if (currentHtmlAudio) {
        currentHtmlAudio.pause();
      }
      stopCurrentSynthOnly();
      set({ isPlaying: false });
    } else {
      if (currentHtmlAudio && currentTrack) {
        currentHtmlAudio.play().then(() => {
          set({ isPlaying: true });
        }).catch(() => {
          playProceduralTrack(currentTrack, volume);
        });
      } else {
        const trackToPlay = currentTrack || ORIGINAL_TRACKS[0];
        set({ currentTrack: trackToPlay, isPlaying: true });
        playProceduralTrack(trackToPlay, volume);
      }
    }
  },

  pause: () => {
    if (currentHtmlAudio) {
      currentHtmlAudio.pause();
    }
    stopCurrentSynthOnly();
    set({ isPlaying: false });
  },

  seek: (seconds: number) => {
    const targetTime = Math.max(0, seconds);
    set({ currentTime: targetTime });
    if (currentHtmlAudio) {
      currentHtmlAudio.currentTime = targetTime;
    }
  },

  nextTrack: () => {
    const { currentTrack, playTrack } = get();
    const currentIndex = ORIGINAL_TRACKS.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % ORIGINAL_TRACKS.length;
    playTrack(ORIGINAL_TRACKS[nextIndex]);
  },

  prevTrack: () => {
    const { currentTrack, playTrack } = get();
    const currentIndex = ORIGINAL_TRACKS.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + ORIGINAL_TRACKS.length) % ORIGINAL_TRACKS.length;
    playTrack(ORIGINAL_TRACKS[prevIndex]);
  },

  setVolume: (val: number) => {
    set({ volume: val });
    if (currentHtmlAudio) {
      currentHtmlAudio.volume = Math.max(0, Math.min(1, val));
    }
    if (masterGainNode && globalAudioCtx) {
      masterGainNode.gain.setValueAtTime(val * 0.15, globalAudioCtx.currentTime);
    }
  },

  setCurrentTime: (val: number) => {
    set({ currentTime: val });
  },

  setDuration: (val: number) => {
    set({ duration: val });
  },
}));
