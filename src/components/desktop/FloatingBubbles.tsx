'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { getAudioMetrics } from '@/lib/audioAnalyser';

interface BubbleData {
  id: number;
  size: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
  xKeyframes: number[];
  yKeyframes: number[];
  scaleKeyframes: number[];
}

const BUBBLES: BubbleData[] = [
  {
    id: 1,
    size: 120,
    left: '7%',
    top: '12%',
    duration: 18,
    delay: 0,
    xKeyframes: [0, 25, -15, 10, 0],
    yKeyframes: [0, -35, -15, -45, 0],
    scaleKeyframes: [1, 1.04, 0.97, 1.02, 1],
  },
  {
    id: 2,
    size: 45,
    left: '16%',
    top: '68%',
    duration: 13,
    delay: 1.2,
    xKeyframes: [0, -20, 15, -10, 0],
    yKeyframes: [0, -25, -50, -20, 0],
    scaleKeyframes: [1, 1.08, 0.94, 1.05, 1],
  },
  {
    id: 3,
    size: 85,
    left: '26%',
    top: '28%',
    duration: 21,
    delay: 2.4,
    xKeyframes: [0, 30, -20, 15, 0],
    yKeyframes: [0, -40, -20, -55, 0],
    scaleKeyframes: [1, 1.03, 0.97, 1.02, 1],
  },
  {
    id: 4,
    size: 38,
    left: '35%',
    top: '78%',
    duration: 15,
    delay: 0.8,
    xKeyframes: [0, -15, 20, -10, 0],
    yKeyframes: [0, -30, -60, -25, 0],
    scaleKeyframes: [1, 1.09, 0.92, 1.06, 1],
  },
  {
    id: 5,
    size: 140,
    left: '46%',
    top: '18%',
    duration: 25,
    delay: 1.5,
    xKeyframes: [0, 20, -25, 15, 0],
    yKeyframes: [0, -50, -25, -60, 0],
    scaleKeyframes: [1, 1.03, 0.98, 1.02, 1],
  },
  {
    id: 6,
    size: 55,
    left: '58%',
    top: '65%',
    duration: 16,
    delay: 3.0,
    xKeyframes: [0, -25, 15, -20, 0],
    yKeyframes: [0, -35, -70, -30, 0],
    scaleKeyframes: [1, 1.06, 0.95, 1.04, 1],
  },
  {
    id: 7,
    size: 95,
    left: '68%',
    top: '22%',
    duration: 20,
    delay: 0.5,
    xKeyframes: [0, 20, -30, 10, 0],
    yKeyframes: [0, -45, -20, -50, 0],
    scaleKeyframes: [1, 1.04, 0.96, 1.03, 1],
  },
  {
    id: 8,
    size: 42,
    left: '78%',
    top: '58%',
    duration: 14,
    delay: 2.2,
    xKeyframes: [0, -18, 22, -12, 0],
    yKeyframes: [0, -30, -55, -20, 0],
    scaleKeyframes: [1, 1.08, 0.93, 1.05, 1],
  },
  {
    id: 9,
    size: 70,
    left: '88%',
    top: '14%',
    duration: 19,
    delay: 1.8,
    xKeyframes: [0, -20, 15, -15, 0],
    yKeyframes: [0, -35, -15, -40, 0],
    scaleKeyframes: [1, 1.05, 0.96, 1.03, 1],
  },
  {
    id: 10,
    size: 110,
    left: '18%',
    top: '42%',
    duration: 23,
    delay: 3.5,
    xKeyframes: [0, 25, -20, 15, 0],
    yKeyframes: [0, -40, -70, -30, 0],
    scaleKeyframes: [1, 1.03, 0.97, 1.02, 1],
  },
  {
    id: 11,
    size: 50,
    left: '52%',
    top: '48%',
    duration: 17,
    delay: 4.0,
    xKeyframes: [0, -15, 25, -10, 0],
    yKeyframes: [0, -25, -45, -20, 0],
    scaleKeyframes: [1, 1.07, 0.94, 1.05, 1],
  },
  {
    id: 12,
    size: 80,
    left: '82%',
    top: '80%',
    duration: 22,
    delay: 2.7,
    xKeyframes: [0, 20, -15, 25, 0],
    yKeyframes: [0, -35, -60, -25, 0],
    scaleKeyframes: [1, 1.04, 0.96, 1.03, 1],
  },
  {
    id: 13,
    size: 32,
    left: '4%',
    top: '82%',
    duration: 12,
    delay: 1.0,
    xKeyframes: [0, 15, -20, 10, 0],
    yKeyframes: [0, -25, -45, -15, 0],
    scaleKeyframes: [1, 1.1, 0.92, 1.06, 1],
  },
  {
    id: 14,
    size: 64,
    left: '40%',
    top: '6%',
    duration: 24,
    delay: 0.3,
    xKeyframes: [0, -25, 20, -15, 0],
    yKeyframes: [0, 30, 15, 40, 0],
    scaleKeyframes: [1, 1.04, 0.97, 1.03, 1],
  },
];

