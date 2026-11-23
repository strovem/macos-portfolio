// Lightweight, zero-dependency procedural Web Audio UI sound effects
// Respects useSettingsStore soundEnabled and volume

import { useSettingsStore } from '@/stores/useSettingsStore';

let sfxAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sfxAudioCtx) {
      sfxAudioCtx = new AudioCtx();
    }
    if (sfxAudioCtx.state === 'suspended') {
      sfxAudioCtx.resume();
    }
    return sfxAudioCtx;
  } catch {
    return null;
  }
}

function getMasterVolume(): number {
  try {
    const { soundEnabled, volume } = useSettingsStore.getState();
    if (!soundEnabled) return 0;
    return Math.max(0, Math.min(1, volume / 100));
  } catch {
    return 0.5;
  }
}

/**
 * Window open pop — soft rising acoustic chime (300Hz -> 580Hz)
 */
export function playWindowOpenSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);

    gain.gain.setValueAtTime(vol * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // ignore
  }
}

/**
 * Window close click — soft descending tap (450Hz -> 200Hz)
 */
export function playWindowCloseSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

    gain.gain.setValueAtTime(vol * 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // ignore
  }
}

/**
 * Dock item tap — subtle acoustic bubble pop
 */
export function playDockClickSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.05);

    gain.gain.setValueAtTime(vol * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // ignore
  }
}

/**
 * Message sent whoosh — authentic ascending swoosh tone
 */
export function playMessageSentSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(660, now);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

    gain.gain.setValueAtTime(vol * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.2);
    osc2.stop(now + 0.2);
  } catch {
    // ignore
  }
}
