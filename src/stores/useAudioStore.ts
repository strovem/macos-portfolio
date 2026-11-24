import { create } from 'zustand';
import { ORIGINAL_TRACKS, MusicTrack } from '@/data/music';
import {
  getSharedAudioContext,
  connectAudioElementToAnalyser,
  connectNodeToAnalyser,
} from '@/lib/audioAnalyser';

interface AudioStoreState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
  isAmbientPlaying: boolean;
  ambientVolume: number; // 0 to 1
  toggleAmbient: () => void;
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

// Shared Web Audio synth node references for procedural playback
let currentOscillators: OscillatorNode[] = [];
let masterGainNode: GainNode | null = null;
let currentHtmlAudio: HTMLAudioElement | null = null;
let proceduralTimer: NodeJS.Timeout | null = null;
let audioRequestSeq = 0;

// Ambient soundscape nodes
let ambientOscillators: OscillatorNode[] = [];
let ambientGainNode: GainNode | null = null;

function startAmbientSound(_vol: number, _isMusicActive: boolean) {
  stopAmbientSound();
}

function stopAmbientSound() {
  ambientOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // already stopped
    }
  });
  ambientOscillators = [];
}

function updateAmbientDucking(isMusicActive: boolean) {
  const ctx = getSharedAudioContext();
  if (!ambientGainNode || !ctx) return;
  const { isAmbientPlaying, ambientVolume } = useAudioStore.getState();
  if (!isAmbientPlaying) return;

  const targetGain = isMusicActive ? 0.005 : ambientVolume * 0.08;
  ambientGainNode.gain.cancelScheduledValues(ctx.currentTime);
  ambientGainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.6);
}

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
  audioRequestSeq += 1;
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
      const requestId = ++audioRequestSeq;
      const audio = new Audio(track.src);
      audio.crossOrigin = 'anonymous';
      audio.volume = Math.max(0, Math.min(1, volume));
      connectAudioElementToAnalyser(audio);

      audio.onloadedmetadata = () => {
        if (requestId !== audioRequestSeq) return;
        useAudioStore.getState().setDuration(audio.duration || track.durationSeconds);
      };

      audio.ontimeupdate = () => {
        if (requestId !== audioRequestSeq) return;
        useAudioStore.getState().setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        if (requestId !== audioRequestSeq) return;
        useAudioStore.getState().nextTrack();
      };

      audio.play().then(() => {
        if (requestId !== audioRequestSeq || !useAudioStore.getState().isPlaying) {
          audio.pause();
          return;
        }
        currentHtmlAudio = audio;
      }).catch(() => {
        if (requestId !== audioRequestSeq || !useAudioStore.getState().isPlaying) return;
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
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    stopCurrentSynthOnly();

    if (!masterGainNode || masterGainNode.context !== ctx) {
      masterGainNode = ctx.createGain();
      masterGainNode.connect(ctx.destination);
      connectNodeToAnalyser(masterGainNode);
    }
    masterGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.15, ctx.currentTime);

    // Create lush multi-oscillator chord / arpeggio for ambient preview
    const freqs = track.synthFrequencies || [220, 261.63, 329.63, 392];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle vibrato/detune for organic warmth
      osc.detune.setValueAtTime((idx - 1) * 4, ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / freqs.length, ctx.currentTime);

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
  isAmbientPlaying: false,
  ambientVolume: 0.8,

  toggleAmbient: () => {
    const { isAmbientPlaying, ambientVolume, isPlaying } = get();
    if (isAmbientPlaying) {
      stopAmbientSound();
      set({ isAmbientPlaying: false });
    } else {
      set({ isAmbientPlaying: true });
      startAmbientSound(ambientVolume, isPlaying);
    }
  },

  playTrack: (track: MusicTrack) => {
    const { volume } = get();
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.durationSeconds || 180,
    });
    updateAmbientDucking(true);
    playProceduralTrack(track, volume);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, volume } = get();
    if (isPlaying) {
      audioRequestSeq += 1;
      if (currentHtmlAudio) {
        currentHtmlAudio.pause();
      }
      stopCurrentSynthOnly();
      set({ isPlaying: false });
      updateAmbientDucking(false);
    } else {
      updateAmbientDucking(true);
      if (currentHtmlAudio && currentTrack) {
        const requestId = ++audioRequestSeq;
        set({ isPlaying: true });
        currentHtmlAudio.play().then(() => {
          if (requestId !== audioRequestSeq || !useAudioStore.getState().isPlaying) {
            currentHtmlAudio?.pause();
          }
        }).catch(() => {
          if (requestId !== audioRequestSeq || !useAudioStore.getState().isPlaying) return;
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
    audioRequestSeq += 1;
    if (currentHtmlAudio) {
      currentHtmlAudio.pause();
    }
    stopCurrentSynthOnly();
    set({ isPlaying: false });
    updateAmbientDucking(false);
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
    const clamped = Math.max(0, Math.min(1, val));
    set({ volume: clamped });
    if (currentHtmlAudio) {
      currentHtmlAudio.volume = clamped;
    }
    const ctx = getSharedAudioContext();
    if (masterGainNode && ctx) {
      masterGainNode.gain.setValueAtTime(clamped * 0.15, ctx.currentTime);
    }
  },

  setCurrentTime: (val: number) => {
    set({ currentTime: val });
  },

  setDuration: (val: number) => {
    set({ duration: val });
  },
}));
