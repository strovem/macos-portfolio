'use client';

import React, { useState } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Volume2,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  HardDrive,
  Cpu,
  Check,
  Sliders,
  Info,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { WALLPAPERS } from '@/data/wallpapers';
import { playToggleSound } from '@/utils/soundEffects';

type SettingsSection = 'appearance' | 'wallpaper' | 'atmosphere' | 'displays' | 'about';

export const SettingsApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  const {
    activeWallpaperId,
    setWallpaper,
    isDarkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    bubblesEnabled,
    toggleBubbles,
    brightness,
    setBrightness,
    volume,
    setVolume,
    auraIntensity,
    setAuraIntensity,
    tapeWarmth,
    toggleTapeWarmth,
  } = useSettingsStore();

  return (
    <div className="flex h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Left Sidebar Navigation */}
      <div className="w-56 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 p-3 flex flex-col justify-between backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-2 mb-1">
            System Preferences
          </div>

          <button
            type="button"
            onClick={() => setActiveSection('appearance')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeSection === 'appearance'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('wallpaper')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeSection === 'wallpaper'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Wallpaper</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('atmosphere')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeSection === 'atmosphere'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Atmosphere & Physics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('displays')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeSection === 'displays'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Displays & Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('about')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeSection === 'about'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About This Mac</span>
          </button>
        </div>

        {/* System Build Tag */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 text-[10px] text-slate-400 dark:text-neutral-500 px-2">
          macOS Sonoma v15.2 (24C101)
        </div>
      </div>

      {/* 2. Right Content Settings View */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        {/* Section 1: Appearance */}
        {activeSection === 'appearance' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Select your preferred interface theme and system color palette.
              </p>
            </div>

            {/* Dark / Light Mode Preview Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <div
                onClick={() => {
                  if (isDarkMode) toggleDarkMode();
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${
                  !isDarkMode
                    ? 'border-[#007AFF] bg-blue-50/40 dark:bg-blue-900/10 shadow-sm'
                    : 'border-black/5 dark:border-white/10 hover:border-black/20'
                }`}
              >
                <div className="w-full h-20 rounded-lg bg-neutral-100 border border-slate-200 flex flex-col p-2 justify-between">
                  <div className="w-16 h-3 rounded bg-white shadow-xs" />
                  <div className="flex gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white">
                      <Sun className="w-3 h-3" />
                    </div>
                    <div className="flex-1 h-5 rounded bg-slate-200/80" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    Light Mode
                  </span>
                  {!isDarkMode && (
                    <div className="w-4 h-4 rounded-full bg-[#007AFF] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => {
                  if (!isDarkMode) toggleDarkMode();
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${
                  isDarkMode
                    ? 'border-[#007AFF] bg-blue-50/40 dark:bg-blue-900/10 shadow-sm'
                    : 'border-black/5 dark:border-white/10 hover:border-black/20'
                }`}
              >
                <div className="w-full h-20 rounded-lg bg-neutral-900 border border-neutral-700 flex flex-col p-2 justify-between">
                  <div className="w-16 h-3 rounded bg-neutral-800 shadow-xs" />
                  <div className="flex gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      <Moon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 h-5 rounded bg-neutral-800" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    Dark Mode
                  </span>
                  {isDarkMode && (
                    <div className="w-4 h-4 rounded-full bg-[#007AFF] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accent Color Palette */}
            <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                Accent Color
              </span>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#007AFF] ring-2 ring-offset-2 ring-[#007AFF] cursor-pointer" />
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] hover:scale-110 transition-transform cursor-pointer" />
                <span className="w-6 h-6 rounded-full bg-[#EC4899] hover:scale-110 transition-transform cursor-pointer" />
                <span className="w-6 h-6 rounded-full bg-[#10B981] hover:scale-110 transition-transform cursor-pointer" />
                <span className="w-6 h-6 rounded-full bg-[#F59E0B] hover:scale-110 transition-transform cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Wallpaper */}
        {activeSection === 'wallpaper' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Desktop & Wallpaper
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Choose a dynamic wallpaper for your macOS desktop canvas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {WALLPAPERS.map((wp) => {
                const isSelected = wp.id === activeWallpaperId;
                return (
                  <div
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`group relative p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'border-[#007AFF] bg-[#007AFF]/5 shadow-sm'
                        : 'border-black/5 dark:border-white/10 hover:border-black/20'
                    }`}
                  >
                    <div
                      className="w-full h-24 rounded-lg shadow-inner overflow-hidden relative"
                      style={{ backgroundColor: wp.bgColor }}
                    >
                      {wp.type === 'grid' && (
                        <div
                          className="absolute inset-0 w-full h-full"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, ${wp.gridColor || 'rgba(255, 255, 255, 0.4)'} 1px, transparent 1px),
                              linear-gradient(to bottom, ${wp.gridColor || 'rgba(255, 255, 255, 0.4)'} 1px, transparent 1px)
                            `,
                            backgroundSize: '20px 20px',
                          }}
                        />
                      )}
                      {wp.type === 'gradient' && (
                        <div className={`absolute inset-0 w-full h-full ${wp.previewClass}`} />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-white">
                        {wp.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {wp.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Atmosphere & Physics */}
        {activeSection === 'atmosphere' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Atmosphere & Spatial Physics
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Tune tactile interactions, ambient floating particles, and audio feedback.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Audio-Reactive Aura Intensity */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2.5">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Reaktif Duvar Kağıdı Işıma Yoğunluğu
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Müzik çalarken arka plan aurasının parıldama ve BPM nabız vuruş şiddetini seçin.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuraIntensity('subtle')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      auraIntensity === 'subtle'
                        ? 'bg-[#007AFF] text-white border-blue-400/40 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 border-black/5 dark:border-white/10 hover:bg-neutral-200/50'
                    }`}
                  >
                    Zarif (%60)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuraIntensity('vibrant')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      auraIntensity === 'vibrant'
                        ? 'bg-[#007AFF] text-white border-blue-400/40 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 border-black/5 dark:border-white/10 hover:bg-neutral-200/50'
                    }`}
                  >
                    Canlı (Önerilen)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuraIntensity('max')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      auraIntensity === 'max'
                        ? 'bg-[#007AFF] text-white border-blue-400/40 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 border-black/5 dark:border-white/10 hover:bg-neutral-200/50'
                    }`}
                  >
                    Maksimum (%115)
                  </button>
                </div>
              </div>

              {/* Analog Tape Warmth */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Analog Bant Sıcaklığı (Tape Saturation)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Stüdyo ses çıkışına vintage analog manyetik bant karakteri ekler.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTapeWarmth}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    tapeWarmth ? 'bg-[#007AFF]' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      tapeWarmth ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Floating Bubbles Toggle */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Floating Ambient Bubbles
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Render interactive drifting glass spheres across the desktop canvas.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleBubbles}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    bubblesEnabled ? 'bg-[#007AFF]' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      bubblesEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Tactile Audio Feedback
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Play synthesized mechanical audio clicks on dock launch and window snap.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleSound();
                    playToggleSound();
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    soundEnabled ? 'bg-[#007AFF]' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Displays & Audio */}
        {activeSection === 'displays' && (
          <div className="max-w-xl flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Displays & Volume
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Adjust screen brightness overlay and virtual master volume.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Brightness Slider */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Display Brightness</span>
                  </div>
                  <span className="font-mono text-slate-500">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#007AFF] cursor-pointer"
                />
              </div>

              {/* Volume Slider */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                    <Volume2 className="w-4 h-4 text-blue-500" />
                    <span>Master Sound Volume</span>
                  </div>
                  <span className="font-mono text-slate-500">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-[#007AFF] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 5: About This Mac */}
        {activeSection === 'about' && (
          <div className="max-w-xl flex flex-col items-center text-center gap-4 py-4">
            {/* macOS Sonoma Apple Emulation Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-black text-white flex items-center justify-center shadow-lg border border-white/10">
              <span className="text-3xl font-bold tracking-tight"></span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                macOS Sonoma Web OS
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-mono">
                Version 15.2 (Build 24C101 • Next.js 14 Engine)
              </p>
            </div>

            {/* Spec Table */}
            <div className="w-full p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 text-xs flex flex-col gap-2.5 text-left">
              <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-neutral-400">Processor</span>
                <strong className="text-slate-800 dark:text-white">Apple M3 Max (16-Core)</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-neutral-400">Graphics</span>
                <strong className="text-slate-800 dark:text-white">Apple M3 Max (40-Core GPU)</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-neutral-400">Memory</span>
                <strong className="text-slate-800 dark:text-white">64 GB LPDDR5X Unified</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-neutral-400">Display</span>
                <strong className="text-slate-800 dark:text-white">Liquid Retina XDR 120Hz ProMotion</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-neutral-400">Storage</span>
                <strong className="text-slate-800 dark:text-white">2 TB NVMe SSD (1.4 TB Available)</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-neutral-500 max-w-sm">
              Creative Production & Direction by Hüseyin Korumtaş. &ldquo;Ideas into experiences.&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
