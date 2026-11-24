'use client';

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play, Sparkles, Disc, Radio, RotateCcw } from 'lucide-react';
import { getSharedAudioContext, connectNodeToAnalyser } from '@/lib/audioAnalyser';
import { WindowContext } from '@/components/window/Window';
import { useLockStore } from '@/stores/useLockStore';
import { useSpotlightStore } from '@/stores/useSpotlightStore';

interface PadSpec {
  id: string;
  name: string;
  subName: string;
  key: string;
  color: string;
  neonBorder: string;
  neonGlow: string;
  type: 'kick' | 'snare' | 'clap' | 'hat' | 'sub808' | 'wood' | 'vocal' | 'laser';
}

const PADS: PadSpec[] = [
  {
    id: 'pad-kick',
    name: 'Analog Kick',
    subName: '48 Hz Sub Punch',
    key: 'Q',
    color: 'from-rose-500 to-red-700',
    neonBorder: 'border-red-400',
    neonGlow: 'rgba(239, 68, 68, 0.55)',
    type: 'kick',
  },
  {
    id: 'pad-snare',
    name: 'Club Snare',
    subName: 'Crisp Transient',
    key: 'W',
    color: 'from-amber-500 to-orange-700',
    neonBorder: 'border-amber-400',
    neonGlow: 'rgba(245, 158, 11, 0.55)',
    type: 'snare',
  },
  {
    id: 'pad-clap',
    name: 'Stereo Clap',
    subName: 'Layered Claps',
    key: 'E',
    color: 'from-yellow-400 to-amber-600',
    neonBorder: 'border-yellow-300',
    neonGlow: 'rgba(234, 179, 8, 0.55)',
    type: 'clap',
  },
  {
    id: 'pad-hat',
    name: 'Open Hi-Hat',
    subName: '909 Sizzle',
    key: 'R',
    color: 'from-emerald-400 to-teal-600',
    neonBorder: 'border-emerald-300',
    neonGlow: 'rgba(16, 185, 129, 0.55)',
    type: 'hat',
  },
  {
    id: 'pad-sub808',
    name: '808 Sub-Bass',
    subName: 'Saturated Low-End',
    key: 'A',
    color: 'from-cyan-500 to-blue-700',
    neonBorder: 'border-cyan-400',
    neonGlow: 'rgba(6, 182, 212, 0.6)',
    type: 'sub808',
  },
  {
    id: 'pad-wood',
    name: 'Perc Wood',
    subName: 'Organic Rim',
    key: 'S',
    color: 'from-blue-500 to-indigo-700',
    neonBorder: 'border-blue-400',
    neonGlow: 'rgba(59, 130, 246, 0.55)',
    type: 'wood',
  },
  {
    id: 'pad-vocal',
    name: 'Vocal Hook',
    subName: 'Lover Chop',
    key: 'D',
    color: 'from-violet-500 to-purple-800',
    neonBorder: 'border-purple-400',
    neonGlow: 'rgba(168, 85, 247, 0.6)',
    type: 'vocal',
  },
  {
    id: 'pad-laser',
    name: 'Pitch Riser',
    subName: 'Club Laser FX',
    key: 'F',
    color: 'from-fuchsia-500 to-pink-700',
    neonBorder: 'border-fuchsia-400',
    neonGlow: 'rgba(217, 70, 239, 0.6)',
    type: 'laser',
  },
];

