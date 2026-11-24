'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  ExternalLink,
  Music2,
  FileText,
  Layers,
  Disc3,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { FinderFileItem } from './FinderApp';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { playQuickLookSound, playWindowCloseSound } from '@/utils/soundEffects';
import { Z_INDEX } from '@/constants/zIndex';

interface FinderQuickLookModalProps {
  file: FinderFileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FinderQuickLookModal({ file, isOpen, onClose }: FinderQuickLookModalProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, currentTime, duration } = useAudioStore();
  const openWindow = useWindowStore((state) => state.openWindow);

  useEffect(() => {
    if (isOpen) {
      playQuickLookSound();
    }
  }, [isOpen]);

  // Keyboard navigation: Space or Escape closes Quick Look
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space' || e.key === 'Escape') {
        e.preventDefault();
        playWindowCloseSound();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const isCurrentFilePlaying = isPlaying && currentTrack && file.track && currentTrack.id === file.track.id;

  const handleAudioToggle = () => {
    if (!file.track) return;
    if (currentTrack && currentTrack.id === file.track.id) {
      togglePlay();
    } else {
      playTrack(file.track);
    }
  };

  const handleOpenTargetApp = () => {
    onClose();
    if (file.track) {
      if (!currentTrack || currentTrack.id !== file.track.id) {
        playTrack(file.track);
      }
      openWindow('studio');
    } else if (file.isMarkdown || file.name.endsWith('.pdf')) {
      openWindow('notes');
    } else if (file.targetAppId) {
      openWindow(file.targetAppId);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <div
        style={{ zIndex: Z_INDEX.QUICK_LOOK }}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md"
      >
        {/* Click backdrop to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl bg-white/95 dark:bg-[#1C1C22]/95 border border-black/10 dark:border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900 dark:text-neutral-100 select-none"
        >
          {/* 1. Header Toolbar (macOS Quick Look Style) */}
          <div className="h-11 px-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-100/60 dark:bg-neutral-800/50">
            {/* Traffic Light Close Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playWindowCloseSound();
                  onClose();
                }}
                className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] flex items-center justify-center text-black/60 hover:text-black transition-colors"
                title="Close Quick Look (Space or Esc)"
              >
                <X className="w-2.5 h-2.5 opacity-80" />
              </button>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] opacity-40 cursor-default" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#28C840] opacity-40 cursor-default" />
            </div>

            {/* File Name & Kind Title */}
            <div className="flex-1 px-3 text-center min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-neutral-100 truncate">
                {file.name}
              </div>
            </div>

            {/* Meta Pill */}
            <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
              {file.size}
            </div>
          </div>

          {/* 2. Content Body */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Mode A: Music Track Preview */}
            {file.track ? (
              <div className="flex flex-col items-center text-center">
                {/* Vinyl / Cover Art */}
                <div className="relative mb-5">
                  <motion.div
                    animate={isCurrentFilePlaying ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className={`w-40 h-40 rounded-2xl bg-gradient-to-tr ${
                      file.track.coverGradient || 'from-indigo-500 to-purple-600'
                    } p-1 shadow-2xl flex items-center justify-center`}
                  >
                    <div className="w-full h-full rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-900 border-2 border-white/40 flex items-center justify-center">
                        <Disc3 className="w-6 h-6 text-white/90" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Pulsing Aura when playing */}
                  {isCurrentFilePlaying && (
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-40 -z-10 animate-pulse"
                      style={{
                        background: `linear-gradient(45deg, #007AFF, #9333ea)`,
                      }}
                    />
                  )}
                </div>

                {/* Title & Artist */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {file.track.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
                  <span>Hüseyin Korumtaş</span>
                  <span>•</span>
                  <span className="text-[#007AFF] font-medium">{file.track.genre}</span>
                  <span>•</span>
                  <span className="font-mono text-amber-500">{file.track.bpm} BPM</span>
                </div>

                {/* Live Playing Waveform Bars */}
                <div className="w-full max-w-xs h-10 my-4 flex items-end justify-center gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={
                        isCurrentFilePlaying
                          ? {
                              height: `${Math.max(15, Math.sin(i * 0.4 + Date.now() * 0.003) * 40 + 50)}%`,
                            }
                          : { height: '20%' }
                      }
                      transition={{ duration: 0.1 }}
                      className={`w-1.5 rounded-full transition-colors ${
                        isCurrentFilePlaying
                          ? 'bg-gradient-to-t from-[#007AFF] to-purple-500'
                          : 'bg-slate-300 dark:bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Transport Audio Controls */}
                <div className="flex items-center gap-4 mt-1">
                  <button
                    type="button"
                    onClick={handleAudioToggle}
                    className="w-12 h-12 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  >
                    {isCurrentFilePlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Time Readout */}
                <div className="text-[11px] font-mono text-slate-400 mt-2">
                  {isCurrentFilePlaying
                    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                    : `Duration: ${file.track.duration}`}
                </div>
              </div>
            ) : file.isMarkdown || file.name.endsWith('.pdf') ? (
              /* Mode B: Document / Blueprint Preview */
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 pb-3 border-b border-black/5 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-[#007AFF] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                      {file.kind} • Modified: {file.dateModified}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 font-sans text-xs text-slate-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {file.content || 'Bu belgede ek açıklama bulunmamaktadır.'}
                </div>
              </div>
            ) : (
              /* Mode C: Generic Application / File Preview */
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center shadow-md mb-3">
                  <Layers className="w-8 h-8 text-slate-600 dark:text-neutral-300" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {file.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-xs">
                  {file.content || `${file.kind} — ${file.size}`}
                </p>
              </div>
            )}
          </div>

          {/* 3. Footer Bar with Shortcuts */}
          <div className="h-12 px-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-100/60 dark:bg-neutral-800/40 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
              [Space] veya [Esc] Kapat
            </span>

            <button
              type="button"
              onClick={handleOpenTargetApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-xs shadow-sm transition-colors active:scale-95"
            >
              <span>{file.track ? "Studio DAW'da Aç" : 'Uygulamada Aç'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
