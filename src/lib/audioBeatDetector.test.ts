import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { computeBandEnergy, createBeatDetector } = require('./audioBeatDetector.ts') as typeof import('./audioBeatDetector');

test('computeBandEnergy isolates 40-130Hz kick energy away from 1kHz vocals/mids', () => {
  // 2048 FFT size => 1024 bins at 48kHz sample rate => ~23.4375 Hz/bin
  const sampleRate = 48000;
  const bins = new Uint8Array(1024);

  // Inject loud 1kHz signal (~bin 43) with zero sub-bass/kick
  bins[42] = 255;
  bins[43] = 255;
  bins[44] = 255;

  const kickEnergy = computeBandEnergy(bins, sampleRate, 40, 130);
  const midEnergy = computeBandEnergy(bins, sampleRate, 250, 4000);

  assert.equal(kickEnergy, 0);
  assert.ok(midEnergy > 0, `expected non-zero midEnergy, got ${midEnergy}`);

  // Inject strong kick transient at ~70Hz (bin 3)
  bins.fill(0);
  bins[2] = 220;
  bins[3] = 255;
  bins[4] = 200;

  const activeKick = computeBandEnergy(bins, sampleRate, 40, 130);
  assert.ok(activeKick > 0.45, `expected strong kick energy > 0.45, got ${activeKick}`);
});

test('createBeatDetector triggers on kick transients, decays smoothly, and ignores flat sustain or silence', () => {
  const detector = createBeatDetector();

  // Silence produces zero kick envelope and no hits
  const silent = detector.step(0.01, 0, 126);
  assert.equal(silent.isKickHit, false);
  assert.equal(silent.kick, 0);

  // Feed quiet ambient baseline (~0.08) for a few frames
  for (let t = 16; t <= 160; t += 16) {
    const s = detector.step(0.08, t, 126);
    assert.equal(s.isKickHit, false);
  }

  // Sharp kick hit at t = 500ms -> should trigger hit & spike envelope
  const hit = detector.step(0.75, 500, 126);
  assert.equal(hit.isKickHit, true);
  assert.ok(hit.kick > 0.6, `expected spike kick > 0.6, got ${hit.kick}`);

  // Sustained flat high bass after the transient must NOT repeatedly fire kick hits
  let extraHits = 0;
  let lastKick = hit.kick;
  for (let t = 516; t <= 820; t += 16) {
    const sustain = detector.step(0.65, t, 126);
    if (sustain.isKickHit) extraHits += 1;
    assert.ok(sustain.kick <= lastKick + 1e-6, `envelope should decay during flat sustain, prev=${lastKick} curr=${sustain.kick}`);
    lastKick = sustain.kick;
  }
  assert.equal(extraHits, 0);
  assert.ok(lastKick < hit.kick * 0.45, `expected substantial decay after 320ms, got ${lastKick}`);
});

test('createBeatDetector locks phase and estimates tempo across periodic kicks and resets cleanly', () => {
  const detector = createBeatDetector(120);

  // Instant kick right after reset should still trigger immediately
  const firstHit = detector.step(0.85, 0, 130);
  assert.equal(firstHit.isKickHit, true);
  assert.equal(firstHit.beatPhase, 0);

  // Simulate 130 BPM kick every ~461.5ms (at 16ms frame steps)
  const beatIntervalMs = 60000 / 130;
  let nextKickAt = beatIntervalMs;
  let hitCount = 0;
  let lastState = firstHit;

  for (let t = 16; t <= 2400; t += 16) {
    let energy = 0.06;
    if (t >= nextKickAt) {
      energy = 0.82;
      nextKickAt += beatIntervalMs;
    }
    lastState = detector.step(energy, t, 130);
    if (lastState.isKickHit) hitCount += 1;
  }

  assert.ok(hitCount >= 4 && hitCount <= 6, `expected 4-6 kick hits over 2.4s at 130 BPM, got ${hitCount}`);
  assert.ok(
    lastState.effectiveBpm >= 125 && lastState.effectiveBpm <= 136,
    `expected effectiveBpm near 130, got ${lastState.effectiveBpm}`
  );

  // Switching to a slower 85 BPM track via reset() clears residual envelope and updates BPM
  detector.reset(85);
  const afterReset = detector.step(0.02, 2416, 85);
  assert.equal(afterReset.kick, 0);
  assert.equal(afterReset.effectiveBpm, 85);
});

