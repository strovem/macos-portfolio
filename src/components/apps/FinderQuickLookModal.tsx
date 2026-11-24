'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  ExternalLink,
  Music2,
  FileText,
  Layers,
  Disc3,
} from 'lucide-react';
import type { FinderFileItem } from './FinderApp';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { useOverlayStore } from '@/stores/useOverlayStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getFrequencyBars } from '@/lib/audioAnalyser';
import { playQuickLookSound, playWindowCloseSound } from '@/utils/soundEffects';
import { Z_INDEX } from '@/constants/zIndex';

const LazyToneGenerator = dynamic(
  () => import('./ToneGeneratorApp').then((mod) => mod.ToneGeneratorApp),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] flex items-center justify-center text-xs text-slate-400">
        Loading Audio Lab...
      </div>
    ),
  }
);

interface FinderQuickLookModalProps {
  file: FinderFileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const BAR_COUNT = 28;

export function FinderQuickLookModal({ file, isOpen, onClose }: FinderQuickLookModalProps) {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const nextTrack = useAudioStore((s) => s.nextTrack);
  const prevTrack = useAudioStore((s) => s.prevTrack);
  const seek = useAudioStore((s) => s.seek);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const openWindow = useWindowStore((s) => s.openWindow);
  const registerQuickLook = useOverlayStore((s) => s.registerQuickLook);
  const unregisterQuickLook = useOverlayStore((s) => s.unregisterQuickLook);
  const { language } = useTranslation();

  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isAudioPrimary = Boolean(file?.track && (!file.isMarkdown && !file.name.endsWith('.pdf')));
  const isCurrentFilePlaying = Boolean(
    isPlaying && currentTrack && file?.track && currentTrack.id === file.track.id
  );

  useEffect(() => {
    if (isOpen) {
      playQuickLookSound();
    }
  }, [isOpen]);

  // Register centralized Escape closer while Quick Look is open
  useEffect(() => {
    if (!isOpen) return;
    const closeWithSound = () => {
      playWindowCloseSound();
      onClose();
    };
    registerQuickLook(closeWithSound);
    return () => unregisterQuickLook(closeWithSound);
  }, [isOpen, onClose, registerQuickLook, unregisterQuickLook]);

  // Animate waveform bars cleanly via DOM refs (zero React re-renders)
  useEffect(() => {
    if (!isOpen || !isCurrentFilePlaying) {
      barRefs.current.forEach((el) => {
        if (el) el.style.height = '20%';
      });
      return;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      barRefs.current.forEach((el, idx) => {
        if (el) el.style.height = `${30 + ((idx * 17) % 45)}%`;
      });
      return;
    }

    let rafId = 0;
    const renderBars = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(renderBars);
        return;
      }
      const spectrum = getFrequencyBars(BAR_COUNT, true);
      for (let i = 0; i < BAR_COUNT; i++) {
        const el = barRefs.current[i];
        if (!el) continue;
        const val = spectrum[i] ?? 0.2;
        const pct = Math.max(16, Math.min(100, Math.round(val * 100)));
        el.style.height = `${pct}%`;
      }
      rafId = requestAnimationFrame(renderBars);
    };

    rafId = requestAnimationFrame(renderBars);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isCurrentFilePlaying]);

  const handleAudioToggle = () => {
    if (!file?.track) return;
    if (currentTrack && currentTrack.id === file.track.id) {
      togglePlay();
    } else {
      playTrack(file.track);
    }
  };

  const handleOpenTargetApp = () => {
    onClose();
    if (!file) return;
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
    if (!secs || Number.isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const track = file?.track;
  const activeTime = track && currentTrack?.id === track.id ? currentTime : 0;
  const activeDuration =
    track && currentTrack?.id === track.id && duration > 0
      ? duration
      : track?.durationSeconds || 180;

  return (
    <AnimatePresence>
      {isOpen && file && (
        <div
          data-modal="true"
          style={{ zIndex: Z_INDEX.QUICK_LOOK }}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md"
        >
          {/* Click backdrop to close */}
          <div
            className="absolute inset-0"
            onClick={() => {
              playWindowCloseSound();
              onClose();
            }}
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-2xl bg-white/95 dark:bg-[#1C1C22]/95 border border-black/10 dark:border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900 dark:text-neutral-100 select-none"
          >
            {/* 1. Header Toolbar (macOS Quick Look Style) */}
            <div className="h-11 px-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-100/60 dark:bg-neutral-800/50 shrink-0">
              {/* Traffic Light Close Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playWindowCloseSound();
                    onClose();
                  }}
                  className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] flex items-center justify-center text-black/60 hover:text-black transition-colors"
                  title={language === 'tr' ? 'Hızlı Bakışı Kapat (Space / Esc)' : 'Close Quick Look (Space or Esc)'}
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
              <div className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                {file.size}
              </div>
            </div>

            {/* 2. Content Body */}
            <div className="flex-1 overflow-y-auto">
              {file.targetAppId === 'tonegenerator' ? (
                <div className="h-[460px] flex flex-col bg-neutral-900">
                  <LazyToneGenerator />
                </div>
              ) : isAudioPrimary && track ? (
                /* Mode A: Music Track Preview */
                <div className="p-6 flex flex-col items-center text-center">
                  {/* Vinyl / Cover Art */}
                  <div className="relative mb-5">
                    <motion.div
                      animate={isCurrentFilePlaying ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className={`w-36 h-36 rounded-2xl bg-gradient-to-tr ${
                        track.coverGradient || 'from-indigo-500 to-purple-600'
                      } p-1 shadow-2xl flex items-center justify-center`}
                    >
                      <div className="w-full h-full rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 border-2 border-white/40 flex items-center justify-center">
                          <Disc3 className="w-6 h-6 text-white/90" />
                        </div>
                      </div>
                    </motion.div>

                    {isCurrentFilePlaying && (
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-40 -z-10 animate-pulse"
                        style={{
                          background: 'linear-gradient(45deg, #007AFF, #9333ea)',
                        }}
                      />
                    )}
                  </div>

                  {/* Title & Artist */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {track.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1 flex items-center gap-2 flex-wrap justify-center">
                    <span>Hüseyin Korumtaş</span>
                    <span>•</span>
                    <span className="text-[#007AFF] font-medium">{track.genre}</span>
                    <span>•</span>
                    <span className="font-mono tabular-nums text-amber-500">{track.bpm} BPM</span>
                  </div>

                  {/* Live FFT Waveform Bars (Ref-driven, 0 re-renders) */}
                  <div className="w-full max-w-xs h-10 my-4 flex items-end justify-center gap-1">
                    {Array.from({ length: BAR_COUNT }).map((_, i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          barRefs.current[i] = el;
                        }}
                        style={{ height: '20%' }}
                        className={`w-1.5 rounded-full transition-[background-color] duration-150 ${
                          isCurrentFilePlaying
                            ? 'bg-gradient-to-t from-[#007AFF] to-purple-500'
                            : 'bg-slate-300 dark:bg-neutral-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Scrub Slider */}
                  <div className="w-full max-w-sm flex flex-col gap-1.5 mb-3">
                    <div className="relative w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden cursor-pointer">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-[#007AFF] rounded-full pointer-events-none"
                        style={{
                          width: `${
                            activeDuration > 0
                              ? Math.min(100, Math.max(0, (activeTime / activeDuration) * 100))
                              : 0
                          }%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={activeDuration}
                        step={0.5}
                        value={activeTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!currentTrack || currentTrack.id !== track.id) {
                            playTrack(track);
                          }
                          seek(val);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        aria-label={language === 'tr' ? 'Parça konumu' : 'Seek track'}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
                      <span>{formatTime(activeTime)}</span>
                      <span>{formatTime(activeDuration)}</span>
                    </div>
                  </div>

                  {/* Transport Audio Controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={prevTrack}
                      title={language === 'tr' ? 'Önceki Parça' : 'Previous Track'}
                      className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (currentTrack?.id === track.id) {
                          seek(Math.max(0, currentTime - 10));
                        }
                      }}
                      title={language === 'tr' ? '10 sn Geri' : 'Rewind 10s'}
                      className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleAudioToggle}
                      className="w-11 h-11 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                      aria-label={isCurrentFilePlaying ? 'Pause' : 'Play'}
                    >
                      {isCurrentFilePlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (currentTrack?.id === track.id) {
                          seek(Math.min(activeDuration, currentTime + 10));
                        }
                      }}
                      title={language === 'tr' ? '10 sn İleri' : 'Fast Forward 10s'}
                      className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={nextTrack}
                      title={language === 'tr' ? 'Sonraki Parça' : 'Next Track'}
                      className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {track.description && (
                    <div className="mt-4 p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 text-left text-xs text-slate-600 dark:text-neutral-300 leading-relaxed w-full">
                      {track.description}
                    </div>
                  )}
                </div>
              ) : file.isMarkdown || file.name.endsWith('.pdf') || file.category || file.tags ? (
                /* Mode B: Document / Production Blueprint Preview */
                <div className="p-6 flex flex-col gap-3.5">
                  <div className="flex items-start gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-[#007AFF] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                          {file.category || (language === 'tr' ? 'Üretim Belgesi' : 'Production Document')}
                        </span>
                        {file.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[9px] text-slate-500 dark:text-neutral-400 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                        {file.kind} • {file.dateModified}
                      </div>
                    </div>
                  </div>

                  {track && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-500 text-white shrink-0">
                          <Music2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {track.title}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                            {track.genre} • {track.bpm} BPM
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAudioToggle}
                        className="px-3 py-1.5 rounded-lg bg-[#007AFF] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-blue-600 transition-colors shrink-0"
                      >
                        {isCurrentFilePlaying ? (
                          <>
                            <Pause className="w-3 h-3 fill-white" />
                            <span>{language === 'tr' ? 'Durdur' : 'Pause'}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                            <span>{language === 'tr' ? 'Stem Dinle' : 'Play Stem'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 font-sans text-xs text-slate-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {file.content ||
                      (language === 'tr'
                        ? `${file.name} için üretim belgesi ve proje detayları.`
                        : `Document details and production blueprint for ${file.name}. Prepared by Hüseyin Korumtaş.`)}
                  </div>
                </div>
              ) : (
                /* Mode C: Generic Application / File Preview */
                <div className="p-6 flex flex-col items-center text-center py-6">
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
            <div className="h-12 px-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between bg-neutral-100/60 dark:bg-neutral-800/40 text-xs shrink-0">
              <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                {language === 'tr' ? '[Space] veya [Esc] Kapat' : '[Space] or [Esc] Close'}
              </span>

              {(file.track || file.isMarkdown || file.name.endsWith('.pdf') || file.targetAppId) && (
                <button
                  type="button"
                  onClick={handleOpenTargetApp}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-xs shadow-sm transition-colors active:scale-95"
                >
                  <span>
                    {file.track
                      ? language === 'tr'
                        ? "Studio DAW'da Aç"
                        : 'Open in Studio DAW'
                      : language === 'tr'
                      ? 'Uygulamada Aç'
                      : 'Open in App'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
