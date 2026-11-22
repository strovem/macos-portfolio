import { create } from 'zustand';
import { ORIGINAL_TRACKS, MusicTrack } from '@/data/music';

interface AudioStoreState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number; // 0 to 1
  currentTime: number; // in seconds
  playTrack: (track: MusicTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (val: number) => void;
  setCurrentTime: (val: number) => void;
}

// Global Web Audio synth node references for procedural playback
let globalAudioCtx: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let masterGainNode: GainNode | null = null;
let currentHtmlAudio: HTMLAudioElement | null = null;

function stopCurrentSynth() {
  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentHtmlAudio = null;
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

function playProceduralTrack(track: MusicTrack, volume: number) {
  if (typeof window === 'undefined') return;

  // If track has an actual audio file source defined, try HTMLAudio first
  if (track.src) {
    try {
      stopCurrentSynth();
      const audio = new Audio(track.src);
      audio.volume = Math.max(0, Math.min(1, volume));
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

    stopCurrentSynth();

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
  } catch {
    // Audio synthesis fallback
  }
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: ORIGINAL_TRACKS[0],
  isPlaying: false,
  volume: 0.75,
  currentTime: 0,

  playTrack: (track: MusicTrack) => {
    const { volume } = get();
    set({ currentTrack: track, isPlaying: true, currentTime: 0 });
    playProceduralTrack(track, volume);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, volume } = get();
    if (isPlaying) {
      stopCurrentSynth();
      set({ isPlaying: false });
    } else {
      const trackToPlay = currentTrack || ORIGINAL_TRACKS[0];
      set({ currentTrack: trackToPlay, isPlaying: true });
      playProceduralTrack(trackToPlay, volume);
    }
  },

  pause: () => {
    stopCurrentSynth();
    set({ isPlaying: false });
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
}));
