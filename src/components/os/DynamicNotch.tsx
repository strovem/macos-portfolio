'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ExternalLink,
  Sun,
  Moon,
  Lock,
  AppWindow,
  Volume2,
  Globe,
  Disc3,
  CloudSun,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useLockStore } from '@/stores/useLockStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { useDragStore } from '@/stores/useDragStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useOverlayStore } from '@/stores/useOverlayStore';
import { useTranslation } from '@/hooks/useTranslation';
import { playDropSnapSound, playClickSound } from '@/utils/systemSounds';
import { getFrequencyBars } from '@/lib/audioAnalyser';
import { Z_INDEX } from '@/constants/zIndex';

/**
 * 4-Bar Mini Real-Time Web Audio FFT Spectrum Visualizer.
 * Driven at 60 FPS via requestAnimationFrame and direct DOM mutation.
 * Guarantees zero React state re-renders.
 */
function NotchFFTVisualizer({
  isPlaying,
  barHeight = 12,
  barWidth = 'w-[3px]',
}: {
  isPlaying: boolean;
  barHeight?: number;
  barWidth?: string;
}) {
  const bar0Ref = useRef<HTMLSpanElement>(null);
  const bar1Ref = useRef<HTMLSpanElement>(null);
  const bar2Ref = useRef<HTMLSpanElement>(null);
  const bar3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let animId: number | null = null;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateBars = () => {
      if (!document.hidden || !isPlaying) {
        const bars = getFrequencyBars(4, isPlaying && !reducedMotion);

        if (bar0Ref.current) {
          const h0 = isPlaying ? Math.max(3, Math.round((reducedMotion ? 0.5 : bars[0]) * barHeight)) : 3;
          bar0Ref.current.style.height = `${h0}px`;
        }
        if (bar1Ref.current) {
          const h1 = isPlaying ? Math.max(4, Math.round((reducedMotion ? 0.75 : bars[1]) * barHeight)) : 5;
          bar1Ref.current.style.height = `${h1}px`;
        }
        if (bar2Ref.current) {
          const h2 = isPlaying ? Math.max(3, Math.round((reducedMotion ? 0.45 : bars[2]) * barHeight)) : 3;
          bar2Ref.current.style.height = `${h2}px`;
        }
        if (bar3Ref.current) {
          const h3 = isPlaying ? Math.max(4, Math.round((reducedMotion ? 0.85 : bars[3]) * barHeight)) : 6;
          bar3Ref.current.style.height = `${h3}px`;
        }
      }

      if (isPlaying && !reducedMotion) {
        animId = requestAnimationFrame(updateBars);
      }
    };

    if (isPlaying && !reducedMotion) {
      animId = requestAnimationFrame(updateBars);
    } else {
      updateBars();
    }

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, [isPlaying, barHeight]);

  return (
    <div className="flex items-end gap-[2px] h-[14px] px-1 shrink-0">
      <span
        ref={bar0Ref}
        className={`${barWidth} bg-emerald-400 rounded-full transition-all duration-75`}
        style={{ height: '3px' }}
      />
      <span
        ref={bar1Ref}
        className={`${barWidth} bg-emerald-300 rounded-full transition-all duration-75`}
        style={{ height: '5px' }}
      />
      <span
        ref={bar2Ref}
        className={`${barWidth} bg-emerald-400 rounded-full transition-all duration-75`}
        style={{ height: '3px' }}
      />
      <span
        ref={bar3Ref}
        className={`${barWidth} bg-emerald-300 rounded-full transition-all duration-75`}
        style={{ height: '6px' }}
      />
    </div>
  );
}

