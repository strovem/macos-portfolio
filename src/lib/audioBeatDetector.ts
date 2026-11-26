/**
 * Pure DSP helpers for frequency-band isolation, half-wave rectified spectral flux,
 * asymmetric adaptive kick onset detection, and tempo-locked beat phase tracking.
 */

export function computeBandEnergy(
  freqData: Uint8Array,
  sampleRate: number,
  lowHz: number,
  highHz: number
): number {
  const binCount = freqData.length;
  if (binCount === 0 || sampleRate <= 0 || highHz <= lowHz) {
    return 0;
  }

  const nyquist = sampleRate / 2;
  const binHz = nyquist / binCount;
  const startBin = Math.max(0, Math.floor(lowHz / binHz));
  const endBin = Math.min(binCount - 1, Math.ceil(highHz / binHz));

  if (endBin < startBin) {
    return 0;
  }

  let sum = 0;
  let peak = 0;
  const count = endBin - startBin + 1;

  for (let i = startBin; i <= endBin; i++) {
    const val = freqData[i] / 255;
    sum += val;
    if (val > peak) {
      peak = val;
    }
  }

  const mean = sum / count;
  // Blend mean energy and narrow-band peak so crisp kicks aren't diluted across bins
  return Math.min(1, Math.max(0, mean * 0.65 + peak * 0.35));
}

export function computeSpectralFlux(
  currBins: Uint8Array,
  prevBins: Uint8Array | null,
  sampleRate: number,
  lowHz: number,
  highHz: number
): number {
  const binCount = currBins.length;
  if (!prevBins || prevBins.length !== binCount || binCount === 0 || sampleRate <= 0 || highHz <= lowHz) {
    return 0;
  }

  const nyquist = sampleRate / 2;
  const binHz = nyquist / binCount;
  const startBin = Math.max(0, Math.floor(lowHz / binHz));
  const endBin = Math.min(binCount - 1, Math.ceil(highHz / binHz));

  if (endBin < startBin) {
    return 0;
  }

  let sum = 0;
  let maxJump = 0;
  const count = endBin - startBin + 1;

  for (let i = startBin; i <= endBin; i++) {
    const diff = currBins[i] - prevBins[i];
    if (diff > 0) {
      const norm = diff / 255;
      sum += norm;
      if (norm > maxJump) {
        maxJump = norm;
      }
    }
  }

  const meanFlux = sum / count;
  return Math.min(1, Math.max(0, meanFlux * 0.55 + maxJump * 0.45));
}

export interface BeatDetectorState {
  kick: number;
  isKickHit: boolean;
  beatPhase: number;
  effectiveBpm: number;
  normalizedBass: number;
}

export interface BeatDetector {
  step: (kickEnergy: number, nowMs: number, fallbackBpm: number) => BeatDetectorState;
  stepSpectrum: (
    freqData: Uint8Array,
    sampleRate: number,
    nowMs: number,
    fallbackBpm: number
  ) => BeatDetectorState;
  reset: (fallbackBpm?: number) => void;
}

