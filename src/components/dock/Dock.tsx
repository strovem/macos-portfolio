'use client';

import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { APPS } from '@/data/apps';
import { AppId } from '@/types/os';
import { DockItem } from './DockItem';
import { useWindowStore } from '@/stores/useWindowStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { playDockClickSound } from '@/utils/soundEffects';

export interface DockProps {
  openAppIds?: AppId[];
  onAppClick?: (appId: AppId) => void;
  className?: string;
}

export function Dock({
  openAppIds,
  onAppClick,
  className = '',
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isMobile = useIsMobile();

  const windows = useWindowStore((state) => state.windows);
  const toggleWindow = useWindowStore((state) => state.toggleWindow);

  // Active indicator dots in Dock match isOpen && !isMinimized from store or props
  const effectiveOpenAppIds =
    openAppIds ??
    Object.values(windows)
      .filter((w) => w.isOpen && !w.isMinimized)
      .map((w) => w.id);

  const handleAppClick = (appId: AppId) => {
    playDockClickSound();
    if (appId === 'instagram') {
      window.open('https://www.instagram.com/korumtashuseyin/', '_blank', 'noopener,noreferrer');
      return;
    }
    if (onAppClick) {
      onAppClick(appId);
    } else {
      toggleWindow(appId);
    }
  };

  const standardApps = APPS.filter(
    (app) => app.id !== 'settings' && app.id !== 'trash'
  );
  const systemApps = APPS.filter(
    (app) => app.id === 'settings' || app.id === 'trash'
  );

  return (
    <footer
      data-dock="true"
      style={
        isMobile
          ? { bottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }
          : undefined
      }
      className={`fixed ${
        isMobile ? 'max-w-[calc(100vw-1rem)]' : 'bottom-3'
      } left-1/2 -translate-x-1/2 z-40 pointer-events-auto ${className}`}
      role="region"
      aria-label="Application Dock"
    >
      <motion.nav
        onMouseMove={(e) => {
          if (!isMobile) mouseX.set(e.pageX);
        }}
        onMouseLeave={() => {
          if (!isMobile) mouseX.set(Infinity);
        }}
        className={`backdrop-blur-2xl bg-white/30 dark:bg-black/40 border border-white/25 dark:border-white/10 rounded-2xl shadow-2xl flex items-end ${
          isMobile
            ? 'p-1.5 px-2 gap-1.5 overflow-x-auto no-scrollbar max-w-full'
            : 'p-2 px-3 gap-2.5'
        }`}
      >
        {standardApps.map((app) => (
          <DockItem
            key={app.id}
            app={app}
            mouseX={mouseX}
            isOpen={effectiveOpenAppIds.includes(app.id)}
            onClick={handleAppClick}
            isMobile={isMobile}
          />
        ))}

        {/* Divider separator between standard apps and system utilities */}
        <div
          role="separator"
          aria-orientation="vertical"
          className={`w-[1px] ${
            isMobile ? 'h-6' : 'h-8'
          } bg-slate-400/30 dark:bg-white/20 mx-0.5 mb-2 self-center rounded-full shrink-0`}
        />

        {systemApps.map((app) => (
          <DockItem
            key={app.id}
            app={app}
            mouseX={mouseX}
            isOpen={effectiveOpenAppIds.includes(app.id)}
            onClick={handleAppClick}
            isMobile={isMobile}
          />
        ))}
      </motion.nav>
    </footer>
  );
}
