'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { AppMetadata } from '@/data/apps';
import { AppId } from '@/types/os';
import { AppIcon } from './AppIcon';

export interface DockItemProps {
  app: AppMetadata;
  mouseX: MotionValue<number>;
  isOpen?: boolean;
  onClick?: (appId: AppId) => void;
}

export function DockItem({ app, mouseX, isOpen = false, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Measure distance from mouseX to item horizontal center
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Smooth magnification curve:
  // Base size: 48px -> Max size: 74px (1.55x) within 140px distance
  const widthSync = useTransform(distance, [-140, 0, 140], [48, 74, 48]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 220,
    damping: 14,
  });

  const handleClick = () => {
    if (!isBouncing) {
      setIsBouncing(true);
    }
    onClick?.(app.id);
  };

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="relative flex flex-col items-center justify-end select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full mb-3 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-tight text-slate-800 dark:text-neutral-100 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg pointer-events-none whitespace-nowrap z-50"
          >
            {app.title}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bounce Wrapper and Icon Button */}
      <motion.button
        type="button"
        aria-label={app.title}
        onClick={handleClick}
        style={{ width, height: width }}
        className="relative flex items-center justify-center rounded-2xl cursor-pointer outline-none group focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <motion.div
          animate={
            isBouncing
              ? {
                  y: [0, -24, 0, -14, 0, -6, 0],
                }
              : { y: 0 }
          }
          transition={
            isBouncing
              ? {
                  duration: 0.85,
                  times: [0, 0.22, 0.44, 0.65, 0.82, 0.93, 1],
                  ease: 'easeOut',
                }
              : undefined
          }
          onAnimationComplete={() => setIsBouncing(false)}
          className="w-full h-full flex items-center justify-center"
        >
          <AppIcon iconType={app.iconType} badge={app.badge} />
        </motion.div>
      </motion.button>

      {/* Active Indicator Dot */}
      <div className="h-1.5 flex items-center justify-center mt-1">
        {isOpen && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-1 h-1 rounded-full bg-slate-700/80 dark:bg-white/90 shadow-sm"
          />
        )}
      </div>
    </motion.div>
  );
}
