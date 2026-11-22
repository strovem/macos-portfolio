'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DesktopCardItem } from '@/types/os';
import { Volume2, Play, Square, Activity, Folder, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectPreviewCardProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

const PRESET_FREQUENCIES = [
  { label: '432 Hz', val: 432, desc: 'Verdi' },
  { label: '440 Hz', val: 440, desc: 'Concert A' },
  { label: '528 Hz', val: 528, desc: 'Solfeggio' },
  { label: '1000 Hz', val: 1000, desc: '1 kHz Test' },
];

export function ProjectPreviewCard({ item, onOpenApp }: ProjectPreviewCardProps) {
  const [frequency, setFrequency] = useState<number>(440);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [phase, setPhase] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or get Web Audio Context
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

  // Update frequency in real time
  const updateFrequency = useCallback((newFreq: number) => {
    // Clamp between 20 Hz and 20,000 Hz
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
        // Fallback
        oscRef.current.frequency.value = clamped;
      }
    }
  }, []);

  // Start sine tone
  const startTone = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop existing if any
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

      // Smooth attack to avoid audio click/pop
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch (err) {
      console.error('Tone generator error:', err);
    }
  }, [frequency, getAudioContext]);

  // Stop sine tone
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

  // Toggle play/stop
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Oscilloscope Sine Wave Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let curPhase = 0;
    const animate = () => {
      // Visual oscillation speed
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
    const width = 230;
    const height = 48;
    const centerY = height / 2;
    const amplitude = isPlaying ? 16 : 8;

    // Visual cycle count based on log frequency (2 to 8 cycles)
    const cycles = Math.min(8, Math.max(2, Math.log10(Math.max(20, frequency)) * 2));

    let path = `M 0 ${centerY}`;
    const step = 3;
    for (let x = 0; x <= width; x += step) {
      const angle = (x / width) * cycles * 2 * Math.PI + (isPlaying ? phase : 0);
      const y = centerY + Math.sin(angle) * amplitude;
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  return (
    <div className="relative w-72 p-3.5 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-neutral-900/90 border border-black/10 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-neutral-100 leading-tight">
              Online Tone Generator
            </div>
            <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
              Pure Sine Wave Synthesizer
            </div>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold transition-colors ${
            isPlaying
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
              : 'bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-300'
          }`}
        >
          {isPlaying ? 'ACTIVE • SINE' : 'SINE WAVE'}
        </span>
      </div>

      {/* Oscilloscope Display & Waveform Area */}
      <div className="relative p-2.5 rounded-xl bg-gradient-to-b from-neutral-950 to-slate-950 border border-neutral-800 shadow-inner flex flex-col items-center gap-2.5 my-2">
        {/* Oscilloscope Screen Header */}
        <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-400' : 'text-neutral-600'}`} />
            <span className="text-[9px] uppercase tracking-wider">OSCILLOSCOPE</span>
          </div>
          <span className="text-cyan-400 font-bold">{frequency} Hz</span>
        </div>

        {/* Live Mathematical Sine Wave SVG Canvas */}
        <div className="relative w-full h-12 rounded-lg bg-black/60 border border-cyan-500/20 overflow-hidden flex items-center justify-center">
          {/* Subtle oscilloscope grid background */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <svg viewBox="0 0 230 48" className="w-full h-full relative z-10" fill="none">
            <path
              d={renderSineWavePath()}
              stroke={isPlaying ? 'url(#cyanSineGlow)' : 'rgba(6, 182, 212, 0.4)'}
              strokeWidth={isPlaying ? 2.2 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="cyanSineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Custom Frequency Input Row */}
        <div className="flex items-center justify-between w-full gap-2 px-1 pt-0.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFrequency(frequency - 10);
              }}
              title="-10 Hz"
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono cursor-pointer transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFrequency(frequency - 1);
              }}
              title="-1 Hz"
              className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono cursor-pointer transition-colors"
            >
              -1
            </button>
          </div>

          {/* Editable Custom Number Input */}
          <div className="flex items-center gap-1 bg-black/60 border border-cyan-500/40 rounded-lg px-2 py-0.5 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400">
            <input
              type="number"
              min={20}
              max={20000}
              step={1}
              value={frequency}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) updateFrequency(val);
              }}
              className="w-18 text-right font-mono font-bold text-sm bg-transparent text-cyan-300 focus:outline-none"
            />
            <span className="text-xs font-mono font-bold text-neutral-400">Hz</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFrequency(frequency + 1);
              }}
              title="+1 Hz"
              className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono cursor-pointer transition-colors"
            >
              +1
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFrequency(frequency + 10);
              }}
              title="+10 Hz"
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Preset Frequency Pills */}
        <div className="grid grid-cols-4 gap-1 w-full pt-0.5">
          {PRESET_FREQUENCIES.map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateFrequency(preset.val);
              }}
              className={`py-1 rounded text-[10px] font-mono transition-all cursor-pointer text-center ${
                frequency === preset.val
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Master Sine Play / Stop Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-1 ${
            isPlaying
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-[0_4px_12px_rgba(79,70,229,0.35)] active:translate-y-0.5'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP SINE ({frequency} Hz)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>PLAY SINE WAVE ({frequency} Hz)</span>
            </>
          )}
        </button>
      </div>

      {/* Subtext description */}
      <p className="text-[10px] text-slate-600 dark:text-neutral-400 mb-2 leading-relaxed">
        Real-time pure sine wave frequency synthesizer powered by Web Audio API. Enter any Hz frequency and listen to the clean tone.
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-black/5 dark:border-white/5 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-mono text-[9px]">
          <Folder className="w-3 h-3 text-cyan-500" />
          <span>Web Audio Synth</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
        >
          <span>{item.metadata?.callToAction || "Open Music's ↗"}</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
