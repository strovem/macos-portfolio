'use client';

import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { APPS } from '@/data/apps';
import { AppId } from '@/types/os';
import { DockItem } from './DockItem';

export interface DockProps {
  openAppIds?: AppId[];
  onAppClick?: (appId: AppId) => void;
  className?: string;
}

export function Dock({
  openAppIds = ['finder'],
  onAppClick,
  className = '',
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  const standardApps = APPS.filter(
    (app) => app.id !== 'settings' && app.id !== 'trash'
  );
  const systemApps = APPS.filter(
    (app) => app.id === 'settings' || app.id === 'trash'
  );

  return (
    <footer
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 pointer-events-auto ${className}`}
      role="region"
      aria-label="Application Dock"
    >
      <motion.nav
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="backdrop-blur-2xl bg-white/30 dark:bg-black/40 border border-white/25 dark:border-white/10 rounded-2xl shadow-2xl p-2 px-3 flex items-end gap-2.5"
      >
        {standardApps.map((app) => (
          <DockItem
            key={app.id}
            app={app}
            mouseX={mouseX}
            isOpen={openAppIds.includes(app.id)}
            onClick={onAppClick}
          />
        ))}

        {/* Divider separator between standard apps and system utilities */}
        <div
          role="separator"
          aria-orientation="vertical"
          className="w-[1px] h-8 bg-slate-400/30 dark:bg-white/20 mx-0.5 mb-2.5 self-center rounded-full shrink-0"
        />

        {systemApps.map((app) => (
          <DockItem
            key={app.id}
            app={app}
            mouseX={mouseX}
            isOpen={openAppIds.includes(app.id)}
            onClick={onAppClick}
          />
        ))}
      </motion.nav>
    </footer>
  );
}