export const FloatingBubbles: React.FC = () => {
  const bubblesEnabled = useSettingsStore((state) => state.bubblesEnabled);
  const audioReactiveAmbience = useSettingsStore((state) => state.audioReactiveAmbience);
  const auraIntensity = useSettingsStore((state) => state.auraIntensity);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const [mounted, setMounted] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const bpm = currentTrack?.bpm || 126;

  useEffect(() => {
    setMounted(true);

    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Real-time Audio-Reactive Kick, Tempo & Spectrum Modulation (60 FPS CSS custom properties)
  useEffect(() => {
    const resetVars = (target: HTMLDivElement | null) => {
      if (!target) return;
      target.style.setProperty('--audio-kick', '0');
      target.style.setProperty('--audio-bass', '0');
      target.style.setProperty('--audio-mid', '0');
      target.style.setProperty('--audio-treble', '0');
      target.style.setProperty('--audio-beat', '0');
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isPlaying || !audioReactiveAmbience || !isTabVisible || reducedMotion) {
      resetVars(containerRef.current);
      return;
    }

    let animId: number | null = null;

    const update = () => {
      if (document.hidden || !containerRef.current) {
        animId = null;
        return;
      }

      const metrics = getAudioMetrics(true, bpm);
      const beatWave = (Math.cos(metrics.beatPhase * Math.PI * 2) + 1) * 0.5;
      containerRef.current.style.setProperty('--audio-kick', metrics.kick.toFixed(3));
      containerRef.current.style.setProperty('--audio-bass', metrics.bass.toFixed(3));
      containerRef.current.style.setProperty('--audio-mid', metrics.mid.toFixed(3));
      containerRef.current.style.setProperty('--audio-treble', metrics.treble.toFixed(3));
      containerRef.current.style.setProperty('--audio-beat', beatWave.toFixed(3));

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      resetVars(containerRef.current);
    };
  }, [isPlaying, audioReactiveAmbience, isTabVisible, bpm]);

  if (!mounted || !bubblesEnabled || !isTabVisible) return null;

  // On mobile devices, throttle to 3 lightweight ambient bubbles to preserve 60fps and mobile battery
  const activeBubbles = isMobile ? BUBBLES.slice(0, 3) : BUBBLES;
  const tempoFactor =
    isPlaying && audioReactiveAmbience ? Math.max(0.58, Math.min(1.35, 126 / bpm)) : 1;
  const intensityScale =
    auraIntensity === 'subtle' ? 0.55 : auraIntensity === 'max' ? 1.35 : 1;

  const getReactiveTransform = (size: number, id: number) => {
    if (!isPlaying || !audioReactiveAmbience) return undefined;
    const bounceDir = id % 2 === 0 ? -1 : 1;
    if (size >= 85) {
      const k = (0.44 * intensityScale).toFixed(3);
      const b = (0.24 * intensityScale).toFixed(3);
      const y = (12 * intensityScale * bounceDir).toFixed(1);
      return `translateZ(0) translateY(calc((var(--audio-kick, 0) * 0.7 + var(--audio-bass, 0) * 0.3) * ${y}px)) scale(calc(1 + var(--audio-kick, 0) * ${k} + var(--audio-bass, 0) * ${b} + var(--audio-beat, 0) * 0.04))`;
    }
    if (size >= 50) {
      const k = (0.28 * intensityScale).toFixed(3);
      const b = (0.2 * intensityScale).toFixed(3);
      const m = (0.18 * intensityScale).toFixed(3);
      const y = (8 * intensityScale * bounceDir).toFixed(1);
      return `translateZ(0) translateY(calc((var(--audio-kick, 0) * 0.5 + var(--audio-mid, 0) * 0.5) * ${y}px)) scale(calc(1 + var(--audio-kick, 0) * ${k} + var(--audio-bass, 0) * ${b} + var(--audio-mid, 0) * ${m}))`;
    }
    const t = (0.34 * intensityScale).toFixed(3);
    const k = (0.18 * intensityScale).toFixed(3);
    const b = (0.14 * intensityScale).toFixed(3);
    return `translateZ(0) scale(calc(1 + var(--audio-treble, 0) * ${t} + var(--audio-kick, 0) * ${k} + var(--audio-bass, 0) * ${b}))`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1] select-none">
      <AnimatePresence>
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full"
        >
          {activeBubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className="absolute rounded-full pointer-events-none select-none"
              style={{
                width: isMobile ? Math.min(bubble.size, 70) : bubble.size,
                height: isMobile ? Math.min(bubble.size, 70) : bubble.size,
                left: bubble.left,
                top: bubble.top,
              }}
              animate={{
                x: bubble.xKeyframes,
                y: bubble.yKeyframes,
                scale: bubble.scaleKeyframes,
              }}
              transition={{
                duration: Number((bubble.duration * tempoFactor).toFixed(2)),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: bubble.delay,
              }}
            >
              {/* Instant zero-lag GPU transform driven by live kick, mid & treble bands */}
              <div
                className="w-full h-full will-change-transform"
                style={{ transform: getReactiveTransform(bubble.size, bubble.id) }}
              >
                {/* Glassmorphic bubble body (optimized for mobile GPU) */}
                <div
                  className={`w-full h-full rounded-full relative overflow-hidden ${
                    isMobile ? 'backdrop-blur-none border border-white/20' : 'backdrop-blur-[2px] border border-white/40 shadow-inner'
                  }`}
                  style={{
                    background:
                      'radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.18) 30%, rgba(255, 255, 255, 0.04) 70%, rgba(255, 255, 255, 0.22) 100%)',
                    boxShadow:
                      'inset 0 0 14px rgba(255, 255, 255, 0.6), inset -2px -2px 6px rgba(180, 210, 240, 0.4), 0 8px 24px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Primary specular highlight arc */}
                  <div
                    className="absolute rounded-full bg-gradient-to-br from-white/80 via-white/40 to-transparent blur-[0.5px]"
                    style={{
                      top: '12%',
                      left: '16%',
                      width: '32%',
                      height: '18%',
                      transform: 'rotate(-38deg)',
                    }}
                  />

                  {/* Iridescent soft color sheen pulsing with kick hits */}
                  <div
                    className={`absolute rounded-full pointer-events-none ${
                      isPlaying ? 'mix-blend-color-dodge' : 'opacity-60 mix-blend-overlay transition-all duration-700'
                    }`}
                    style={{
                      inset: '10%',
                      opacity:
                        isPlaying && audioReactiveAmbience
                          ? 'calc(0.52 + var(--audio-kick, 0) * 0.48)'
                          : undefined,
                      background:
                        'radial-gradient(circle at 70% 80%, rgba(255, 182, 193, 0.35) 0%, rgba(173, 216, 230, 0.35) 50%, transparent 80%)',
                    }}
                  />

                  {/* Kick & bass-reactive luminous glass rim ring */}
                  {isPlaying && audioReactiveAmbience && (
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none border-2 border-white/85"
                      style={{
                        opacity: 'min(1, calc(var(--audio-kick, 0) * 0.85 + var(--audio-bass, 0) * 0.5))',
                      }}
                    />
                  )}

                  {/* Secondary rim light */}
                  <div
                    className="absolute rounded-full bg-white/50 blur-[0.4px]"
                    style={{
                      bottom: '16%',
                      right: '20%',
                      width: '14%',
                      height: '8%',
                      transform: 'rotate(25deg)',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
