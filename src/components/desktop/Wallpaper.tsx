'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { WALLPAPERS, WallpaperOption } from '@/data/wallpapers';

interface TrackAuraConfig {
  primary: string;
  secondary: string;
  deep: string;
  gridColor: string;
}

const TRACK_AURAS: Record<string, TrackAuraConfig> = {
  'track-tech-house-lover': {
    primary: 'rgba(6, 182, 212, 0.45)', // Cyan
    secondary: 'rgba(29, 78, 216, 0.50)', // Royal Blue
    deep: '#060E23',
    gridColor: 'rgba(56, 189, 248, 0.38)',
  },
  'track-dark-elektro': {
    primary: 'rgba(168, 85, 247, 0.40)', // Neon Purple
    secondary: 'rgba(67, 56, 202, 0.48)', // Deep Indigo
    deep: '#0C0618',
    gridColor: 'rgba(192, 132, 252, 0.32)',
  },
  'track-ethnic-garage': {
    primary: 'rgba(16, 185, 129, 0.42)', // Emerald
    secondary: 'rgba(13, 148, 136, 0.48)', // Teal
    deep: '#041412',
    gridColor: 'rgba(52, 211, 153, 0.34)',
  },
  'track-ethnic-psy': {
    primary: 'rgba(217, 70, 239, 0.46)', // Neon Fuchsia
    secondary: 'rgba(126, 34, 206, 0.52)', // Deep Psychedelic Violet
    deep: '#120524',
    gridColor: 'rgba(232, 121, 249, 0.38)',
  },
  'track-guitar-house': {
    primary: 'rgba(244, 63, 94, 0.42)', // Rose
    secondary: 'rgba(168, 85, 247, 0.45)', // Warm Purple
    deep: '#17081A',
    gridColor: 'rgba(251, 113, 133, 0.34)',
  },
  'track-tech-house-club': {
    primary: 'rgba(59, 130, 246, 0.42)', // Club Blue
    secondary: 'rgba(79, 70, 229, 0.48)', // Indigo
    deep: '#080B1A',
    gridColor: 'rgba(96, 165, 250, 0.34)',
  },
  'track-excalibur': {
    primary: 'rgba(245, 158, 11, 0.48)', // Gold / Amber
    secondary: 'rgba(217, 119, 6, 0.50)', // Warm Bronze
    deep: '#160F04',
    gridColor: 'rgba(251, 191, 36, 0.38)',
  },
  'track-need-your-love': {
    primary: 'rgba(217, 70, 239, 0.46)', // Neon Fuchsia
    secondary: 'rgba(225, 29, 72, 0.48)', // Crimson Rose
    deep: '#180514',
    gridColor: 'rgba(244, 114, 182, 0.36)',
  },
  'track-rainy-lofi': {
    primary: 'rgba(56, 189, 248, 0.38)', // Rainy Sky Blue
    secondary: 'rgba(51, 65, 85, 0.52)', // Midnight Slate
    deep: '#07111E',
    gridColor: 'rgba(125, 211, 252, 0.28)',
  },
  'track-neon-pulse': {
    primary: 'rgba(249, 115, 22, 0.46)', // Sunset Orange
    secondary: 'rgba(236, 72, 153, 0.48)', // Retro Pink
    deep: '#190814',
    gridColor: 'rgba(251, 146, 60, 0.36)',
  },
};

const DEFAULT_AURA: TrackAuraConfig = {
  primary: 'rgba(99, 102, 241, 0.42)',
  secondary: 'rgba(147, 51, 234, 0.48)',
  deep: '#090818',
  gridColor: 'rgba(129, 140, 248, 0.32)',
};