test('createBeatDetector still detects kicks during loud mastered club sub-bass baseline (~0.78)', () => {
  const detector = createBeatDetector(126);

  // Warm up high continuous sub-bass floor around 0.78
  for (let t = 0; t <= 1200; t += 16) {
    detector.step(0.78, t, 126);
  }

  // Feed 4 club kicks peaking at 0.94 over the 0.78 rolling sub-bass floor at 126 BPM (~476ms)
  let hits = 0;
  for (let beat = 1; beat <= 4; beat++) {
    const beatMs = 1200 + beat * 476;
    for (let t = beatMs - 400; t < beatMs; t += 16) {
      detector.step(0.78, t, 126);
    }
    const res = detector.step(0.94, beatMs, 126);
    if (res.isKickHit) hits += 1;
  }

  assert.equal(hits, 4, `expected all 4 kicks over heavy sub-bass floor to trigger, got ${hits}`);
});

test('createBeatDetector triggers on softer tracks and 2-frame ramped kick transients', () => {
  const detector = createBeatDetector(95);

  // Quiet floor around 0.06 (e.g. lo-fi / low user volume)
  for (let t = 0; t <= 900; t += 16) {
    detector.step(0.06, t, 95);
  }

  // Simulate 4 beats at 95 BPM (~631ms) where kick ramps gradually over 2 frames: 0.06 -> 0.12 -> 0.19
  let hits = 0;
  let maxKick = 0;
  for (let beat = 1; beat <= 4; beat++) {
    const beatMs = 900 + beat * 632;
    for (let t = beatMs - 550; t < beatMs - 32; t += 16) {
      const decay = detector.step(0.06, t, 95);
      if (decay.isKickHit) hits += 1;
    }
    const r1 = detector.step(0.12, beatMs - 16, 95);
    const r2 = detector.step(0.19, beatMs, 95);
    if (r1.isKickHit || r2.isKickHit) hits += 1;
    maxKick = Math.max(maxKick, r1.kick, r2.kick);
  }

  assert.equal(hits, 4, `expected all 4 softer ramped kicks to trigger, got ${hits}`);
  assert.ok(maxKick > 0.5, `expected strong normalized kick visual > 0.5 on soft track, got ${maxKick}`);
});

test('createBeatDetector catches compressed 3-frame kicks (~0.38 -> 0.44) and low-volume kicks (~0.04 -> 0.11)', () => {
  // Case 1: Low-volume listening (peak ~0.11 over 0.04 floor)
  const lowVol = createBeatDetector(118);
  for (let t = 0; t <= 600; t += 16) lowVol.step(0.04, t, 118);
  let lowHits = 0;
  for (let beat = 1; beat <= 4; beat++) {
    const beatMs = 600 + beat * 508;
    for (let t = beatMs - 440; t < beatMs - 32; t += 16) lowVol.step(0.04, t, 118);
    const s1 = lowVol.step(0.08, beatMs - 16, 118);
    const s2 = lowVol.step(0.11, beatMs, 118);
    if (s1.isKickHit || s2.isKickHit) lowHits += 1;
  }
  assert.equal(lowHits, 4, `expected 4 low-volume kicks to trigger, got ${lowHits}`);

  // Case 2: Compressed house groove where kick ramps over 3 FFT frames (+0.02/frame above 0.38 floor)
  const comp = createBeatDetector(125);
  for (let t = 0; t <= 800; t += 16) comp.step(0.38, t, 125);
  let compHits = 0;
  for (let beat = 1; beat <= 4; beat++) {
    const beatMs = 800 + beat * 480;
    for (let t = beatMs - 420; t < beatMs - 48; t += 16) comp.step(0.38, t, 125);
    const s1 = comp.step(0.40, beatMs - 32, 125);
    const s2 = comp.step(0.42, beatMs - 16, 125);
    const s3 = comp.step(0.44, beatMs, 125);
    if (s1.isKickHit || s2.isKickHit || s3.isKickHit) compHits += 1;
  }
  assert.equal(compHits, 4, `expected 4 compressed groove kicks to trigger, got ${compHits}`);
});
