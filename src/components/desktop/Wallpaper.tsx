'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { WALLPAPERS, WallpaperOption } from '@/data/wallpapers';
import { getAudioMetrics, getFrequencyBars } from '@/lib/audioAnalyser';

interface ShockwaveRing {
  radiusPx: number;
  alpha: number;
  lineWidth: number;
}

function withRgbaAlpha(rgba: string, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha));
  const match = rgba.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return rgba;
  const parts = match[1].split(',').map((s) => s.trim());
  if (parts.length < 3) return rgba;
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${clamped.toFixed(3)})`;
}

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
  'track-central-park-nights': {
    primary: 'rgba(99, 102, 241, 0.44)', // Midnight Indigo
    secondary: 'rgba(56, 189, 248, 0.36)', // City Lights Cyan
    deep: '#070919',
    gridColor: 'rgba(129, 140, 248, 0.32)',
  },
  'track-liquid-horizon': {
    primary: 'rgba(34, 211, 238, 0.48)', // Electric Cyan
    secondary: 'rgba(124, 58, 237, 0.48)', // Kinetic Violet
    deep: '#050E1E',
    gridColor: 'rgba(56, 189, 248, 0.40)',
  },
  'track-electric-trap': {
    primary: 'rgba(245, 158, 11, 0.46)', // Electric Amber
    secondary: 'rgba(220, 38, 38, 0.48)', // Deep Crimson
    deep: '#190705',
    gridColor: 'rgba(251, 191, 36, 0.36)',
  },
  'track-eurodance-anthem': {
    primary: 'rgba(56, 189, 248, 0.48)', // Euphoric Sky Blue
    secondary: 'rgba(79, 70, 229, 0.48)', // Royal Indigo
    deep: '#050C21',
    gridColor: 'rgba(96, 165, 250, 0.38)',
  },
  'track-8bit-hyperpop': {
    primary: 'rgba(132, 204, 22, 0.45)', // Arcade Lime
    secondary: 'rgba(16, 185, 129, 0.48)', // Neon Emerald
    deep: '#04160E',
    gridColor: 'rgba(163, 230, 53, 0.36)',
  },
  'track-kalabak-suyu-remix': {
    primary: 'rgba(34, 211, 238, 0.48)', // Laser Cyan
    secondary: 'rgba(20, 184, 166, 0.48)', // Club Teal
    deep: '#04151A',
    gridColor: 'rgba(45, 212, 191, 0.38)',
  },
  'track-bumbum-club-edit': {
    primary: 'rgba(232, 121, 249, 0.48)', // Neon Orchid
    secondary: 'rgba(139, 92, 246, 0.50)', // Electric Violet
    deep: '#130522',
    gridColor: 'rgba(240, 171, 252, 0.38)',
  },
  'track-dale-pa-bao': {
    primary: 'rgba(251, 146, 60, 0.48)', // Latin Mango
    secondary: 'rgba(244, 63, 94, 0.50)', // Fiesta Crimson
    deep: '#1B070C',
    gridColor: 'rgba(253, 186, 116, 0.38)',
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
  const audioReactiveAmbience = useSettingsStore((state) => state.audioReactiveAmbience);
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const auraRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentWallpaper: WallpaperOption =
    WALLPAPERS.find((w) => w.id === activeWallpaperId) || WALLPAPERS[0];

  const isReactiveActive = isPlaying && Boolean(currentTrack);
  const currentAura: TrackAuraConfig = currentTrack
    ? TRACK_AURAS[currentTrack.id] || DEFAULT_AURA
    : DEFAULT_AURA;

  // Kick-pulse scale & glow boost scaled by user intensity setting
  const intensityMap = {
    subtle: { kickScale: 0.06, kickGlow: 0.55, baseOpacity: 0.62, gridBoost: 0.35, canvasScale: 0.55 },
    vibrant: { kickScale: 0.13, kickGlow: 0.95, baseOpacity: 0.72, gridBoost: 0.7, canvasScale: 1.0 },
    max: { kickScale: 0.18, kickGlow: 1.2, baseOpacity: 0.78, gridBoost: 1.0, canvasScale: 1.35 },
  };
  const activeIntensity = intensityMap[auraIntensity] || intensityMap.vibrant;

  const bpm = currentTrack?.bpm || 126;

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Drive live kick transient, shockwave rings & perimeter audio wave at 60 FPS
  useEffect(() => {
    const el = auraRef.current;
    const canvas = canvasRef.current;
    const resetVars = (target: HTMLDivElement | null) => {
      if (!target) return;
      target.style.setProperty('--wp-kick', '0');
      target.style.setProperty('--wp-beat', '0');
      target.style.setProperty('--wp-energy', '0');
      target.style.setProperty('--wp-treble', '0');
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isReactiveActive || !audioReactiveAmbience || !isTabVisible || reducedMotion) {
      resetVars(el);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let animId: number | null = null;
    let lastTs = performance.now();
    const shockwaves: ShockwaveRing[] = [];
    const smoothedBars = new Float32Array(36);

    const update = (nowTs: number) => {
      if (document.hidden || !auraRef.current) {
        animId = null;
        return;
      }

      const dtSec = Math.max(0.001, Math.min(0.05, (nowTs - lastTs) / 1000));
      lastTs = nowTs;

      const metrics = getAudioMetrics(true, bpm);
      const beatWave = (Math.cos(metrics.beatPhase * Math.PI * 2) + 1) * 0.5;
      auraRef.current.style.setProperty('--wp-kick', metrics.kick.toFixed(3));
      auraRef.current.style.setProperty('--wp-beat', beatWave.toFixed(3));
      auraRef.current.style.setProperty('--wp-energy', metrics.energy.toFixed(3));
      auraRef.current.style.setProperty('--wp-treble', metrics.treble.toFixed(3));

      const targetCanvas = canvasRef.current;
      const ctx = targetCanvas?.getContext('2d');
      if (targetCanvas && ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelW = Math.floor(width * dpr);
        const pixelH = Math.floor(height * dpr);
        if (targetCanvas.width !== pixelW || targetCanvas.height !== pixelH) {
          targetCanvas.width = pixelW;
          targetCanvas.height = pixelH;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const maxRadius = Math.hypot(width * 0.5, height * 0.5) * 1.05;
        if (metrics.isKickHit && shockwaves.length < 8) {
          shockwaves.push({
            radiusPx: Math.min(width, height) * 0.12,
            alpha: Math.min(0.95, (0.55 + metrics.kick * 0.4) * activeIntensity.canvasScale),
            lineWidth: 2.4 + metrics.kick * 3.4,
          });
        }

        // Expanding concentric shockwave rings synchronized to song tempo
        const tempoRatio = Math.max(0.65, Math.min(1.6, metrics.effectiveBpm / 120));
        const ringSpeed = maxRadius * 0.78 * tempoRatio;
        const cx = width * 0.5;
        const cy = height * 0.47;

        // Persistent inner & outer bass-breathing resonance rings (always alive during bass/kicks)
        const pulseDrive = Math.min(1, metrics.kick * 0.85 + metrics.bass * 0.55);
        const minDim = Math.min(width, height);
        const innerR = minDim * (0.14 + pulseDrive * 0.08 * activeIntensity.canvasScale + beatWave * 0.014);
        const outerR = minDim * (0.34 + pulseDrive * 0.11 * activeIntensity.canvasScale + beatWave * 0.018);

        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.strokeStyle = withRgbaAlpha(
          currentAura.gridColor,
          Math.min(0.85, (0.14 + pulseDrive * 0.52) * activeIntensity.canvasScale)
        );
        ctx.lineWidth = 1.6 + pulseDrive * 2.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = withRgbaAlpha(
          currentAura.primary,
          Math.min(0.7, (0.09 + pulseDrive * 0.38) * activeIntensity.canvasScale)
        );
        ctx.lineWidth = 1.2 + pulseDrive * 1.8;
        ctx.stroke();

        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const ring = shockwaves[i];
          ring.radiusPx += ringSpeed * dtSec;
          const progress = ring.radiusPx / maxRadius;
          const fade = Math.max(0, 1 - progress);
          const strokeAlpha = ring.alpha * fade * fade;

          if (progress >= 1 || strokeAlpha < 0.01) {
            shockwaves.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(cx, cy, ring.radiusPx, 0, Math.PI * 2);
          ctx.strokeStyle = withRgbaAlpha(currentAura.gridColor, strokeAlpha);
          ctx.lineWidth = Math.max(0.8, ring.lineWidth * (0.4 + 0.6 * fade));
          ctx.stroke();

          // Soft outer harmonic echo ring
          if (ring.radiusPx > 32) {
            ctx.beginPath();
            ctx.arc(cx, cy, ring.radiusPx * 0.88, 0, Math.PI * 2);
            ctx.strokeStyle = withRgbaAlpha(currentAura.primary, strokeAlpha * 0.42);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Edge-visible acoustic horizon wave along bottom & side periphery (around centered windows)
        const bars = getFrequencyBars(smoothedBars.length, true);
        const pointCount = 72;
        const horizonY = height;
        const maxWaveHeight = Math.min(220, height * 0.25) * activeIntensity.canvasScale;
        const kickLift = (metrics.kick * 54 + metrics.bass * 26) * activeIntensity.canvasScale;

        for (let i = 0; i < smoothedBars.length; i++) {
          const targetVal = bars[i] || 0;
          smoothedBars[i] = smoothedBars[i] * 0.72 + targetVal * 0.28;
        }

        const waveGrad = ctx.createLinearGradient(0, horizonY - maxWaveHeight - kickLift, 0, horizonY);
        waveGrad.addColorStop(0, withRgbaAlpha(currentAura.primary, 0.34 * activeIntensity.canvasScale));
        waveGrad.addColorStop(0.55, withRgbaAlpha(currentAura.secondary, 0.2 * activeIntensity.canvasScale));
        waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        const pts: Array<{ x: number; y: number }> = [];
        for (let idx = 0; idx <= pointCount; idx++) {
          const normX = idx / pointCount;
          const distFromCenter = Math.abs(normX - 0.5) * 2; // 0 at center, 1 at screen edges
          const barIdx = Math.min(smoothedBars.length - 1, Math.floor(distFromCenter * (smoothedBars.length - 1)));
          const mag = smoothedBars[barIdx];
          // Slightly emphasize outer periphery so wave stays clearly visible around open windows
          const edgeBoost = 0.72 + distFromCenter * 0.48;
          const elevation =
            16 +
            mag * maxWaveHeight * edgeBoost +
            kickLift * (0.65 + (1 - distFromCenter) * 0.35);
          pts.push({ x: normX * width, y: horizonY - elevation });
        }

        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i - 1].x + pts[i].x) * 0.5;
          const yc = (pts[i - 1].y + pts[i].y) * 0.5;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.lineTo(width, pts[pts.length - 1].y);
        ctx.lineTo(width, horizonY);
        ctx.closePath();
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Luminous horizon crest stroke flaring on kick transients
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i - 1].x + pts[i].x) * 0.5;
          const yc = (pts[i - 1].y + pts[i].y) * 0.5;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.strokeStyle = withRgbaAlpha(
          currentAura.gridColor,
          Math.min(0.88, 0.25 + metrics.kick * 0.55 + metrics.treble * 0.2)
        );
        ctx.lineWidth = 1.4 + metrics.kick * 1.8;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      resetVars(auraRef.current);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [
    isReactiveActive,
    audioReactiveAmbience,
    isTabVisible,
    bpm,
    currentTrack?.id,
    currentAura.gridColor,
    currentAura.primary,
    currentAura.secondary,
    activeIntensity.canvasScale,
  ]);

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
            ref={auraRef}
            key={currentTrack?.id || 'reactive-aura'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ backgroundColor: currentAura.deep }}
          >
            {/* Primary Audio-Reactive Ambient Aura (edge-aware lights + tempo breath + kick surge) */}
            <div
              className="absolute inset-0 w-full h-full will-change-transform"
              style={{
                transform: `translateZ(0) scale(calc(1 + var(--wp-kick, 0) * ${activeIntensity.kickScale} + var(--wp-beat, 0) * 0.024))`,
                opacity: `calc(${activeIntensity.baseOpacity} + var(--wp-kick, 0) * ${(0.34 * activeIntensity.kickGlow).toFixed(3)} + var(--wp-energy, 0) * 0.16)`,
                background: `
                  radial-gradient(circle at 12% 48%, ${currentAura.primary} 0%, transparent 48%),
                  radial-gradient(circle at 88% 48%, ${currentAura.secondary} 0%, transparent 48%),
                  radial-gradient(circle at 50% 85%, ${currentAura.primary} 0%, transparent 55%),
                  radial-gradient(circle at 50% 18%, ${currentAura.secondary} 0%, transparent 52%)
                `,
              }}
            />

            {/* Crisp Kick-Hit Radial Bloom Halo (flares on true kick transients, calms on breakdowns) */}
            <div
              className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none will-change-transform"
              style={{
                transform: `translateZ(0) scale(calc(0.86 + var(--wp-kick, 0) * ${(0.42 + activeIntensity.kickScale).toFixed(3)} + var(--wp-beat, 0) * 0.05))`,
                opacity: `calc(var(--wp-kick, 0) * ${(0.85 * activeIntensity.kickGlow).toFixed(3)})`,
                background: `radial-gradient(circle at 50% 47%, ${currentAura.primary} 0%, ${currentAura.secondary} 45%, transparent 78%)`,
              }}
            />

            {/* Live Expanding Kick Shockwaves + Edge Horizon Acoustic Wave */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Signature Blueprint / Creative Grid Reactive to Kick & Treble */}
            <div
              className="absolute inset-0 w-full h-full will-change-transform"
              style={{
                transform: `translateZ(0) scale(calc(1 + var(--wp-kick, 0) * ${(activeIntensity.kickScale * 0.22).toFixed(4)}))`,
                opacity: `calc(0.55 + var(--wp-kick, 0) * ${activeIntensity.gridBoost} + var(--wp-treble, 0) * 0.22)`,
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
