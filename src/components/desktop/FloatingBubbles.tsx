'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

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
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !bubblesEnabled) return null;

  // On mobile devices, throttle to 3 lightweight ambient bubbles to preserve 60fps and mobile battery
  const activeBubbles = isMobile ? BUBBLES.slice(0, 3) : BUBBLES;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1] select-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full"
        >
          {activeBubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className="absolute rounded-full pointer-events-none select-none will-change-transform"
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
                duration: bubble.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: bubble.delay,
              }}
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

                {/* Iridescent soft color sheen */}
                <div
                  className="absolute rounded-full opacity-60 mix-blend-overlay pointer-events-none"
                  style={{
                    inset: '10%',
                    background:
                      'radial-gradient(circle at 70% 80%, rgba(255, 182, 193, 0.3) 0%, rgba(173, 216, 230, 0.3) 50%, transparent 80%)',
                  }}
                />

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
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
