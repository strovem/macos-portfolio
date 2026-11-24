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
import { useDragStore } from '@/stores/useDragStore';

export interface DockItemProps {
  app: AppMetadata;
  mouseX: MotionValue<number>;
  isOpen?: boolean;
  onClick?: (appId: AppId) => void;
  isMobile?: boolean;
}

export function DockItem({ app, mouseX, isOpen = false, onClick, isMobile = false }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Measure distance from mouseX to item horizontal center (desktop only)
  const distance = useTransform(mouseX, (val) => {
    if (isMobile) return Infinity;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Base size: 40px on mobile, 48px on desktop -> Max size: 74px on desktop within 140px distance
  const baseSize = isMobile ? 40 : 48;
  const maxSize = isMobile ? 40 : 74;

  const widthSync = useTransform(distance, [-140, 0, 140], [baseSize, maxSize, baseSize]);
  const springWidth = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 220,
    damping: 14,
  });

  const width = isMobile ? baseSize : springWidth;

  const isDragging = useDragStore((state) => state.isDragging);
  const hoverTarget = useDragStore((state) => state.hoverTarget);
  const isTargetActive = (app.id === 'studio' || app.id === 'trash') && isDragging;
  const isHoveredTarget = hoverTarget === app.id;

  const handleClick = () => {
    if (!isBouncing && !isMobile) {
      setIsBouncing(true);
    }
    onClick?.(app.id);
  };

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="relative flex flex-col items-center justify-end select-none shrink-0"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Tooltip on hover (desktop only) */}
      <AnimatePresence>
        {!isMobile && isHovered && (
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

      {/* Bounce Wrapper and Icon Button with Tactile Feedback */}
      <motion.button
        type="button"
        data-dock-app={app.id}
        data-drop-zone={app.id === 'studio' ? 'studio' : app.id === 'trash' ? 'trash' : undefined}
        aria-label={app.title}
        onClick={handleClick}
        whileTap={{ scale: 0.88 }}
        style={{ width, height: width }}
        className={`relative flex items-center justify-center rounded-2xl cursor-pointer outline-none group focus-visible:ring-2 focus-visible:ring-blue-400 active:opacity-90 transition-[box-shadow,transform] duration-150 ${
          isHoveredTarget
            ? app.id === 'studio'
              ? 'ring-4 ring-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-110'
              : 'ring-4 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-110'
            : isTargetActive
            ? app.id === 'studio'
              ? 'ring-2 ring-indigo-400/60 animate-pulse'
              : 'ring-2 ring-rose-400/60 animate-pulse'
            : ''
        }`}
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
            className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-white shadow-[0_0_5px_rgba(255,255,255,0.9),0_0_2px_rgba(0,122,255,0.6)]"
          />
        )}
      </div>
    </motion.div>
  );
}
