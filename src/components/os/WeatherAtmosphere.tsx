'use client';

import React, { useEffect, useRef } from 'react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Z_INDEX } from '@/constants/zIndex';

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

interface GlassDroplet {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  dripSpeed: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  driftPhase: number;
  driftSpeed: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseOpacity: number;
}

export const WeatherAtmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMobile = useIsMobile();

  const dynamicAtmosphereEnabled = useSettingsStore((state) => state.dynamicAtmosphereEnabled);
  const atmospherePreview = useSettingsStore((state) => state.atmospherePreview);

  const weather = useWeatherStore((state) => state.weather);
  const solarPhase = useWeatherStore((state) => state.solarPhase);

  // Determine effective weather category and solar phase (with preview overrides)
  let effectiveCategory = weather?.category || 'partly-cloudy';
  let effectivePhase = solarPhase || 'day';

  if (atmospherePreview === 'dawn') effectivePhase = 'dawn';
  else if (atmospherePreview === 'day') effectivePhase = 'day';
  else if (atmospherePreview === 'sunset') effectivePhase = 'sunset';
  else if (atmospherePreview === 'night') effectivePhase = 'night';
  else if (atmospherePreview === 'rain') effectiveCategory = 'rain';
  else if (atmospherePreview === 'snow') effectiveCategory = 'snow';

  const isRain = effectiveCategory === 'rain' || effectiveCategory === 'storm';
  const isSnow = effectiveCategory === 'snow';
  const isFog = effectiveCategory === 'fog';
  const isClearNight = effectivePhase === 'night' && (effectiveCategory === 'clear' || effectiveCategory === 'partly-cloudy');

  const needsCanvas = isRain || isSnow || isClearNight;

  useEffect(() => {
    if (!dynamicAtmosphereEnabled || !needsCanvas) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Raindrop particles
    const rainCount = isMobile ? 24 : 60;
    const rainDrops: RainDrop[] = Array.from({ length: rainCount }).map(() => ({
      x: Math.random() * (width + 100),
      y: Math.random() * height,
      length: Math.random() * 14 + 10,
      speedY: Math.random() * 8 + 12,
      speedX: -2.2,
      opacity: Math.random() * 0.22 + 0.12,
    }));

    // Micro water droplets resting / slowly sliding on glass
    const dropletCount = isMobile ? 6 : 12;
    const glassDroplets: GlassDroplet[] = Array.from({ length: dropletCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.35 + 0.25,
      dripSpeed: Math.random() * 0.08 + 0.02,
    }));

    // Snowflake particles
    const snowCount = isMobile ? 18 : 45;
    const snowflakes: Snowflake[] = Array.from({ length: snowCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1.2,
      speedY: Math.random() * 0.9 + 0.6,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.45 + 0.3,
    }));

    // Twinkling stars (night sky)
    const starCount = isMobile ? 16 : 38;
    const stars: Star[] = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.48), // Top 48% only
      radius: Math.random() * 1.2 + 0.6,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      baseOpacity: Math.random() * 0.35 + 0.3,
    }));

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. RENDER RAIN
      if (isRain) {
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        // Draw falling rain streaks
        for (let i = 0; i < rainDrops.length; i++) {
          const drop = rainDrops[i];
          ctx.strokeStyle = `rgba(186, 230, 253, ${drop.opacity})`;

          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.speedX * 2, drop.y + drop.length);
          ctx.stroke();

          drop.x += drop.speedX;
          drop.y += drop.speedY;

          if (drop.y > height + 20) {
            drop.y = -20;
            drop.x = Math.random() * (width + 100);
          }
          if (drop.x < -20) {
            drop.x = width + 20;
          }
        }

        // Draw micro glass droplets
        for (let i = 0; i < glassDroplets.length; i++) {
          const drop = glassDroplets[i];

          // Specular highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity})`;
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle shadow underneath
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.beginPath();
          ctx.arc(drop.x, drop.y + 0.8, drop.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          drop.y += drop.dripSpeed;
          if (drop.y > height + 10) {
            drop.y = -10;
            drop.x = Math.random() * width;
          }
        }
      }

      // 2. RENDER SNOW
      if (isSnow) {
        for (let i = 0; i < snowflakes.length; i++) {
          const flake = snowflakes[i];
          flake.driftPhase += flake.driftSpeed;
          const driftX = Math.sin(flake.driftPhase) * 0.8;

          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();

          flake.x += driftX;
          flake.y += flake.speedY;

          if (flake.y > height + 10) {
            flake.y = -10;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + 10) flake.x = -10;
          if (flake.x < -10) flake.x = width + 10;
        }
      }

      // 3. RENDER TWINKLING STARS (Clear Night)
      if (isClearNight) {
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.twinklePhase += star.twinkleSpeed;
          const pulse = (Math.sin(star.twinklePhase) + 1) * 0.5;
          const opacity = star.baseOpacity + pulse * 0.35;

          ctx.fillStyle = `rgba(224, 242, 254, ${opacity})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [dynamicAtmosphereEnabled, needsCanvas, isRain, isSnow, isClearNight, isMobile]);

  if (!dynamicAtmosphereEnabled) return null;

  return (
    <div
      style={{ zIndex: Z_INDEX.WEATHER_ATMOSPHERE }}
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
    >
      {/* HTML5 Canvas for Rain / Snow / Twinkling Stars */}
      {needsCanvas && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />}

      {/* Rain Window Edge Mist & Vignette */}
      {isRain && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(15, 23, 42, 0.28) 100%), linear-gradient(to bottom, rgba(14, 165, 233, 0.05) 0%, transparent 40%)',
          }}
        />
      )}

      {/* Fog & Mist Layers (Ultra smooth CSS keyframe drift) */}
      {isFog && (
        <>
          <div
            className="absolute -inset-x-20 top-1/4 h-80 opacity-40 dark:opacity-25 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(226, 232, 240, 0.45) 0%, transparent 70%)',
              animation: 'pulse 8s ease-in-out infinite alternate',
            }}
          />
          <div
            className="absolute -inset-x-20 bottom-10 h-96 opacity-35 dark:opacity-20 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 60% 50%, rgba(203, 213, 225, 0.40) 0%, transparent 75%)',
              animation: 'pulse 12s ease-in-out infinite alternate-reverse',
            }}
          />
        </>
      )}
    </div>
  );
};
