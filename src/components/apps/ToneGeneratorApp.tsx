'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play, Square, Activity, Sparkles, Plus, Minus, RotateCcw } from 'lucide-react';

const PRESET_FREQUENCIES = [
  { label: '55 Hz', val: 55, desc: 'Sub Bass (A1)' },
  { label: '432 Hz', val: 432, desc: 'Verdi Tuning' },
  { label: '440 Hz', val: 440, desc: 'Concert A' },
  { label: '528 Hz', val: 528, desc: 'Solfeggio (Miracle)' },
  { label: '1000 Hz', val: 1000, desc: '1 kHz Ref' },
];

export function ToneGeneratorApp() {
  const [frequency, setFrequency] = useState<number>(440);
  const [volume, setVolume] = useState<number>(0.18);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phase, setPhase] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Web Audio Context
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    return audioCtxRef.current;
  }, []);

  // Update frequency in real time without audio glitch
  const updateFrequency = useCallback((newFreq: number) => {
    const clamped = Math.max(20, Math.min(20000, Math.round(newFreq)));
    setFrequency(clamped);

    if (oscRef.current && audioCtxRef.current) {
      try {
        oscRef.current.frequency.setTargetAtTime(
          clamped,
          audioCtxRef.current.currentTime,
          0.02
        );
      } catch {
        oscRef.current.frequency.value = clamped;
      }
    }
  }, []);

  // Update volume
  const updateVolume = useCallback((newVol: number) => {
    setVolume(newVol);
    if (gainRef.current && audioCtxRef.current && !isMuted) {
      gainRef.current.gain.setTargetAtTime(newVol, audioCtxRef.current.currentTime, 0.02);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = () => {
    if (gainRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? volume : 0;
      gainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.02);
    }
    setIsMuted(!isMuted);
  };

  // Start pure sine tone
  const startTone = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {}
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pure Sine Wave
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      const effectiveGain = isMuted ? 0 : volume;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(effectiveGain, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch (err) {
      console.error('Tone generator error:', err);
    }
  }, [frequency, volume, isMuted, getAudioContext]);

  // Stop pure sine tone
  const stopTone = useCallback(() => {
    if (gainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      try {
        gainRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        setTimeout(() => {
          try {
            oscRef.current?.stop();
            oscRef.current?.disconnect();
            oscRef.current = null;
          } catch {}
          setIsPlaying(false);
        }, 50);
      } catch {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopTone();
    } else {
      startTone();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        oscRef.current?.stop();
        oscRef.current?.disconnect();
        audioCtxRef.current?.close();
      } catch {}
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Live Oscilloscope animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let curPhase = 0;
    const animate = () => {
      const speed = Math.min(0.28, Math.max(0.05, (frequency / 440) * 0.12));
      curPhase += speed;
      setPhase(curPhase);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, frequency]);

  // Generate SVG Sine Wave Path
  const renderSineWavePath = () => {
    const width = 360;
    const height = 80;
    const centerY = height / 2;
    const amplitude = isPlaying ? 26 : 10;
    const cycles = Math.min(10, Math.max(2, Math.log10(Math.max(20, frequency)) * 2.2));

    let path = `M 0 ${centerY}`;
    const step = 2;
    for (let x = 0; x <= width; x += step) {
      const angle = (x / width) * cycles * 2 * Math.PI + (isPlaying ? phase : 0);
      const y = centerY + Math.sin(angle) * amplitude;
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 text-white select-none overflow-y-auto custom-scrollbar font-sans">
      {/* Top App Toolbar */}
      <div className="h-10 px-4 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <Volume2 className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-neutral-200">Tone Generator</span>
          <span className="text-[10px] text-neutral-500 font-mono">v3.0 • Pure Sine</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold transition-all ${
              isPlaying
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                : 'bg-white/5 text-neutral-400'
            }`}
          >
            {isPlaying ? 'ACTIVE • GENERATING' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Main Studio Console Content */}
      <div className="p-5 flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Oscilloscope Screen */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-inner flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Activity className={`w-4 h-4 ${isPlaying ? 'text-cyan-400' : 'text-neutral-600'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">OSCILLOSCOPE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 font-mono">SINE WAVE</span>
              <span className="text-cyan-400 font-bold text-sm tracking-tight">{frequency} Hz</span>
            </div>
          </div>

          {/* Graphical Display */}
          <div className="relative w-full h-24 rounded-xl bg-black/80 border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <svg viewBox="0 0 360 80" className="w-full h-full relative z-10" fill="none">
              <path
                d={renderSineWavePath()}
                stroke={isPlaying ? 'url(#cyanSineGradApp)' : 'rgba(6, 182, 212, 0.4)'}
                strokeWidth={isPlaying ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="cyanSineGradApp" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Custom Frequency Input & Steppers */}
        <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-white/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>FREQUENCY (Hz):</span>
            <span className="text-[10px] text-neutral-500">20 Hz — 20,000 Hz</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateFrequency(frequency - 10)}
                title="-10 Hz"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateFrequency(frequency - 1)}
                title="-1 Hz"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer active:scale-95 transition-all"
              >
                -1
              </button>
            </div>

            {/* Editable Custom Number Box */}
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-black/80 border border-cyan-500/50 rounded-xl px-3 py-1.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 transition-all">
              <input
                type="number"
                min={20}
                max={20000}
                step={1}
                value={frequency}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) updateFrequency(val);
                }}
                className="w-24 text-center font-mono font-bold text-xl bg-transparent text-cyan-300 focus:outline-none"
              />
              <span className="text-sm font-mono font-bold text-neutral-400">Hz</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateFrequency(frequency + 1)}
                title="+1 Hz"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer active:scale-95 transition-all"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => updateFrequency(frequency + 10)}
                title="+10 Hz"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Frequency Slider */}
          <div className="w-full flex items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-neutral-500">20Hz</span>
            <input
              type="range"
              min={20}
              max={3000}
              step={1}
              value={Math.min(3000, frequency)}
              onChange={(e) => updateFrequency(Number(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
            <span className="text-[10px] font-mono text-neutral-500">3kHz</span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {PRESET_FREQUENCIES.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => updateFrequency(p.val)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer text-center ${
                  frequency === p.val
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                <div className="font-bold">{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Output Control */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-950/60 border border-white/5 text-xs">
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-2 text-neutral-400 hover:text-white cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="font-mono text-[11px]">{isMuted ? 'MUTED' : 'VOLUME'}</span>
          </button>

          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => updateVolume(Number(e.target.value))}
            className="w-36 accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
          />
          <span className="font-mono text-[10px] text-neutral-500 w-8 text-right">
            {isMuted ? '0%' : `${Math.round((volume / 0.5) * 100)}%`}
          </span>
        </div>

        {/* Big Master PLAY / STOP Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-full py-3.5 rounded-2xl font-mono text-sm font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.45)]'
              : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-[0_4px_16px_rgba(79,70,229,0.4)] active:translate-y-0.5'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>STOP SINE WAVE ({frequency} Hz)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>PLAY SINE WAVE ({frequency} Hz)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
