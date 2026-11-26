'use client';

import { computeBandEnergy, createBeatDetector } from './audioBeatDetector';

/**
 * Singleton Web Audio AnalyserNode FFT Frequency Engine
 * Provides real-time frequency & kick-onset analysis (60 FPS, non-blocking, zero React state re-render)
 * with graceful CORS fallback, per-frame memoization, and safe MediaElementSource guards.
 */

let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let freqDataBuffer: Uint8Array<ArrayBuffer> | null = null;
let timeDataBuffer: Uint8Array<ArrayBuffer> | null = null;

// WeakMap guards to guarantee createMediaElementSource is called exactly once per HTMLAudioElement
const connectedMediaElements = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
const connectedNodes = new WeakSet<AudioNode>();

const beatDetector = createBeatDetector();
let lastAnalyzedMs = -1;
let lastAnalyzedPlaying = false;
let observedLiveSignal = false;
let silentFramesCount = 0;

// Internal timing for graceful CORS/silence fallback simulation
let fallbackStartMs = 0;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }

  return sharedAudioCtx;
}

/**
 * Resumes the shared AudioContext inside a user-gesture handler so
 * MediaElementAudioSourceNode and Web Audio synths produce audible output.
 */
export function resumeSharedAudioContext(): AudioContext | null {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function getSharedAnalyser(): AnalyserNode | null {
  const ctx = getSharedAudioContext();
  if (!ctx) return null;

  if (!sharedAnalyser) {
    sharedAnalyser = ctx.createAnalyser();
    sharedAnalyser.fftSize = 2048; // 1024 bins (~21-24Hz resolution) for tight kick & sub-bass isolation
    sharedAnalyser.smoothingTimeConstant = 0.18; // Ultra-low smoothing preserves 16ms transient attacks for spectral flux
    sharedAnalyser.minDecibels = -95;
    sharedAnalyser.maxDecibels = -18; // Balanced headroom for both soft lo-fi and loud club mixes
    freqDataBuffer = new Uint8Array(sharedAnalyser.frequencyBinCount);
    timeDataBuffer = new Uint8Array(sharedAnalyser.fftSize);
  }

  return sharedAnalyser;
}

/**
 * Safely connect an HTMLAudioElement to the singleton AnalyserNode.
 * Enforces crossOrigin = 'anonymous' and guards against multiple calls.
 */
export function connectAudioElementToAnalyser(audio: HTMLAudioElement) {
  const ctx = getSharedAudioContext();
  const analyser = getSharedAnalyser();
  if (!ctx || !analyser) return;

  // Set anonymous CORS before attaching
  try {
    if (!audio.crossOrigin) {
      audio.crossOrigin = 'anonymous';
    }
  } catch {
    // ignore
  }

  if (connectedMediaElements.has(audio)) {
    return;
  }

  try {
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    // Connect to destination so audio remains audible
    source.connect(ctx.destination);
    connectedMediaElements.set(audio, source);
  } catch (err) {
    // If browser blocks due to tainted CORS or already connected, fallback handles it
    console.warn('[AudioAnalyser] HTMLAudio element connection notice:', err);
  }
}

/**
 * Connect any Web Audio node (e.g. synth master gain or beat pad) to the singleton analyser.
 */
export function connectNodeToAnalyser(node: AudioNode) {
  const analyser = getSharedAnalyser();
  if (!analyser) return;

  if (connectedNodes.has(node)) return;

  try {
    node.connect(analyser);
    connectedNodes.add(node);
  } catch {
    // ignore
  }
}

export interface AudioMetrics {
  bass: number; // 0.0 - 1.0 (~40Hz - 250Hz)
  mid: number; // 0.0 - 1.0 (~250Hz - 4kHz)
  treble: number; // 0.0 - 1.0 (~4kHz - 16kHz)
  energy: number; // 0.0 - 1.0 (overall audible spectrum energy)
  kick: number; // 0.0 - 1.0 (fast-attack / exponential-decay kick envelope)
  isKickHit: boolean; // true on frames where a kick transient crossed adaptive threshold
  beatPhase: number; // 0.0 - 1.0 tempo cycle phase-locked to kick transients
  effectiveBpm: number; // dynamic tempo estimate seeded by track BPM
  rawBuffer: Uint8Array | null;
}

function createSilentMetrics(bpm = 126): AudioMetrics {
  const safeBpm = bpm > 30 && bpm < 260 ? bpm : 126;
  return {
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
    kick: 0,
    isKickHit: false,
    beatPhase: 0,
    effectiveBpm: safeBpm,
    rawBuffer: null,
  };
}

let cachedMetrics: AudioMetrics = createSilentMetrics(126);

/**
 * Reset onset detection & tempo estimation state when switching tracks.
 */
export function resetAudioBeatTracker(bpm = 126) {
  beatDetector.reset(bpm);
  observedLiveSignal = false;
  silentFramesCount = 0;
  lastAnalyzedMs = -1;
  fallbackStartMs = 0;
  cachedMetrics = createSilentMetrics(bpm);
}

/**
 * Extracts normalized 0-1 metrics + kick onset & tempo phase from the current FFT frame.
 * Deduplicates calls within the same animation frame (~6ms window) so multiple visualizers
 * share identical kick envelopes and beat hits without advancing DSP state twice.
 */
export function getAudioMetrics(isPlaying = false, bpm = 126): AudioMetrics {
  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();

  if (!isPlaying) {
    if (lastAnalyzedPlaying) {
      beatDetector.reset(bpm);
      lastAnalyzedPlaying = false;
      lastAnalyzedMs = -1;
    }
    return createSilentMetrics(bpm);
  }

  if (lastAnalyzedPlaying && lastAnalyzedMs >= 0 && nowMs - lastAnalyzedMs < 6) {
    return cachedMetrics;
  }

  const analyser = getSharedAnalyser();
  const ctx = getSharedAudioContext();

  if (!analyser || !freqDataBuffer || !ctx) {
    lastAnalyzedPlaying = true;
    lastAnalyzedMs = nowMs;
    cachedMetrics = getProceduralFallbackMetrics(bpm, nowMs);
    return cachedMetrics;
  }

  analyser.getByteFrequencyData(freqDataBuffer);

  const sampleRate = ctx.sampleRate || 48000;
  const rawBass = computeBandEnergy(freqDataBuffer, sampleRate, 35, 250);
  const mid = computeBandEnergy(freqDataBuffer, sampleRate, 250, 4000);
  const treble = computeBandEnergy(freqDataBuffer, sampleRate, 4000, 16000);
  const energy = computeBandEnergy(freqDataBuffer, sampleRate, 35, 16000);

  if (energy >= 0.0025) {
    observedLiveSignal = true;
    silentFramesCount = 0;
  } else {
    silentFramesCount += 1;
    // Wait briefly during audio startup; if CORS or dead audio blocks FFT permanently, fall back to tempo-locked simulation
    if (!observedLiveSignal && silentFramesCount > 18) {
      lastAnalyzedPlaying = true;
      lastAnalyzedMs = nowMs;
      cachedMetrics = getProceduralFallbackMetrics(bpm, nowMs);
      return cachedMetrics;
    }
  }

  const beat = beatDetector.stepSpectrum(freqDataBuffer, sampleRate, nowMs, bpm);
  const bass =
    energy < 0.0025 ? 0 : Math.min(1, Math.max(rawBass, beat.normalizedBass * 0.92));
  lastAnalyzedPlaying = true;
  lastAnalyzedMs = nowMs;
  cachedMetrics = {
    bass,
    mid,
    treble,
    energy,
    kick: beat.kick,
    isKickHit: beat.isKickHit,
    beatPhase: beat.beatPhase,
    effectiveBpm: beat.effectiveBpm,
    rawBuffer: freqDataBuffer,
  };
  return cachedMetrics;
}

/**
 * Returns an array of normalized heights (0.0 to 1.0) for N spectrum bars.
 */
export function getFrequencyBars(barCount = 32, isPlaying = false): number[] {
  const bars: number[] = new Array(barCount).fill(0);
  if (!isPlaying && !sharedAnalyser) {
    return bars;
  }
  const analyser = getSharedAnalyser();

  if (!analyser || !freqDataBuffer) {
    if (isPlaying) {
      return getProceduralFallbackBars(barCount);
    }
    return bars;
  }

  analyser.getByteFrequencyData(freqDataBuffer);

  let isSilent = true;
  // Cap to lower ~65% of bins (~0-15kHz) so higher spectrum bars stay musically active
  const binCount = Math.max(barCount, Math.floor(freqDataBuffer.length * 0.65));
  const step = binCount / barCount;

  for (let i = 0; i < barCount; i++) {
    const startIdx = Math.floor(i * step);
    const endIdx = Math.min(binCount, Math.floor((i + 1) * step));
    let sum = 0;
    let count = 0;

    for (let j = startIdx; j < endIdx; j++) {
      sum += freqDataBuffer[j];
      count++;
    }

    const val = count > 0 ? sum / (count * 255) : 0;
    bars[i] = val;
    if (val > 0.01) isSilent = false;
  }

  if (isPlaying && isSilent) {
    return getProceduralFallbackBars(barCount);
  }

  return bars;
}

/**
 * Returns raw time-domain (waveform) data for oscilloscope rendering.
 */
export function getTimeDomainData(): Uint8Array<ArrayBuffer> | null {
  const analyser = getSharedAnalyser();
  if (!analyser || !timeDataBuffer) return null;
  analyser.getByteTimeDomainData(timeDataBuffer);
  return timeDataBuffer;
}

/**
 * Graceful tempo-synced procedural fallback simulation when audio plays behind strict CORS
 */
function getProceduralFallbackMetrics(bpm = 126, nowMs = Date.now()): AudioMetrics {
  const safeBpm = bpm > 30 && bpm < 260 ? bpm : 126;
  if (fallbackStartMs === 0) {
    fallbackStartMs = nowMs;
  }
  const elapsedSec = Math.max(0, (nowMs - fallbackStartMs) / 1000);
  const beatPhase = (elapsedSec * (safeBpm / 60)) % 1;
  // Fast-attack exponential-decay envelope synced to exact track BPM
  const kick = Math.exp(-beatPhase * 5.2);
  const isKickHit = beatPhase < 0.05;
  const bass = Math.min(1, kick * 0.85 + 0.08);
  const mid = Math.min(1, ((Math.sin(elapsedSec * Math.PI * (safeBpm / 60)) + 1) * 0.25) + 0.15);
  const treble = Math.min(1, ((Math.cos(elapsedSec * Math.PI * (safeBpm / 30)) + 1) * 0.2) + 0.1);
  const energy = Math.min(1, bass * 0.5 + mid * 0.3 + treble * 0.2);

  return {
    bass,
    mid,
    treble,
    energy,
    kick,
    isKickHit,
    beatPhase,
    effectiveBpm: safeBpm,
    rawBuffer: null,
  };
}

function getProceduralFallbackBars(barCount: number): number[] {
  const nowSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
  const bars: number[] = new Array(barCount).fill(0);
  const pulse = (Math.sin(nowSec * Math.PI * 4) + 1) * 0.5;

  for (let i = 0; i < barCount; i++) {
    const curve = Math.sin((i / barCount) * Math.PI);
    const jitter = Math.sin(nowSec * 6 + i * 0.5) * 0.15;
    const value = Math.max(0.08, (curve * 0.65 + pulse * 0.35 + jitter) * 0.85);
    bars[i] = Math.min(1, value);
  }

  return bars;
}
