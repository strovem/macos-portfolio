'use client';

import React, { useState } from 'react';
import { DesktopCardItem } from '@/types/os';
import { Volume2, Sparkles, Folder, ArrowUpRight, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectPreviewCardProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function ProjectPreviewCard({ item, onOpenApp }: ProjectPreviewCardProps) {
  const [pressCount, setPressCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTactileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPressCount((c) => c + 1);
    setIsPlaying(true);

    // Audio click synthesis via Web Audio API if available
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          // Alternate frequency based on count for a cute synth keyboard feel
          const baseFreq = 440;
          const frequencies = [440, 554.37, 659.25, 880];
          osc.frequency.setValueAtTime(frequencies[pressCount % frequencies.length], ctx.currentTime);

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        }
      } catch {
        // Audio synthesis fallback silently ignored
      }
    }

    setTimeout(() => {
      setIsPlaying(false);
    }, 350);
  };

  return (
    <div className="relative w-64 p-3.5 rounded-xl backdrop-blur-xl bg-white/85 dark:bg-neutral-900/85 border border-black/5 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Volume2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-neutral-100 leading-tight">
              {item.title}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-neutral-400 font-medium">
              {item.subtitle}
            </div>
          </div>
        </div>

        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-300 text-[9px] font-mono font-semibold">
          {item.metadata?.version || 'v2.4'}
        </span>
      </div>

      {/* Interactive Soundboard Canvas / Push-button Area */}
      <div className="relative p-3 rounded-lg bg-gradient-to-b from-neutral-900 to-slate-950 border border-neutral-800 shadow-inner flex flex-col items-center justify-center gap-2.5 my-2">
        {/* Equalizer Waveform Bars */}
        <div className="flex items-center gap-1 h-6">
          {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.8].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400"
              animate={
                isPlaying
                  ? { height: ['20%', `${Math.round(h * 100)}%`, '20%'] }
                  : { height: '25%' }
              }
              transition={{
                duration: 0.25,
                repeat: isPlaying ? 2 : 0,
                delay: i * 0.03,
              }}
              style={{ minHeight: '4px' }}
            />
          ))}
        </div>

        {/* 3D Tactile Push Button */}
        <button
          type="button"
          onClick={handleTactileClick}
          className="group/btn relative px-4 py-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-mono text-[11px] font-bold tracking-wider shadow-[0_4px_0_#3730A3,0_8px_15px_rgba(79,70,229,0.4)] active:shadow-[0_1px_0_#3730A3] active:translate-y-[3px] transition-all cursor-pointer flex items-center gap-2 border-t border-indigo-300/40"
        >
          {isPlaying ? (
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{item.metadata?.buttonLabel || 'PUSH TO CUT'}</span>
          <span className="ml-1 text-[9px] opacity-80 bg-black/20 px-1.5 py-0.5 rounded">
            {pressCount}
          </span>
        </button>

        <span className="text-[9px] font-mono text-neutral-400">
          {isPlaying ? '♪ Audio Synthesized' : 'Tap for audio synthesis'}
        </span>
      </div>

      {/* Description */}
      <p className="text-[10px] text-slate-600 dark:text-neutral-400 mb-2 leading-relaxed">
        {item.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-black/5 dark:border-white/5 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-mono text-[9px]">
          <Folder className="w-3 h-3 text-indigo-500" />
          <span>Interactive Prototype</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
        >
          <span>{item.metadata?.callToAction || 'View Finder'}</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
