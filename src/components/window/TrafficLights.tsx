'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TilePosition } from '@/types/os';
import { useTranslation } from '@/hooks/useTranslation';
import { playDropSnapSound } from '@/utils/systemSounds';

export interface TrafficLightsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onTile?: (tile: 'left' | 'right' | 'full' | 'center' | 'restore') => void;
  tilePosition?: TilePosition;
  isMaximized?: boolean;
  isActive?: boolean;
  className?: string;
}

export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  onTile,
  tilePosition,
  isMaximized = false,
  isActive = true,
  className = '',
}: TrafficLightsProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleGreenMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => {
      setIsMenuOpen(true);
    }, 320);
  };

  const handleGreenMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 220);
  };

  const handleMenuMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMenuMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 150);
  };

  const handleSelectTile = (action: 'left' | 'right' | 'full' | 'center' | 'restore') => {
    setIsMenuOpen(false);
    playDropSnapSound();
    if (onTile) {
      onTile(action);
    } else if (action === 'full' || action === 'restore') {
      onMaximize?.();
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-2 select-none ${className}`}
      role="group"
      aria-label="Window management controls"
    >
      {/* Red: Close */}
      <button
        type="button"
        aria-label="Close window"
        title="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer focus:outline-none ${
          isActive
            ? 'bg-[#FF5F56] border-[#E0443E]'
            : 'bg-[#D1D1D6] dark:bg-[#3A3A3C] border-[#BCBCC0] dark:border-[#48484A] group-hover:bg-[#FF5F56] group-hover:border-[#E0443E]'
        }`}
      >
        <svg
          className="w-1.5 h-1.5 text-[#4D0000] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" />
        </svg>
      </button>

      {/* Yellow: Minimize */}
      <button
        type="button"
        aria-label="Minimize window"
        title="Minimize"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize?.();
        }}
        className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer focus:outline-none ${
          isActive
            ? 'bg-[#FFBD2E] border-[#DEA123]'
            : 'bg-[#D1D1D6] dark:bg-[#3A3A3C] border-[#BCBCC0] dark:border-[#48484A] group-hover:bg-[#FFBD2E] group-hover:border-[#DEA123]'
        }`}
      >
        <svg
          className="w-1.5 h-1.5 text-[#995700] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M1.2 4H6.8" />
        </svg>
      </button>

      {/* Green: Maximize / Zoom & Sequoia Tiling Hover Anchor */}
      <div
        className="relative"
        onMouseEnter={handleGreenMouseEnter}
        onMouseLeave={handleGreenMouseLeave}
      >
        <button
          type="button"
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          title={isMaximized ? 'Restore' : 'Maximize'}
          onClick={(e) => {
            e.stopPropagation();
            onMaximize?.();
          }}
          className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer focus:outline-none ${
            isActive
              ? 'bg-[#27C93F] border-[#1AAB29]'
              : 'bg-[#D1D1D6] dark:bg-[#3A3A3C] border-[#BCBCC0] dark:border-[#48484A] group-hover:bg-[#27C93F] group-hover:border-[#1AAB29]'
          }`}
        >
          {isMaximized ? (
            <svg
              className="w-1.5 h-1.5 text-[#006500] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              viewBox="0 0 8 8"
              fill="currentColor"
            >
              <path d="M3.5 1.5v2H1.5M4.5 6.5v-2H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              className="w-1.5 h-1.5 text-[#006500] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              viewBox="0 0 8 8"
              fill="currentColor"
            >
              <path d="M1 1.5v3l3-3H1zM7 6.5v-3l-3 3h3z" />
            </svg>
          )}
        </button>

        {/* macOS Sequoia Window Tiling Popover */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              className="absolute left-0 top-6 w-52 rounded-xl liquid-glass border border-white/20 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.28)] p-1.5 z-[999] backdrop-blur-2xl"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Fill / Restore Action */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTile(isMaximized || tilePosition ? 'restore' : 'full');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-[12px] font-medium text-slate-700 dark:text-neutral-200 hover:bg-[#007AFF] hover:text-white transition-colors duration-120 group/item cursor-pointer"
              >
                <div className="w-4 h-4 rounded border border-current flex items-center justify-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-xs ${isMaximized ? 'border border-dashed border-current' : 'bg-current'}`} />
                </div>
                <span className="truncate">
                  {isMaximized || tilePosition ? t('restoreShort') : t('fullScreen')}
                </span>
              </button>

              <div className="h-px my-1 bg-black/5 dark:bg-white/10" />

              {/* Tile Left */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTile('left');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-[12px] font-medium text-slate-700 dark:text-neutral-200 hover:bg-[#007AFF] hover:text-white transition-colors duration-120 group/item cursor-pointer"
              >
                <div className="w-4 h-4 rounded border border-current flex overflow-hidden shrink-0">
                  <div className="w-1/2 h-full bg-current" />
                  <div className="w-1/2 h-full opacity-20" />
                </div>
                <span className="truncate">{t('tileLeft')}</span>
              </button>

              {/* Tile Right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTile('right');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-[12px] font-medium text-slate-700 dark:text-neutral-200 hover:bg-[#007AFF] hover:text-white transition-colors duration-120 group/item cursor-pointer"
              >
                <div className="w-4 h-4 rounded border border-current flex overflow-hidden shrink-0">
                  <div className="w-1/2 h-full opacity-20" />
                  <div className="w-1/2 h-full bg-current" />
                </div>
                <span className="truncate">{t('tileRight')}</span>
              </button>

              <div className="h-px my-1 bg-black/5 dark:bg-white/10" />

              {/* Center Window */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTile('center');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-[12px] font-medium text-slate-700 dark:text-neutral-200 hover:bg-[#007AFF] hover:text-white transition-colors duration-120 group/item cursor-pointer"
              >
                <div className="w-4 h-4 rounded border border-current flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-xs bg-current" />
                </div>
                <span className="truncate">{t('centerWindow')}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
