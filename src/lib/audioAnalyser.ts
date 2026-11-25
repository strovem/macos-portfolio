'use client';

/**
 * Singleton Web Audio AnalyserNode FFT Frequency Engine
 * Provides real-time frequency analysis (60 FPS, non-blocking, zero React state re-render)
 * with graceful CORS fallback and safe MediaElementSource guards.
 */

let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let freqDataBuffer: Uint8Array<ArrayBuffer> | null = null;
let timeDataBuffer: Uint8Array<ArrayBuffer> | null = null;

// WeakMap guards to guarantee createMediaElementSource is called exactly once per HTMLAudioElement
const connectedMediaElements = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
const connectedNodes = new WeakSet<AudioNode>();

// Internal timing for graceful CORS/silence fallback simulation
let fallbackPhase = 0;

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
    sharedAnalyser.fftSize = 256; // 128 frequency bins
    sharedAnalyser.smoothingTimeConstant = 0.8;
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
  bass: number; // 0.0 - 1.0 (approx 20Hz - 250Hz, bins 0-8)
  mid: number; // 0.0 - 1.0 (approx 250Hz - 4kHz, bins 9-45)
  treble: number; // 0.0 - 1.0 (approx 4kHz - 16kHz, bins 46-127)
  energy: number; // 0.0 - 1.0 (RMS / overall average)
  rawBuffer: Uint8Array | null;
}

/**
 * Extracts normalized 0-1 metrics from the current FFT frame.
 * If the buffer is completely silent (due to CORS restrictions or track loading),
 * gracefully blends a procedural musical pulse so visualizers never freeze.
 */
export function getAudioMetrics(isPlaying = false): AudioMetrics {
  if (!isPlaying && !sharedAnalyser) {
    return { bass: 0, mid: 0, treble: 0, energy: 0, rawBuffer: null };
  }
  const analyser = getSharedAnalyser();

  if (!analyser || !freqDataBuffer) {
    if (isPlaying) {
      return getProceduralFallbackMetrics();
    }
    return { bass: 0, mid: 0, treble: 0, energy: 0, rawBuffer: null };
  }

  analyser.getByteFrequencyData(freqDataBuffer);

  // Calculate sum of energies across bands
  let totalSum = 0;
  let bassSum = 0;
  let midSum = 0;
  let trebleSum = 0;

  const binCount = freqDataBuffer.length;
  const bassEnd = Math.floor(binCount * 0.08); // Bins 0-10 (~0-350Hz)
  const midEnd = Math.floor(binCount * 0.4); // Bins 11-51 (~350-4000Hz)

  for (let i = 0; i < binCount; i++) {
    const val = freqDataBuffer[i];
    totalSum += val;
    if (i <= bassEnd) {
      bassSum += val;
    } else if (i <= midEnd) {
      midSum += val;
    } else {
      trebleSum += val;
    }
  }

  const rawEnergy = totalSum / (binCount * 255);

  // If track is playing but CORS zeroed out frequency data, fallback to smooth procedural beat
  if (isPlaying && rawEnergy < 0.005) {
    return getProceduralFallbackMetrics();
  }

  const bassCount = Math.max(1, bassEnd + 1);
  const midCount = Math.max(1, midEnd - bassEnd);
  const trebleCount = Math.max(1, binCount - midEnd);

  return {
    bass: Math.min(1, Math.max(0, bassSum / (bassCount * 255))),
    mid: Math.min(1, Math.max(0, midSum / (midCount * 255))),
    treble: Math.min(1, Math.max(0, trebleSum / (trebleCount * 255))),
    energy: Math.min(1, Math.max(0, rawEnergy)),
    rawBuffer: freqDataBuffer,
  };
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
  const binCount = freqDataBuffer.length;
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
 * Graceful procedural fallback simulation when audio is playing but CORS blocks FFT read
 */
function getProceduralFallbackMetrics(): AudioMetrics {
  fallbackPhase += 0.08;
  const pulse = (Math.sin(fallbackPhase * 4) + 1) * 0.5;
  const bass = Math.pow(pulse, 3) * 0.75 + Math.random() * 0.12;
  const mid = (Math.sin(fallbackPhase * 2.5) + 1) * 0.35 + Math.random() * 0.08;
  const treble = (Math.cos(fallbackPhase * 5) + 1) * 0.25 + Math.random() * 0.05;
  const energy = bass * 0.5 + mid * 0.3 + treble * 0.2;

  return {
    bass: Math.min(1, bass),
    mid: Math.min(1, mid),
    treble: Math.min(1, treble),
    energy: Math.min(1, energy),
    rawBuffer: null,
  };
}

function getProceduralFallbackBars(barCount: number): number[] {
  fallbackPhase += 0.06;
  const bars: number[] = new Array(barCount).fill(0);
  const pulse = (Math.sin(fallbackPhase * 4) + 1) * 0.5;

  for (let i = 0; i < barCount; i++) {
    const curve = Math.sin((i / barCount) * Math.PI);
    const jitter = Math.sin(fallbackPhase * 2 + i * 0.5) * 0.15;
    const value = Math.max(0.08, (curve * 0.65 + pulse * 0.35 + jitter) * 0.85);
    bars[i] = Math.min(1, value);
  }

  return bars;
}
