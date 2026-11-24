'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Bluetooth,
  Radio,
  Moon,
  Sun,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music2,
  Check,
  AppWindow,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTranslation } from '@/hooks/useTranslation';
import { WALLPAPERS } from '@/data/wallpapers';
import { Z_INDEX } from '@/constants/zIndex';

export interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();

  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const bubblesEnabled = useSettingsStore((s) => s.bubblesEnabled);
  const toggleBubbles = useSettingsStore((s) => s.toggleBubbles);
  const activeWallpaperId = useSettingsStore((s) => s.activeWallpaperId);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);
  const brightness = useSettingsStore((s) => s.brightness);
  const setBrightness = useSettingsStore((s) => s.setBrightness);
  const volume = useSettingsStore((s) => s.volume);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const stageManagerEnabled = useSettingsStore((s) => s.stageManagerEnabled);
  const toggleStageManager = useSettingsStore((s) => s.toggleStageManager);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isAudioPlaying = useAudioStore((s) => s.isPlaying);
  const toggleAudioPlay = useAudioStore((s) => s.togglePlay);
  const audioNextTrack = useAudioStore((s) => s.nextTrack);
  const audioPrevTrack = useAudioStore((s) => s.prevTrack);

  const [wifiConnected, setWifiConnected] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [airDropOn, setAirDropOn] = useState(true);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest('[data-control-center-trigger]')
      ) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ zIndex: Z_INDEX.MENUBAR_POPOVER }}
          className="fixed top-9 right-2 sm:right-3 w-[calc(100vw-1rem)] sm:w-[340px] max-w-[340px] max-h-[calc(100dvh-3.5rem)] overflow-y-auto no-scrollbar p-3 rounded-2xl liquid-glass border border-black/10 dark:border-white/15 shadow-2xl select-none text-slate-800 dark:text-slate-100 flex flex-col gap-2.5 text-xs font-sans touch-pan-y"
        >
          {/* Top Section: Connectivity Card (Left) & Quick Toggles (Right) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Connectivity Card */}
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col justify-between gap-2 shadow-sm">
              {/* Wi-Fi Item */}
              <button
                type="button"
                onClick={() => setWifiConnected(!wifiConnected)}
                className="flex items-center gap-2.5 text-left w-full group focus:outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    wifiConnected
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[11px] leading-tight text-slate-900 dark:text-white">
                    Wi-Fi
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                    {wifiConnected ? 'Studio-5G' : language === 'tr' ? 'Bağlı Değil' : 'Disconnected'}
                  </span>
                </div>
              </button>

              {/* Bluetooth Item */}
              <button
                type="button"
                onClick={() => setBluetoothOn(!bluetoothOn)}
                className="flex items-center gap-2.5 text-left w-full group focus:outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    bluetoothOn
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Bluetooth className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[11px] leading-tight text-slate-900 dark:text-white">
                    Bluetooth
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                    {bluetoothOn ? 'AirPods Pro' : language === 'tr' ? 'Kapalı' : 'Off'}
                  </span>
                </div>
              </button>

              {/* AirDrop Item */}
              <button
                type="button"
                onClick={() => setAirDropOn(!airDropOn)}
                className="flex items-center gap-2.5 text-left w-full group focus:outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    airDropOn
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[11px] leading-tight text-slate-900 dark:text-white">
                    AirDrop
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                    {airDropOn
                      ? language === 'tr'
                        ? 'Yalnızca Kişiler'
                        : 'Contacts Only'
                      : language === 'tr'
                      ? 'Kapalı'
                      : 'Off'}
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Tiles Stack (Right) */}
            <div className="flex flex-col gap-2">
              {/* Dark Mode Toggle Tile */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left shadow-sm focus:outline-none ${
                  isDarkMode
                    ? 'bg-[#007AFF] text-white border-blue-400/30'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'bg-white/20 text-white'
                      : 'bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[11px] leading-tight">{t('darkAppearance')}</span>
                  <span
                    className={`text-[10px] ${
                      isDarkMode ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    {isDarkMode
                      ? language === 'tr'
                        ? 'Açık'
                        : 'On'
                      : language === 'tr'
                      ? 'Kapalı'
                      : 'Off'}
                  </span>
                </div>
              </button>

              {/* Stage Manager Toggle Tile */}
              <button
                type="button"
                onClick={toggleStageManager}
                className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left shadow-sm focus:outline-none ${
                  stageManagerEnabled
                    ? 'bg-[#007AFF] text-white border-blue-400/30'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    stageManagerEnabled ? 'bg-white/20 text-white' : 'bg-black/10 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <AppWindow className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[11px] leading-tight">{t('stageManager')}</span>
                  <span
                    className={`text-[10px] ${
                      stageManagerEnabled ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    {stageManagerEnabled
                      ? language === 'tr'
                        ? 'Açık'
                        : 'On'
                      : language === 'tr'
                      ? 'Kapalı'
                      : 'Off'}
                  </span>
                </div>
              </button>

              {/* Sound Toggle Tile */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left shadow-sm focus:outline-none ${
                  soundEnabled
                    ? 'bg-[#007AFF] text-white border-blue-400/30'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    soundEnabled
                      ? 'bg-white/20 text-white'
                      : 'bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[11px] leading-tight">
                    {language === 'tr' ? 'Sistem Sesleri' : 'System Audio'}
                  </span>
                  <span
                    className={`text-[10px] ${
                      soundEnabled ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    {soundEnabled
                      ? language === 'tr'
                        ? 'Etkin'
                        : 'Enabled'
                      : language === 'tr'
                      ? 'Sessiz'
                      : 'Muted'}
                  </span>
                </div>
              </button>

              {/* Floating Bubbles Toggle Tile */}
              <button
                type="button"
                onClick={toggleBubbles}
                className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left shadow-sm focus:outline-none ${
                  bubblesEnabled
                    ? 'bg-[#007AFF] text-white border-blue-400/30'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    bubblesEnabled
                      ? 'bg-white/20 text-white'
                      : 'bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[11px] leading-tight">{t('ambientBubbles')}</span>
                  <span
                    className={`text-[10px] ${
                      bubblesEnabled ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    {bubblesEnabled
                      ? language === 'tr'
                        ? 'Açık'
                        : 'Floating'
                      : language === 'tr'
                      ? 'Gizli'
                      : 'Hidden'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Display & Wallpaper Quick Picker */}
          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-slate-900 dark:text-white">
                {t('tabWallpaper')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
                {WALLPAPERS.find((w) => w.id === activeWallpaperId)?.name || 'Default'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {WALLPAPERS.map((wallpaper) => {
                const isSelected = activeWallpaperId === wallpaper.id;
                return (
                  <button
                    key={wallpaper.id}
                    type="button"
                    onClick={() => setWallpaper(wallpaper.id)}
                    title={wallpaper.name}
                    className={`h-9 rounded-lg relative overflow-hidden transition-all focus:outline-none flex items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-[#007AFF] shadow-md scale-105 z-10'
                        : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                    style={{ backgroundColor: wallpaper.bgColor }}
                  >
                    {wallpaper.type === 'gradient' && (
                      <div className={`absolute inset-0 ${wallpaper.previewClass}`} />
                    )}
                    {wallpaper.type === 'grid' && (
                      <div
                        className="absolute inset-0 bg-gucduck-grid"
                        style={{ backgroundSize: '12px 12px' }}
                      />
                    )}
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md relative z-10">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Display Brightness Slider */}
          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-900 dark:text-white">{t('display')}</span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-normal tabular-nums">
                {brightness}%
              </span>
            </div>
            <div className="relative w-full h-7 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex items-center">
              {/* Progress fill */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-white dark:bg-neutral-200 rounded-full transition-all duration-75"
                style={{ width: `${brightness}%` }}
              />
              {/* Sun icon */}
              <div className="absolute left-2.5 z-10 pointer-events-none text-slate-700 dark:text-slate-800">
                <Sun className="w-4 h-4" />
              </div>
              {/* Invisible native range slider for smooth touch & mouse interaction */}
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>
          </div>

          {/* Interactive Volume Slider */}
          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-900 dark:text-white">{t('sound')}</span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-normal tabular-nums">
                {soundEnabled ? `${volume}%` : language === 'tr' ? 'Sessiz' : 'Muted'}
              </span>
            </div>
            <div className="relative w-full h-7 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex items-center">
              {/* Progress fill */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-white dark:bg-neutral-200 rounded-full transition-all duration-75"
                style={{ width: soundEnabled ? `${volume}%` : '0%' }}
              />
              {/* Volume icon */}
              <div className="absolute left-2.5 z-10 pointer-events-none text-slate-700 dark:text-slate-800">
                {soundEnabled && volume > 0 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </div>
              {/* Invisible native range slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={soundEnabled ? volume : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (!soundEnabled && val > 0) {
                    toggleSound();
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>
          </div>

          {/* Media Player Tile */}
          <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${
                  currentTrack?.coverGradient || 'from-indigo-500 to-purple-600'
                } flex items-center justify-center text-white shadow-sm flex-shrink-0`}
              >
                {isAudioPlaying ? (
                  <Music2 className="w-4 h-4 animate-pulse" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[11px] truncate text-slate-900 dark:text-white leading-tight">
                  {currentTrack?.title || 'Portfolio Ambient Beats'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                  {currentTrack?.artist || 'Hüseyin Korumtaş'} · {currentTrack?.genre || 'Creative Production'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={audioPrevTrack}
                title={language === 'tr' ? 'Önceki Parça' : 'Previous Track'}
                className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none text-slate-600 dark:text-slate-300"
              >
                <SkipBack className="w-3 h-3 fill-current" />
              </button>
              <button
                type="button"
                onClick={toggleAudioPlay}
                title={
                  isAudioPlaying
                    ? language === 'tr'
                      ? 'Duraklat'
                      : 'Pause'
                    : language === 'tr'
                    ? 'Oynat'
                    : 'Play'
                }
                className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center hover:bg-black/15 dark:hover:bg-white/25 transition-colors focus:outline-none text-slate-800 dark:text-white"
              >
                {isAudioPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={audioNextTrack}
                title={language === 'tr' ? 'Sonraki Parça' : 'Next Track'}
                className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none text-slate-600 dark:text-slate-300"
              >
                <SkipForward className="w-3 h-3 fill-current" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
