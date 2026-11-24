'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Unlock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
} from 'lucide-react';
import { useLockStore } from '@/stores/useLockStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { playUnlockSound } from '@/utils/soundEffects';
import { Z_INDEX } from '@/constants/zIndex';
import { useTranslation } from '@/hooks/useTranslation';

export function LockScreen() {
  const { t, language } = useTranslation();
  const isLocked = useLockStore((state) => state.isLocked);
  const isSleeping = useLockStore((state) => state.isSleeping);
  const unlock = useLockStore((state) => state.unlock);
  const wake = useLockStore((state) => state.wake);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const nextTrack = useAudioStore((state) => state.nextTrack);
  const prevTrack = useAudioStore((state) => state.prevTrack);

  const weather = useWeatherStore((state) => state.weather);
  const solarPhase = useWeatherStore((state) => state.solarPhase);
  const prefersReducedMotion = useReducedMotion();

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

  const auroraPalette =
    solarPhase === 'sunset' || solarPhase === 'dawn'
      ? ['rgba(251,146,60,0.34)', 'rgba(168,85,247,0.30)', 'rgba(56,189,248,0.22)']
      : solarPhase === 'night'
      ? ['rgba(56,189,248,0.28)', 'rgba(99,102,241,0.32)', 'rgba(16,185,129,0.20)']
      : ['rgba(56,189,248,0.32)', 'rgba(139,92,246,0.26)', 'rgba(52,211,153,0.22)'];

  const renderWeatherIcon = () => {
    switch (weather.category) {
      case 'rain':
      case 'storm':
        return <CloudRain className="w-3.5 h-3.5 text-sky-300" />;
      case 'snow':
        return <Snowflake className="w-3.5 h-3.5 text-cyan-200" />;
      case 'cloudy':
      case 'partly-cloudy':
      case 'fog':
        return <Cloud className="w-3.5 h-3.5 text-slate-200" />;
      default:
        return solarPhase === 'night' ? (
          <Moon className="w-3.5 h-3.5 text-indigo-200" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-300" />
        );
    }
  };

  return (
    <>
      {/* 1. Sleep Mode: Ambient OLED Standby Display */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onClick={wake}
            style={{ zIndex: Z_INDEX.SLEEP_SCREEN }}
            className="fixed inset-0 bg-[#030307] cursor-pointer flex flex-col items-center justify-center select-none overflow-hidden"
          >
            {/* Subtle Breathing Standby Halo */}
            <motion.div
              aria-hidden="true"
              animate={
                prefersReducedMotion
                  ? { opacity: 0.35 }
                  : { scale: [0.92, 1.08, 0.92], opacity: [0.22, 0.45, 0.22] }
              }
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-[340px] h-[340px] rounded-full pointer-events-none blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(99,102,241,0.12) 45%, transparent 72%)',
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
              <span className="text-xs font-medium tracking-widest uppercase text-white/25 capitalize">
                {dateStr || 'Salı, 24 Kasım'}
              </span>
              <div className="text-6xl sm:text-7xl font-extralight tracking-tight text-white/35 tabular-nums">
                {timeStr || '23:32'}
              </div>
              <div className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-white/35 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400/60" />
                <span>{t('wakeHint')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. macOS Liquid Glass Lock Screen */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            data-modal="true"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ zIndex: Z_INDEX.LOCK_SCREEN }}
            className="fixed inset-0 h-[100dvh] w-full flex flex-col justify-between items-center py-12 px-6 select-none overflow-hidden"
          >
            {/* Lightweight Frosted Scrim + Dynamic Solar Aurora Orbs */}
            <div className="absolute inset-0 -z-10 bg-slate-950/45 backdrop-blur-3xl saturate-150 pointer-events-none overflow-hidden">
              <motion.div
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        x: ['-6%', '8%', '-6%'],
                        y: ['-4%', '6%', '-4%'],
                        scale: [1, 1.12, 1],
                      }
                }
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-28 -left-24 w-[440px] h-[440px] rounded-full blur-[90px]"
                style={{ background: auroraPalette[0] }}
              />
              <motion.div
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        x: ['6%', '-8%', '6%'],
                        y: ['5%', '-6%', '5%'],
                        scale: [1.05, 0.95, 1.05],
                      }
                }
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-32 -right-24 w-[480px] h-[480px] rounded-full blur-[100px]"
                style={{ background: auroraPalette[1] }}
              />
              <motion.div
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        scale: [0.95, 1.1, 0.95],
                        opacity: [0.45, 0.75, 0.45],
                      }
                }
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[360px] h-[220px] rounded-full blur-[95px]"
                style={{ background: auroraPalette[2] }}
              />
            </div>

            {/* Top Section: Date, Giant Thin Typography Clock & Live Weather Pill */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center mt-4 sm:mt-8 flex flex-col items-center"
            >
              <div className="text-base sm:text-lg font-medium text-white/80 tracking-wide drop-shadow-md mb-1 capitalize">
                {dateStr || 'Salı, 24 Kasım'}
              </div>
              <div className="text-7xl sm:text-8xl md:text-9xl font-extralight tracking-tight text-white drop-shadow-lg tabular-nums">
                {timeStr || '17:20'}
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-medium text-white/90 shadow-lg">
                {renderWeatherIcon()}
                <span>{weather.cityName}</span>
                <span className="text-white/40">•</span>
                <span className="font-semibold tabular-nums">{Math.round(weather.temperature)}°C</span>
                <span className="hidden sm:inline text-white/70">
                  · {language === 'tr' ? weather.conditionTextTr : weather.conditionTextEn}
                </span>
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
                    <div className="relative w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                      {isPlaying && !prefersReducedMotion ? (
                        <div className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                          <span className="w-0.5 bg-sky-300 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
                          <span className="w-0.5 bg-sky-200 rounded-full animate-[pulse_0.55s_ease-in-out_infinite] h-3.5" />
                          <span className="w-0.5 bg-sky-300 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2.5" />
                        </div>
                      ) : (
                        <Music className="w-4 h-4 text-blue-300" />
                      )}
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
