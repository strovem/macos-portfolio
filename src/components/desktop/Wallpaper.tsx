'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { WALLPAPERS, WallpaperOption } from '@/data/wallpapers';

export const Wallpaper: React.FC = () => {
  const activeWallpaperId = useSettingsStore((state) => state.activeWallpaperId);

  const currentWallpaper: WallpaperOption =
    WALLPAPERS.find((w) => w.id === activeWallpaperId) || WALLPAPERS[0];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
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
    </div>
  );
};
