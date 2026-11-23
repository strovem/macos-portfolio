'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sliders,
  Music,
  ListMusic,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { ORIGINAL_TRACKS, MusicTrack } from '@/data/music';

export interface NowPlayingPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const NowPlayingPopover: React.FC<NowPlayingPopoverProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
  } = useAudioStore();

  const openWindow = useWindowStore((state) => state.openWindow);

  // Default to first track if none selected yet
  const activeTrack: MusicTrack = currentTrack || ORIGINAL_TRACKS[0];

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest('[data-now-playing-trigger]')
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOpenStudio = () => {
    openWindow('studio');
    onClose();
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const targetSeconds = (val / 100) * (duration || activeTrack.durationSeconds);
    seek(targetSeconds);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="fixed top-9 right-8 sm:right-28 w-[320px] max-w-[calc(100vw-1.5rem)] p-3.5 rounded-2xl backdrop-blur-2xl bg-white/85 dark:bg-neutral-900/85 border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] z-50 select-none text-slate-800 dark:text-slate-100 flex flex-col gap-3 font-sans text-xs"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex h-2 w-2 relative">
                {isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-indigo-500' : 'bg-slate-400'}`} />
              </span>
              <span className="tracking-wide uppercase text-[10px] text-slate-500 dark:text-neutral-400">
                {isPlaying ? 'Now Playing' : 'Audio Player'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleOpenStudio}
                title="Open DAW Studio"
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium transition-colors focus:outline-none"
              >
                <Sliders className="w-3 h-3" />
                <span>DAW Studio</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="w-5 h-5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Track Hero Card */}
          <div className="flex items-center gap-3">
            {/* Album Cover with animated disc effect */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${activeTrack.coverGradient} flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0 border border-white/20`}
            >
              {/* Gloss highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

              {/* Animated vinyl / soundwave disc */}
              <div
                className={`w-9 h-9 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-xs ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                <Music className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>

            {/* Track Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-xs leading-tight text-slate-900 dark:text-white truncate">
                {activeTrack.title}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-neutral-300 truncate mt-0.5 flex items-center gap-1">
                <span>{activeTrack.artist}</span>
                <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">{activeTrack.bpm} BPM</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-400 truncate mt-0.5">
                {activeTrack.album} · {activeTrack.genre}
              </span>
            </div>
          </div>

          {/* Scrubber / Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="relative w-full h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden flex items-center">
              <div
                className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressPercent}
                onChange={handleSeekChange}
                aria-label="Track Progress"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || activeTrack.durationSeconds)}</span>
            </div>
          </div>

          {/* Primary Transport Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPlaylist(!showPlaylist)}
              title="Show All Tracks"
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] focus:outline-none ${
                showPlaylist
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>Tracks ({ORIGINAL_TRACKS.length})</span>
              {showPlaylist ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevTrack}
                title="Previous Track"
                className="w-7 h-7 rounded-full hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center transition-colors text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 focus:outline-none"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                title="Next Track"
                className="w-7 h-7 rounded-full hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center transition-colors text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Volume Slider Row */}
          <div className="flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              title={volume > 0 ? 'Mute' : 'Unmute'}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors focus:outline-none"
            >
              {volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <div className="relative flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden flex items-center">
              <div
                className="absolute left-0 top-0 bottom-0 bg-slate-700 dark:bg-slate-300 rounded-full"
                style={{ width: `${Math.round(volume * 100)}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume Slider"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-400 font-mono w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Expandable Tracklist Dropdown */}
          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden border-t border-black/5 dark:border-white/10 pt-2 flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar"
              >
                {ORIGINAL_TRACKS.map((track) => {
                  const isCurrent = track.id === activeTrack.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        playTrack(track);
                      }}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${
                            isCurrent && isPlaying ? 'bg-indigo-500' : 'bg-black/10 dark:bg-white/20'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                          ) : null}
                        </div>
                        <span className="text-[11px] truncate">{track.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 shrink-0 ml-2">
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
