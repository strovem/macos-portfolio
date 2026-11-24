'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/stores/useWindowStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useTranslation } from '@/hooks/useTranslation';

export function WindowSnapOverlay() {
  const snapPreviewZone = useWindowStore((state) => state.snapPreviewZone);
  const stageManagerEnabled = useSettingsStore((state) => state.stageManagerEnabled);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isStageActive = stageManagerEnabled && windowDimensions.width >= 1024;
  const STAGE_STRIP_WIDTH = 164;
  const leftOffset = isStageActive ? STAGE_STRIP_WIDTH + 8 : 8;
  const usableWidth = isStageActive ? windowDimensions.width - STAGE_STRIP_WIDTH : windowDimensions.width;

  const menubarHeight = 32;
  const dockMargin = 72;
  const targetY = menubarHeight + 6;
  const targetHeight = Math.max(200, windowDimensions.height - menubarHeight - dockMargin - 10);

  let targetX = leftOffset;
  let targetWidth = usableWidth - 16;

  if (snapPreviewZone === 'left') {
    targetX = leftOffset;
    targetWidth = Math.floor((usableWidth - 24) / 2);
  } else if (snapPreviewZone === 'right') {
    const halfWidth = Math.floor((usableWidth - 24) / 2);
    targetX = leftOffset + halfWidth + 8;
    targetWidth = halfWidth;
  } else if (snapPreviewZone === 'top') {
    targetX = leftOffset;
    targetWidth = usableWidth - 16;
  }

  return (
    <AnimatePresence>
      {!isMobile && snapPreviewZone && (
        <div className="fixed inset-0 pointer-events-none z-[18] overflow-hidden select-none">
          <motion.div
            key={snapPreviewZone}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{
              position: 'absolute',
              left: targetX,
              top: targetY,
              width: targetWidth,
              height: targetHeight,
            }}
            className="rounded-2xl liquid-glass border-2 border-blue-400/80 bg-blue-500/15 shadow-[0_0_40px_rgba(59,130,246,0.35)] backdrop-blur-2xl flex items-center justify-center pointer-events-none"
          >
            <div className="px-4 py-2 rounded-xl bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 text-xs font-semibold text-white tracking-wide shadow-lg">
              {snapPreviewZone === 'left' && t('tileLeft')}
              {snapPreviewZone === 'right' && t('tileRight')}
              {snapPreviewZone === 'top' && t('fillScreen')}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
