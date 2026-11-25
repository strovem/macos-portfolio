'use client';

import React from 'react';
import { DesktopCardItem } from '@/types/os';
import { Music2, Play, Pause, SkipForward, SkipBack, Disc, Folder, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/useAudioStore';
import { ORIGINAL_TRACKS } from '@/data/music';

interface MusicDesktopWidgetProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function MusicDesktopWidget({ item, onOpenApp }: MusicDesktopWidgetProps) {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const nextTrack = useAudioStore((s) => s.nextTrack);
  const prevTrack = useAudioStore((s) => s.prevTrack);

  const activeTrack = currentTrack || ORIGINAL_TRACKS[0];

  return (
    <div className="relative w-[272px] p-4 rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-neutral-900/90 border border-black/10 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200 group">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-neutral-100 leading-tight flex items-center gap-1.5">
              <span>{item.title || "My Music's"}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
              {item.subtitle || 'Hüseyin Korumtaş'}
            </div>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-300 text-[9px] font-mono font-semibold">
          {ORIGINAL_TRACKS.length} TRACKS
        </span>
      </div>

      {/* Center Interactive Vinyl & Now Playing Box */}
      <div className="p-3 rounded-xl bg-gradient-to-b from-neutral-900/90 to-slate-950 border border-neutral-800 shadow-inner flex flex-col items-center gap-2.5 my-2 text-white">
        <div className="flex items-center gap-3 w-full">
          {/* Animated Mini Vinyl Disc */}
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className={`w-12 h-12 rounded-full bg-gradient-to-tr ${
                activeTrack.coverGradient || 'from-indigo-500 to-cyan-500'
              } p-0.5 shadow-md flex items-center justify-center`}
            >
              <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center bg-black/40">
                <div className="w-4 h-4 rounded-full bg-neutral-900 border border-white/50 flex items-center justify-center">
                  <Disc className="w-2.5 h-2.5 text-white/90" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {activeTrack.title}
            </div>
            <div className="text-[10px] text-indigo-300/80 truncate mt-0.5">
              {activeTrack.genre} • {activeTrack.bpm} BPM
            </div>
          </div>
        </div>

        {/* Live Equalizer Waveform Bars */}
        <div className="flex items-center gap-1 h-4 w-full justify-center">
          {[4, 12, 18, 10, 22, 14, 8, 20, 16, 12, 6, 18, 14, 22, 10, 6].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-[#007AFF]"
              animate={
                isPlaying
                  ? { height: ['25%', `${Math.min(100, h * 5)}%`, '25%'] }
                  : { height: '30%' }
              }
              transition={{
                duration: 0.35,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.04,
              }}
              style={{ minHeight: '3px' }}
            />
          ))}
        </div>

        {/* Direct Playback Controls on Desktop */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevTrack();
            }}
            title="Previous Track"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            title={isPlaying ? 'Pause' : 'Play'}
            className="px-3 py-1 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            title="Next Track"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Description / Subtext */}
      <p className="text-[10px] text-slate-600 dark:text-neutral-400 mb-2 leading-relaxed">
        {item.content ||
          'Original music compositions and sound design by Hüseyin Korumtaş. Listen directly from the desktop or explore in the Finder folder.'}
      </p>

      {/* Footer with Quick Finder Link */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-mono text-[9px]">
          <Folder className="w-3 h-3 text-indigo-500" />
          <span>My Music&apos;s Folder</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
        >
          <span>{item.metadata?.callToAction || "Open Music's ↗"}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