export function createBeatDetector(initialBpm = 126): BeatDetector {
  let prevEnergy = 0;
  let avgEnergy = 0;
  let avgFlux = 0;
  let rollingPeak = 0.14;
  let kickEnvelope = 0;
  let lastFrameMs: number | null = null;
  let lastKickMs: number | null = null;
  let effectiveBpm = initialBpm;
  let beatPhase = 0;
  let ioiWindow: number[] = [];
  let prevBins: Uint8Array | null = null;
  let hasPrevSpectrum = false;

  const reset = (fallbackBpm = initialBpm) => {
    prevEnergy = 0;
    avgEnergy = 0;
    avgFlux = 0;
    rollingPeak = 0.14;
    kickEnvelope = 0;
    lastFrameMs = null;
    lastKickMs = null;
    effectiveBpm = fallbackBpm;
    beatPhase = 0;
    ioiWindow = [];
    hasPrevSpectrum = false;
    if (prevBins) {
      prevBins.fill(0);
    }
  };

  const processStep = (
    kickEnergy: number,
    spectralFlux: number,
    nowMs: number,
    fallbackBpm: number
  ): BeatDetectorState => {
    const safeBpm = fallbackBpm > 30 && fallbackBpm < 260 ? fallbackBpm : 126;
    if (ioiWindow.length === 0) {
      effectiveBpm = safeBpm;
    }
    const clampedEnergy = Math.min(1, Math.max(0, kickEnergy));

    const isFirstFrame = lastFrameMs === null;
    const dtMs = isFirstFrame ? 16.67 : Math.max(0, Math.min(100, nowMs - lastFrameMs!));
    lastFrameMs = nowMs;

    if (isFirstFrame) {
      avgEnergy = clampedEnergy * 0.85;
    }

    // Auto-gain peak tracker (~2.2s decay) keeps quiet parts calmer than drops while recovering cleanly
    const peakDecay = Math.exp(-dtMs / 2200);
    rollingPeak = Math.max(0.16, rollingPeak * peakDecay, clampedEnergy);

    // Frame-rate independent kick decay (~130ms time constant for crisp groove without blur)
    if (kickEnvelope > 0) {
      kickEnvelope *= Math.exp(-dtMs / 130);
      if (kickEnvelope < 0.004) kickEnvelope = 0;
    }

    // Advance beat phase smoothly by effective tempo
    beatPhase = (beatPhase + (dtMs / 1000) * (effectiveBpm / 60)) % 1;

    // Asymmetric baselines: rise slowly (~550ms) so kicks stand out, drop quickly (~170ms) after drops end
    const riseAlpha = 1 - Math.exp(-dtMs / 550);
    const fallAlpha = 1 - Math.exp(-dtMs / 170);
    const energyAlpha = clampedEnergy < avgEnergy ? fallAlpha : riseAlpha;
    const fluxAlpha = spectralFlux < avgFlux ? fallAlpha : riseAlpha;

    const scalarFlux = clampedEnergy - prevEnergy;
    prevEnergy = clampedEnergy;

    // Groove-locked cooldown (215-370ms) suppresses off-beat half-beat chatter while catching real beats
    const minCooldownMs = Math.max(215, Math.min(370, (60000 / effectiveBpm) * 0.62));
    const cooldownElapsed = lastKickMs === null || nowMs - lastKickMs >= minCooldownMs;

    const margin = Math.min(0.11, Math.max(0.032, avgEnergy * 0.08 + 0.024));
    const scalarThreshold = Math.max(0.095, Math.min(0.92, avgEnergy + margin));
    const scalarTriggered =
      clampedEnergy >= 0.095 && clampedEnergy > scalarThreshold && scalarFlux > 0.007;

    const fluxThreshold = Math.max(0.032, avgFlux * 1.75 + 0.022);
    const fluxTriggered =
      spectralFlux > 0 && clampedEnergy >= 0.075 && spectralFlux > fluxThreshold;

    let isKickHit = false;
    if (cooldownElapsed && (scalarTriggered || fluxTriggered)) {
      isKickHit = true;

      if (lastKickMs !== null) {
        const ioi = nowMs - lastKickMs;
        if (ioi >= 260 && ioi <= 1500) {
          let candidateBpm = 60000 / ioi;
          while (candidateBpm < safeBpm * 0.65) candidateBpm *= 2;
          while (candidateBpm > safeBpm * 1.45) candidateBpm /= 2;
          ioiWindow.push(candidateBpm);
          if (ioiWindow.length > 6) ioiWindow.shift();
          const meanBpm = ioiWindow.reduce((a, b) => a + b, 0) / ioiWindow.length;
          effectiveBpm = effectiveBpm * 0.6 + meanBpm * 0.4;
        }
      }

      lastKickMs = nowMs;
      beatPhase = 0; // Phase-lock beat cycle to the real kick hit

      const dynamicSpan = Math.max(0.08, rollingPeak - avgEnergy);
      const scalarDrive = Math.min(1, Math.max(0, clampedEnergy - avgEnergy) / dynamicSpan);
      const fluxDrive = Math.min(1, spectralFlux / 0.16);
      const drive = Math.max(scalarDrive, fluxDrive * 0.9);
      const hitLevel = Math.min(1, 0.36 + drive * 0.64);
      kickEnvelope = Math.max(kickEnvelope, hitLevel);
    }

    avgEnergy = avgEnergy * (1 - energyAlpha) + clampedEnergy * energyAlpha;
    avgFlux = avgFlux * (1 - fluxAlpha) + spectralFlux * fluxAlpha;

    const normalizedBass =
      clampedEnergy < 0.035
        ? 0
        : Math.min(1, clampedEnergy / Math.max(0.18, rollingPeak));

    return {
      kick: kickEnvelope,
      isKickHit,
      beatPhase,
      effectiveBpm,
      normalizedBass,
    };
  };

  const step = (
    kickEnergy: number,
    nowMs: number,
    fallbackBpm: number
  ): BeatDetectorState => processStep(kickEnergy, 0, nowMs, fallbackBpm);

  const stepSpectrum = (
    freqData: Uint8Array,
    sampleRate: number,
    nowMs: number,
    fallbackBpm: number
  ): BeatDetectorState => {
    if (!prevBins || prevBins.length !== freqData.length) {
      prevBins = new Uint8Array(freqData.length);
      hasPrevSpectrum = false;
    }
    const kickEnergy = computeBandEnergy(freqData, sampleRate, 35, 165);
    const fluxScore = hasPrevSpectrum
      ? computeSpectralFlux(freqData, prevBins, sampleRate, 40, 240)
      : 0;
    prevBins.set(freqData);
    hasPrevSpectrum = true;
    return processStep(kickEnergy, fluxScore, nowMs, fallbackBpm);
  };

  return { step, stepSpectrum, reset };
}