export const StudioBeatPad: React.FC = () => {
  const [activePadIds, setActivePadIds] = useState<string[]>([]);
  const [lastPlayedName, setLastPlayedName] = useState<string>('Ready • Tap a Pad');
  const [hitCount, setHitCount] = useState<number>(0);
  const windowContext = useContext(WindowContext);
  const padMasterGainRef = useRef<GainNode | null>(null);
  const hitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Initialize or reuse shared Web Audio Context so AnalyserNode FFT tracks Beat Pad hits
  const getAudioContext = useCallback(() => {
    const ctx = getSharedAudioContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!padMasterGainRef.current || padMasterGainRef.current.context !== ctx) {
      padMasterGainRef.current = ctx.createGain();
      padMasterGainRef.current.connect(ctx.destination);
      connectNodeToAnalyser(padMasterGainRef.current);
    }
    return ctx;
  }, []);

  useEffect(() => {
    const timers = hitTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      if (padMasterGainRef.current) {
        try {
          padMasterGainRef.current.disconnect();
        } catch {
          // ignore
        }
        padMasterGainRef.current = null;
      }
    };
  }, []);

  // Synthesize instant punchy club percussion sounds
  const triggerSound = useCallback(
    (type: PadSpec['type'], name: string) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      const outputNode = padMasterGainRef.current || ctx.destination;
      const t = ctx.currentTime;

      setLastPlayedName(name);
      setHitCount((c) => c + 1);

      try {
        switch (type) {
          case 'kick': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

            gain.gain.setValueAtTime(1.0, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            osc.connect(gain);
            gain.connect(outputNode);
            osc.start(t);
            osc.stop(t + 0.3);
            break;
          }

          case 'snare': {
            // Noise burst + tone body
            const bufferSize = ctx.sampleRate * 0.18;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1800, t);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.7, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(outputNode);
            noise.start(t);

            // Snare tone body
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(190, t);
            osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
            oscGain.gain.setValueAtTime(0.5, t);
            oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.connect(oscGain);
            oscGain.connect(outputNode);
            osc.start(t);
            osc.stop(t + 0.1);
            break;
          }

          case 'clap': {
            // Triple noise burst
            for (let i = 0; i < 3; i++) {
              const burstT = t + i * 0.012;
              const bufferSize = ctx.sampleRate * 0.04;
              const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
              const data = buffer.getChannelData(0);
              for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
              }
              const noise = ctx.createBufferSource();
              noise.buffer = buffer;
              const filter = ctx.createBiquadFilter();
              filter.type = 'bandpass';
              filter.frequency.setValueAtTime(1400, burstT);
              const gain = ctx.createGain();
              const initialVol = i === 2 ? 0.7 : 0.35;
              gain.gain.setValueAtTime(initialVol, burstT);
              gain.gain.exponentialRampToValueAtTime(0.01, burstT + 0.12);
              noise.connect(filter);
              filter.connect(gain);
              gain.connect(outputNode);
              noise.start(burstT);
            }
            break;
          }

          case 'hat': {
            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(7500, t);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.55, t);
            gain.gain.exponentialRampToValueAtTime(0.005, t + 0.14);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(outputNode);
            noise.start(t);
            break;
          }

          case 'sub808': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(52, t);
            osc.frequency.exponentialRampToValueAtTime(38, t + 0.4);
            gain.gain.setValueAtTime(0.95, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
            osc.connect(gain);
            gain.connect(outputNode);
            osc.start(t);
            osc.stop(t + 0.68);
            break;
          }

          case 'wood': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(840, t);
            osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);
            gain.gain.setValueAtTime(0.65, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
            osc.connect(gain);
            gain.connect(outputNode);
            osc.start(t);
            osc.stop(t + 0.07);
            break;
          }

          case 'vocal': {
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(293.66, t); // D4
            osc.frequency.linearRampToValueAtTime(329.63, t + 0.15); // E4
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(900, t);
            filter.Q.setValueAtTime(5, t);
            gain.gain.setValueAtTime(0.45, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(outputNode);
            osc.start(t);
            osc.stop(t + 0.24);
            break;
          }

          case 'laser': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1400, t);
            osc.frequency.exponentialRampToValueAtTime(110, t + 0.22);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);
            osc.connect(gain);
            gain.connect(outputNode);
            osc.start(t);
            osc.stop(t + 0.25);
            break;
          }
        }
      } catch {
        // Audio synthesis fallback
      }
    },
    [getAudioContext]
  );

  const handlePadHit = useCallback(
    (pad: PadSpec) => {
      setActivePadIds((prev) => (prev.includes(pad.id) ? prev : [...prev, pad.id]));
      triggerSound(pad.type, pad.name);
      const existingTimer = hitTimersRef.current.get(pad.id);
      if (existingTimer) clearTimeout(existingTimer);
      const timer = setTimeout(() => {
        setActivePadIds((prev) => prev.filter((id) => id !== pad.id));
        hitTimersRef.current.delete(pad.id);
      }, 150);
      hitTimersRef.current.set(pad.id, timer);
    },
    [triggerSound]
  );

  // Keyboard shortcut listener scoped to active Studio window (supports polyphonic multi-key hits)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!windowContext?.isActive) return;
      const lockState = useLockStore.getState();
      if (lockState.isLocked || lockState.isSleeping) return;
      if (useSpotlightStore.getState().isOpen) return;

      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const upper = e.key.toUpperCase();
      const matched = PADS.find((p) => p.key === upper);
      if (matched) {
        e.preventDefault();
        handlePadHit(matched);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePadHit, windowContext?.isActive]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0B14] text-white p-4 md:p-6 select-none overflow-y-auto custom-scrollbar font-sans">
      {/* Top Header / Info HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg border border-purple-400/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Hüseyin Korumtaş Beat Lab</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                LIVE SAMPLER
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Klavyeden <kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Q-R</kbd> ve <kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">A-F</kbd> tuşlarıyla canlı ritim çalabilirsiniz.
            </p>
          </div>
        </div>

        {/* Dynamic Display Meter */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">{lastPlayedName}</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden md:block">
            Hits: <span className="text-white font-bold">{hitCount}</span>
          </div>
        </div>
      </div>

      {/* 8-Pad MPC Matrix Grid */}
      <div className="flex-1 my-4 flex items-center justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl">
          {PADS.map((pad) => {
            const isActive = activePadIds.includes(pad.id);
            return (
              <motion.button
                key={pad.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePadHit(pad);
                }}
                style={{
                  boxShadow: isActive
                    ? `0 0 25px ${pad.neonGlow}, inset 0 0 15px rgba(255,255,255,0.4)`
                    : '0 8px 18px rgba(0,0,0,0.45)',
                }}
                className={`relative aspect-square rounded-2xl p-3 flex flex-col justify-between text-left transition-all duration-75 border overflow-hidden group focus:outline-none ${
                  isActive
                    ? `${pad.neonBorder} bg-gradient-to-br ${pad.color} scale-[0.98]`
                    : 'border-white/10 bg-neutral-900/80 hover:border-white/25 hover:bg-neutral-800/80'
                }`}
              >
                {/* Gloss Top Reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-2xl" />

                {/* Pad Key Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-colors shadow-sm ${
                      isActive
                        ? 'bg-white text-slate-950 font-black scale-110'
                        : 'bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white'
                    }`}
                  >
                    {pad.key}
                  </span>

                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/20'
                    }`}
                  />
                </div>

                {/* Pad Title & Sound Desc */}
                <div className="relative z-10 mt-auto">
                  <h3
                    className={`font-bold text-xs md:text-sm tracking-tight transition-colors ${
                      isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {pad.name}
                  </h3>
                  <p
                    className={`text-[10px] truncate transition-colors ${
                      isActive ? 'text-white/90 font-medium' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {pad.subName}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom DAW Transport Hint */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>Analog Synthesizer Engine • 44.1 kHz • 0ms Latency</span>
        </div>

        <div className="text-[11px] text-slate-500 text-center sm:text-right">
          Dokunarak veya bilgisayar klavyesiyle canlı ritimler üretebilirsiniz.
        </div>
      </div>
    </div>
  );
};
