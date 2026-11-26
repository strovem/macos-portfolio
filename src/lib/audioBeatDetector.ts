/**
 * Pure DSP helpers for frequency-band isolation, adaptive kick onset detection,
 * and tempo-locked beat phase tracking.
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

export interface BeatDetectorState {
  kick: number;
  isKickHit: boolean;
  beatPhase: number;
  effectiveBpm: number;
}

export interface BeatDetector {
  step: (kickEnergy: number, nowMs: number, fallbackBpm: number) => BeatDetectorState;
  reset: (fallbackBpm?: number) => void;
}

export function createBeatDetector(initialBpm = 126): BeatDetector {
  let prevEnergy = 0;
  let avgEnergy = 0;
  let rollingPeak = 0.12;
  let kickEnvelope = 0;
  let lastFrameMs: number | null = null;
  let lastKickMs: number | null = null;
  let effectiveBpm = initialBpm;
  let beatPhase = 0;
  let ioiWindow: number[] = [];

  const reset = (fallbackBpm = initialBpm) => {
    prevEnergy = 0;
    avgEnergy = 0;
    rollingPeak = 0.12;
    kickEnvelope = 0;
    lastFrameMs = null;
    lastKickMs = null;
    effectiveBpm = fallbackBpm;
    beatPhase = 0;
    ioiWindow = [];
  };

  const step = (
    kickEnergy: number,
    nowMs: number,
    fallbackBpm: number
  ): BeatDetectorState => {
    const safeBpm = fallbackBpm > 30 && fallbackBpm < 260 ? fallbackBpm : 126;
    if (ioiWindow.length === 0) {
      effectiveBpm = safeBpm;
    }
    const clampedEnergy = Math.min(1, Math.max(0, kickEnergy));

    const dtMs =
      lastFrameMs === null ? 16.67 : Math.max(0, Math.min(100, nowMs - lastFrameMs));
    lastFrameMs = nowMs;

    // Auto-gain peak tracker (~3.5s decay) keeps soft tracks & lower volumes expressive
    const peakDecay = Math.exp(-dtMs / 3500);
    rollingPeak = Math.max(0.1, rollingPeak * peakDecay, clampedEnergy);

    // Frame-rate independent decay (~150ms time constant for visible punch without blur)
    if (kickEnvelope > 0) {
      kickEnvelope *= Math.exp(-dtMs / 150);
      if (kickEnvelope < 0.004) kickEnvelope = 0;
    }

    // Advance beat phase smoothly by effective tempo
    beatPhase = (beatPhase + (dtMs / 1000) * (effectiveBpm / 60)) % 1;

    // Exponential moving baseline over ~420ms
    const alpha = 1 - Math.exp(-dtMs / 420);

    const flux = clampedEnergy - prevEnergy;
    prevEnergy = clampedEnergy;

    // Tempo-scaled cooldown (150-280ms) catches fast club double-kicks without double-firing on a single hit
    const minCooldownMs = Math.max(150, Math.min(280, (60000 / effectiveBpm) * 0.45));
    // Sensitive adaptive margin handles quiet listening, compressed grooves, and loud club mixes alike
    const margin = Math.min(0.085, Math.max(0.022, avgEnergy * 0.08 + 0.018));
    const threshold = Math.max(0.085, Math.min(0.92, avgEnergy + margin));
    const cooldownElapsed = lastKickMs === null || nowMs - lastKickMs >= minCooldownMs;

    let isKickHit = false;
    if (
      clampedEnergy >= 0.085 &&
      clampedEnergy > threshold &&
      flux > 0.005 &&
      cooldownElapsed
    ) {
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

      const dynamicSpan = Math.max(0.06, rollingPeak - avgEnergy);
      const normalizedOvershoot = Math.min(1, Math.max(0, clampedEnergy - avgEnergy) / dynamicSpan);
      const hitLevel = Math.min(1, 0.58 + normalizedOvershoot * 0.42);
      kickEnvelope = Math.max(kickEnvelope, hitLevel);
    }

    avgEnergy = avgEnergy * (1 - alpha) + clampedEnergy * alpha;

    return {
      kick: kickEnvelope,
      isKickHit,
      beatPhase,
      effectiveBpm,
    };
  };

  return { step, reset };
}
