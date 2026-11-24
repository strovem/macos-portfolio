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
 * Spotlight Search opening shimmer — soft rising glass shimmer (520Hz -> 780Hz, ~45ms)
 */
export function playSpotlightSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.045);

    gain.gain.setValueAtTime(vol * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  } catch {
    // ignore
  }
}

/**
 * Window minimize swoop — descending soft air transition (480Hz -> 210Hz, ~90ms)
 */
export function playMinimizeSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.09);

    gain.gain.setValueAtTime(vol * 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // ignore
  }
}

/**
 * Drag & Drop snap sound — satisfying tactile snap (low-pass triangle + transient, ~35ms)
 */
export function playDropSnapSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.035);

    gain.gain.setValueAtTime(vol * 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // ignore
  }
}

/**
 * Trash crumple effect — layered band-passed noise burst simulating paper crumple into trash (~160ms)
 */
export function playTrashCrumpleSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.16);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Procedural noise burst with modulated amplitude
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.5);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.16);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
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
 * Quick Look preview chime — macOS dual-tone crystal bell
 */
export function playQuickLookSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    [659.25, 987.77].forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.025);

      gain.gain.setValueAtTime(vol * 0.12, now + idx * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.025 + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.025);
      osc.stop(now + idx * 0.025 + 0.17);
    });
  } catch {
    // ignore
  }
}

/**
 * Paper crumple / Trash empty crunch
 */
export function playTrashSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.14;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  } catch {
    // ignore
  }
}

/**
 * Subtle toggle switch click
 */
export function playToggleSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(940, now + 0.015);

    gain.gain.setValueAtTime(vol * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
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

/**
 * Crisp macOS UI item click / selection sound
 */
export function playClickSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.018);

    gain.gain.setValueAtTime(vol * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.022);
  } catch {
    // ignore
  }
}

/**
 * Soft context menu open whisper
 */
export function playMenuOpenSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    gain.gain.setValueAtTime(vol * 0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // ignore
  }
}

/**
 * macOS glass notification chime — gentle 2-note glass chime (D5 -> A5)
 */
export function playNotificationSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;

    // Note 1: D5 (587.33Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(vol * 0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Note 2: A5 (880Hz) — slight delay for melodic two-tone chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.09);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(vol * 0.14, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.45);
  } catch {
    // ignore
  }
}

/**
 * macOS unlock sound — gentle organic pop/click
 */
export function playUnlockSound() {
  const ctx = getAudioContext();
  const vol = getMasterVolume();
  if (!ctx || vol <= 0) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);

    gain.gain.setValueAtTime(vol * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // ignore
  }
}


