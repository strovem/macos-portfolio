'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Play, Pause, SkipBack, SkipForward, Music, Sparkles } from 'lucide-react';
import { useLockStore } from '@/stores/useLockStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { Wallpaper } from '@/components/desktop/Wallpaper';
import { playUnlockSound } from '@/utils/soundEffects';
import { Z_INDEX } from '@/constants/zIndex';
import { useTranslation } from '@/hooks/useTranslation';

export function LockScreen() {
  const { t, language } = useTranslation();
  const isLocked = useLockStore((state) => state.isLocked);
  const isSleeping = useLockStore((state) => state.isSleeping);
  const unlock = useLockStore((state) => state.unlock);
  const wake = useLockStore((state) => state.wake);

  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = useAudioStore();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Live real-time clock & date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = language === 'tr' ? 'tr-TR' : 'en-US';
      setTimeStr(
        now.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: language !== 'tr',
        })
      );
      setDateStr(
        now.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Keyboard controls for Sleep Mode (wake) and Lock Screen (unlock via Enter/Space)
  useEffect(() => {
    if (!isLocked && !isSleeping) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSleeping) {
        e.preventDefault();
        wake();
        return;
      }

      if (isLocked && (e.key === 'Enter' || e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        handleUnlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isSleeping, wake]);

  const handleUnlock = () => {
    playUnlockSound();
    unlock();
  };

  return (
    <>
      {/* 1. Sleep Mode: Pitch Black Screen */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={wake}
            style={{ zIndex: Z_INDEX.SLEEP_SCREEN }}
            className="fixed inset-0 bg-black cursor-pointer flex flex-col items-center justify-center select-none"
          >
            <span className="text-xs font-mono text-white/20 animate-pulse">
              {t('wakeHint')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. macOS Liquid Glass Lock Screen */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ zIndex: Z_INDEX.LOCK_SCREEN }}
            className="fixed inset-0 h-[100dvh] w-full flex flex-col justify-between items-center py-12 px-6 select-none overflow-hidden"
          >
            {/* Blurred Dynamic Wallpaper Canvas */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="w-full h-full scale-110 filter blur-2xl brightness-75">
                <Wallpaper />
              </div>
              <div className="absolute inset-0 bg-black/25 backdrop-blur-md" />
            </div>

            {/* Top Section: Date & Giant Thin Typography Clock */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center mt-4 sm:mt-8"
            >
              <div className="text-base sm:text-lg font-medium text-white/80 tracking-wide drop-shadow-md mb-1 capitalize">
                {dateStr || 'Salı, 24 Kasım'}
              </div>
              <div className="text-7xl sm:text-8xl md:text-9xl font-extralight tracking-tight text-white drop-shadow-lg tabular-nums">
                {timeStr || '17:20'}
              </div>
            </motion.div>

            {/* Bottom Section: Profile, Unlock Capsule, & Optional Now Playing */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center gap-4 w-full max-w-sm mb-4"
            >
              {/* Profile Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-2xl border-2 border-white/50 mb-2">
                  <span>HK</span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white drop-shadow-md leading-tight">
                  Hüseyin Korumtaş
                </h2>
                <span className="text-xs text-white/70 font-medium drop-shadow-sm">
                  {t('producerRole')}
                </span>
              </div>

              {/* Unlock Action Pill */}
              <button
                type="button"
                onClick={handleUnlock}
                className="liquid-glass group px-6 py-2.5 rounded-full border border-white/30 hover:border-white/50 text-white flex items-center gap-2.5 shadow-2xl cursor-pointer active:scale-95 transition-all text-xs font-semibold"
              >
                <Unlock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{language === 'tr' ? 'Kilidi Aç' : 'Unlock'}</span>
                <span className="text-[10px] text-white/50 font-mono hidden sm:inline ml-1">
                  (Enter)
                </span>
              </button>

              {/* Live Audio / Now Playing Card (if music active) */}
              {currentTrack && (
                <div className="w-full liquid-glass rounded-2xl p-3 border border-white/20 shadow-xl flex items-center justify-between gap-3 text-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                      <Music className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {currentTrack.title}
                      </div>
                      <div className="text-[10px] text-white/70 truncate">
                        {currentTrack.artist || 'Hüseyin Korumtaş'}
                      </div>
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevTrack();
                      }}
                      className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                      title="Önceki"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      title={isPlaying ? 'Durdur' : 'Oynat'}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextTrack();
                      }}
                      className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                      title="Sonraki"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