export const Wallpaper: React.FC = () => {
  const activeWallpaperId = useSettingsStore((state) => state.activeWallpaperId);
  const auraIntensity = useSettingsStore((state) => state.auraIntensity);
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.isPlaying);

  const currentWallpaper: WallpaperOption =
    WALLPAPERS.find((w) => w.id === activeWallpaperId) || WALLPAPERS[0];

  const isReactiveActive = isPlaying && Boolean(currentTrack);
  const currentAura: TrackAuraConfig = currentTrack
    ? TRACK_AURAS[currentTrack.id] || DEFAULT_AURA
    : DEFAULT_AURA;

  // Scale and opacity multiplier based on user settings
  const intensityMap = {
    subtle: { scaleMax: 1.02, opacityMin: 0.6, opacityMax: 0.78 },
    vibrant: { scaleMax: 1.05, opacityMin: 0.82, opacityMax: 1.0 },
    max: { scaleMax: 1.09, opacityMin: 0.92, opacityMax: 1.15 },
  };
  const activeIntensity = intensityMap[auraIntensity] || intensityMap.vibrant;

  // Calculate 2-beat rhythmic pulse period in seconds based on current BPM
  const bpm = currentTrack?.bpm || 126;
  const pulseDuration = (60 / bpm) * 2;

  // Solar lighting calculation
  const dynamicAtmosphereEnabled = useSettingsStore((state) => state.dynamicAtmosphereEnabled);
  const atmospherePreview = useSettingsStore((state) => state.atmospherePreview);
  const rawSolarPhase = useWeatherStore((state) => state.solarPhase);

  let effectiveSolarPhase: 'dawn' | 'day' | 'sunset' | 'night' = rawSolarPhase || 'day';
  if (atmospherePreview === 'dawn') effectiveSolarPhase = 'dawn';
  else if (atmospherePreview === 'day') effectiveSolarPhase = 'day';
  else if (atmospherePreview === 'sunset') effectiveSolarPhase = 'sunset';
  else if (atmospherePreview === 'night') effectiveSolarPhase = 'night';

  const solarGradients = {
    dawn: 'linear-gradient(135deg, rgba(254, 215, 170, 0.16) 0%, rgba(251, 146, 60, 0.10) 35%, transparent 70%), radial-gradient(circle at 85% 15%, rgba(253, 164, 175, 0.22) 0%, transparent 55%)',
    day: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 60%)',
    sunset: 'linear-gradient(145deg, rgba(245, 158, 11, 0.22) 0%, rgba(244, 63, 94, 0.18) 45%, rgba(147, 51, 234, 0.20) 80%, rgba(30, 27, 75, 0.32) 100%)',
    night: 'linear-gradient(180deg, rgba(15, 23, 42, 0.38) 0%, rgba(30, 41, 59, 0.24) 50%, rgba(15, 23, 42, 0.44) 100%), radial-gradient(circle at 50% 12%, rgba(56, 189, 248, 0.08) 0%, transparent 65%)',
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Base Wallpaper Layer */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={currentWallpaper.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
          style={{ backgroundColor: currentWallpaper.bgColor }}
        >
          {/* Sky Blue Grid Pattern (Signature Gucduck) */}
          {currentWallpaper.type === 'grid' && (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, ${currentWallpaper.gridColor || 'rgba(255, 255, 255, 0.4)'} 1px, transparent 1px),
                  linear-gradient(to bottom, ${currentWallpaper.gridColor || 'rgba(255, 255, 255, 0.4)'} 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* Gradient Wallpaper option */}
          {currentWallpaper.type === 'gradient' && (
            <div className={`absolute inset-0 w-full h-full ${currentWallpaper.previewClass}`} />
          )}

          {/* Custom Image Wallpaper option */}
          {currentWallpaper.type === 'image' && currentWallpaper.imageUrl && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${currentWallpaper.imageUrl})` }}
            />
          )}

          {/* Subtle ambient lighting layer */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.06) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Audio-Reactive Atmosphere & Color Aura Layer */}
      <AnimatePresence>
        {isReactiveActive && (
          <motion.div
            key={currentTrack?.id || 'reactive-aura'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ backgroundColor: currentAura.deep }}
          >
            {/* Rhythmic Ambient Glow Pulses with Track BPM & User Intensity (GPU accelerated) */}
            <motion.div
              animate={{
                scale: [1, activeIntensity.scaleMax, 1],
                opacity: [activeIntensity.opacityMin, activeIntensity.opacityMax, activeIntensity.opacityMin],
              }}
              transition={{
                duration: pulseDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: 'translateZ(0)',
                background: `
                  radial-gradient(circle at 50% 35%, ${currentAura.primary} 0%, transparent 68%),
                  radial-gradient(circle at 75% 72%, ${currentAura.secondary} 0%, transparent 58%),
                  radial-gradient(circle at 20% 70%, ${currentAura.primary} 0%, transparent 50%)
                `,
              }}
            />

            {/* Signature Blueprint / Creative Grid over Aura */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, ${currentAura.gridColor} 1px, transparent 1px),
                  linear-gradient(to bottom, ${currentAura.gridColor} 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Subtle Vignette & Top Depth for macOS Menubar Contrast */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                background: `
                  linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 18%),
                  radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.40) 100%)
                `,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Solar Lighting Overlay (Dawn, Noon, Golden Sunset, Twilight Night) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-[1200ms] ease-in-out"
        style={{
          background: solarGradients[effectiveSolarPhase],
          opacity: dynamicAtmosphereEnabled ? 1 : 0,
        }}
      />
    </div>
  );
};