export function DynamicNotch() {
  const dynamicNotchEnabled = useSettingsStore((state) => state.dynamicNotchEnabled);
  const stageManagerEnabled = useSettingsStore((state) => state.stageManagerEnabled);
  const toggleStageManager = useSettingsStore((state) => state.toggleStageManager);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const notchHudMessage = useSettingsStore((state) => state.notchHudMessage);
  const setNotchHudMessage = useSettingsStore((state) => state.setNotchHudMessage);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const nextTrack = useAudioStore((state) => state.nextTrack);
  const prevTrack = useAudioStore((state) => state.prevTrack);
  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const seek = useAudioStore((state) => state.seek);
  const playTrack = useAudioStore((state) => state.playTrack);

  const weather = useWeatherStore((state) => state.weather);
  const toggleWeatherPopover = useWeatherStore((state) => state.togglePopover);
  const lock = useLockStore((state) => state.lock);
  const openWindow = useWindowStore((state) => state.openWindow);
  const isDragging = useDragStore((state) => state.isDragging);
  const dragItem = useDragStore((state) => state.dragItem);
  const hoverTarget = useDragStore((state) => state.hoverTarget);
  const setHoverTarget = useDragStore((state) => state.setHoverTarget);
  const endDrag = useDragStore((state) => state.endDrag);
  const pushNotification = useNotificationStore((state) => state.pushNotification);
  const closeNotificationCenter = useNotificationStore((state) => state.closeCenter);
  const setWeatherPopoverOpen = useWeatherStore((state) => state.setPopoverOpen);
  const isExpanded = useOverlayStore((state) => state.isNotchExpanded);
  const setIsExpanded = useOverlayStore((state) => state.setNotchExpanded);
  const { t, language } = useTranslation();

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notchRef = useRef<HTMLDivElement>(null);

  // Clean up hover intent timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Auto-dismiss HUD message after 1.5 seconds
  useEffect(() => {
    if (notchHudMessage) {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      hudTimerRef.current = setTimeout(() => {
        setNotchHudMessage(null);
      }, 1500);
    }
    return () => {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    };
  }, [notchHudMessage, setNotchHudMessage]);

  // Click outside to collapse expanded notch
  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent) => {
      if (notchRef.current && !notchRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('pointerdown', handlePointerDownOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [isExpanded, setIsExpanded]);

  // Hover Intent management (~140ms in, ~260ms out)
  const handleMouseEnter = () => {
    if (isDragging) return;
    setIsHovered(true);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setWeatherPopoverOpen(false);
      closeNotificationCenter();
      setIsExpanded(true);
    }, 140);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 260);
  };

  // Drag-and-drop drop handler on Notch (fallback if pointerup reaches notch directly)
  const handleDropRelease = useCallback(() => {
    if (isDragging && dragItem?.track && hoverTarget === 'notch') {
      playDropSnapSound();
      playTrack(dragItem.track);
      pushNotification({
        title: 'Dynamic Notch',
        message:
          language === 'tr'
            ? `"${dragItem.track.title}" yüklendi ve çalınıyor.`
            : `"${dragItem.track.title}" loaded and playing.`,
        appId: 'studio',
        duration: 4000,
      });
      setHoverTarget(null);
      endDrag();
    }
  }, [isDragging, dragItem, hoverTarget, playTrack, pushNotification, language, setHoverTarget, endDrag]);

  // Do not render if disabled in settings
  if (!dynamicNotchEnabled) {
    return null;
  }

  const isDropTargetActive = isDragging && hoverTarget === 'notch';
  const showHud = Boolean(notchHudMessage && !isExpanded);
  const showLiveMedia = Boolean(isPlaying && !isExpanded && !showHud && !isDropTargetActive);

  // Dynamic geometry states
  let width = 136;
  let height = 28;
  let borderRadius = '0 0 16px 16px';

  if (isExpanded) {
    width = 370;
    height = 148;
    borderRadius = '0 0 24px 24px';
  } else if (isDropTargetActive) {
    width = 280;
    height = 36;
    borderRadius = '0 0 18px 18px';
  } else if (showHud) {
    width = 196;
    height = 30;
    borderRadius = '0 0 18px 18px';
  } else if (showLiveMedia) {
    width = 224;
    height = 30;
    borderRadius = '0 0 18px 18px';
  }

  // Format MM:SS helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={notchRef}
      data-drop-zone="notch"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerUp={handleDropRelease}
      style={{ zIndex: Z_INDEX.DYNAMIC_NOTCH }}
      className="hidden lg:flex fixed top-0 left-1/2 -translate-x-1/2 select-none items-center justify-center cursor-default"
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width,
          height,
          borderRadius,
        }}
        transition={{
          type: 'spring',
          stiffness: 440,
          damping: 34,
          mass: 0.8,
        }}
        onClick={() => {
          if (!isExpanded && !isDragging) {
            playClickSound();
            setIsExpanded(true);
          }
        }}
        className={`relative overflow-hidden bg-[#0a0a0c]/95 border-b border-x ${
          isDropTargetActive
            ? 'border-emerald-400/90 shadow-[0_8px_30px_rgba(52,211,153,0.35)] ring-2 ring-emerald-400/40'
            : isExpanded
            ? 'border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.85)]'
            : 'border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
        } backdrop-blur-2xl transition-colors duration-200`}
      >
        {/* Subtle top edge glass specular highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* STATE 1: Drop Target Active */}
          {isDropTargetActive ? (
            <motion.div
              key="notch-drop"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="w-full h-full flex items-center justify-center gap-2 px-3 text-emerald-300 font-medium text-xs"
            >
              <Disc3 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>
                {language === 'tr' ? "Çentik'te Çalmak İçin Bırak" : 'Drop to Play on Notch'}
              </span>
            </motion.div>
          ) : /* STATE 2: Transient HUD Pulse */
          showHud ? (
            <motion.div
              key="notch-hud"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full h-full flex items-center justify-between px-3 text-white text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                {notchHudMessage?.icon === 'volume' && <Volume2 className="w-3.5 h-3.5 text-white/80" />}
                {notchHudMessage?.icon === 'sun' && <Sun className="w-3.5 h-3.5 text-amber-300" />}
                {notchHudMessage?.icon === 'globe' && <Globe className="w-3.5 h-3.5 text-sky-400" />}
                {notchHudMessage?.icon === 'lock' && <Lock className="w-3.5 h-3.5 text-rose-400" />}
                <span className="text-[11px] text-white/90">{notchHudMessage?.text}</span>
              </div>
              {typeof notchHudMessage?.value === 'number' && (
                <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{ width: `${Math.max(0, Math.min(100, notchHudMessage.value))}%` }}
                  />
                </div>
              )}
            </motion.div>
          ) : /* STATE 3: Expanded Full Island Mode */
          isExpanded ? (
            <motion.div
              key="notch-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full p-3 flex flex-col justify-between text-white"
            >
              {/* Upper Section: Live Media Player & Controls */}
              <div className="flex items-center justify-between gap-3">
                {/* Track Album Cover / Vinyl */}
                <div
                  className={`relative w-12 h-12 rounded-lg ${
                    currentTrack?.coverGradient
                      ? `bg-gradient-to-br ${currentTrack.coverGradient}`
                      : 'bg-neutral-900'
                  } border border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-md`}
                >
                  <Disc3
                    className={`w-7 h-7 text-white/70 ${isPlaying ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '4s' }}
                  />
                  {isPlaying && (
                    <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  )}
                </div>

                {/* Track Details & Playback Controls */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white truncate leading-tight">
                        {currentTrack?.title || (language === 'tr' ? 'Parça Çalmıyor' : 'No Track Playing')}
                      </p>
                      <p className="text-[10px] text-white/60 truncate leading-tight mt-0.5">
                        {currentTrack?.artist || 'Korumtas Music'}
                      </p>
                    </div>

                    {/* Open in Studio button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWindow('studio');
                        setIsExpanded(false);
                      }}
                      title={language === 'tr' ? "Studio'da Aç" : 'Open in Studio'}
                      className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Playback Controls & Progress bar */}
                  <div className="flex items-center justify-between mt-1.5 gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          prevTrack();
                        }}
                        className="p-1 text-white/70 hover:text-white transition-colors"
                      >
                        <SkipBack className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          togglePlay();
                        }}
                        className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-transform active:scale-95"
                      >
                        {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          nextTrack();
                        }}
                        className="p-1 text-white/70 hover:text-white transition-colors"
                      >
                        <SkipForward className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Mini Scrubber Bar */}
                    <div className="flex-1 flex items-center gap-1.5 text-[9px] text-white/40 font-mono tabular-nums">
                      <span>{formatTime(currentTime)}</span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                          seek(ratio * (duration || 1));
                        }}
                        className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="h-full bg-white/80 rounded-full transition-all duration-100"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span>{formatTime(duration)}</span>
                    </div>

                    {/* FFT Bars in Expanded Header */}
                    <NotchFFTVisualizer isPlaying={isPlaying} barHeight={14} barWidth="w-[2.5px]" />
                  </div>
                </div>
              </div>

              {/* Lower Section: Quick System & Weather Utility Strip */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                {/* Weather Quick Pill */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    closeNotificationCenter();
                    useOverlayStore.getState().setActivePopover(null);
                    setIsExpanded(false);
                    toggleWeatherPopover();
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-[11px]"
                >
                  <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-medium">
                    {weather?.temperature != null
                      ? `${Math.round(weather.temperature)}°C`
                      : '14°C'}
                  </span>
                </button>

                {/* Stage Manager Quick Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    toggleStageManager();
                  }}
                  title="Stage Manager"
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-[11px] ${
                    stageManagerEnabled
                      ? 'bg-blue-600 text-white font-medium shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <AppWindow className="w-3.5 h-3.5" />
                  <span>Stage</span>
                </button>

                {/* Dark / Light Mode Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    toggleDarkMode();
                  }}
                  title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
                </button>

                {/* Lock Screen Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    lock();
                    setIsExpanded(false);
                  }}
                  title={language === 'tr' ? 'Ekranı Kilitle' : 'Lock Screen'}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : /* STATE 4: Live Audio Playing (Compact Island) */
          showLiveMedia ? (
            <motion.div
              key="notch-media-compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-between px-2.5 text-white"
            >
              {/* Left spinning vinyl cover */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Disc3
                  className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3s' }}
                />
                <span className="text-[11px] font-medium text-white/90 truncate max-w-[125px] leading-none tracking-tight">
                  {currentTrack?.title || 'Playing Audio'}
                </span>
              </div>

              {/* Right live FFT bars */}
              <NotchFFTVisualizer isPlaying={isPlaying} barHeight={10} barWidth="w-[2px]" />
            </motion.div>
          ) : (
            /* STATE 5: Default Idle Camera Lens */
            <motion.div
              key="notch-idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center gap-2"
            >
              {/* MacBook Web Camera Lens with optical reflection */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#121215] border border-white/20 shadow-inner relative flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-950/80" />
                <div className="absolute top-[1px] right-[1px] w-[2px] h-[2px] rounded-full bg-white/40" />
              </div>
              {/* Camera Privacy / Status LED Indicator */}
              <span
                className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                  isHovered ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-emerald-500/25'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
