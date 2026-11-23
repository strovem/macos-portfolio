'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Play,
  Pause,
  Sliders,
  XCircle,
  FileText,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { WALLPAPERS } from '@/data/wallpapers';
import { AppId } from '@/types/os';

export interface DesktopContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const { activeWallpaperId, setWallpaper } = useSettingsStore();
  const { isPlaying, togglePlay, currentTrack } = useAudioStore();
  const { windows, closeWindow, openWindow } = useWindowStore();

  // Clamp coordinates inside window viewport
  const menuWidth = 230;
  const menuHeight = 220;

  const clampedX =
    typeof window !== 'undefined'
      ? Math.min(x, window.innerWidth - menuWidth - 12)
      : x;
  const clampedY =
    typeof window !== 'undefined'
      ? Math.min(y, window.innerHeight - menuHeight - 12)
      : y;

  // Handle click outside and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNextWallpaper = () => {
    const currentIndex = WALLPAPERS.findIndex((w) => w.id === activeWallpaperId);
    const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
    setWallpaper(WALLPAPERS[nextIndex].id);
    onClose();
  };

  const handleToggleMusic = () => {
    togglePlay();
    onClose();
  };

  const handleOpenStudio = () => {
    openWindow('studio');
    onClose();
  };

  const handleCloseAllWindows = () => {
    Object.keys(windows).forEach((id) => {
      closeWindow(id as AppId);
    });
    onClose();
  };

  const handleOpenAbout = () => {
    openWindow('notes');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{ top: clampedY, left: clampedX }}
          className="fixed z-50 w-56 rounded-xl backdrop-blur-2xl bg-white/85 dark:bg-neutral-900/85 border border-black/10 dark:border-white/12 shadow-[0_15px_35px_rgba(0,0,0,0.35)] py-1.5 px-1 select-none text-slate-800 dark:text-neutral-100 text-xs font-sans"
        >
          {/* Item 1: Next Wallpaper */}
          <button
            type="button"
            onClick={handleNextWallpaper}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
              <span>Sonraki Duvar Kağıdı</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-white/80 font-mono">
              ⌥W
            </span>
          </button>

          {/* Item 2: Play/Pause Audio */}
          <button
            type="button"
            onClick={handleToggleMusic}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
              ) : (
                <Play className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white ml-0.5" />
              )}
              <span className="truncate max-w-[130px]">
                {isPlaying ? 'Müziği Duraklat' : 'Müziği Oynat'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-white/80 font-mono">
              Space
            </span>
          </button>

          {/* Item 3: Open Studio DAW */}
          <button
            type="button"
            onClick={handleOpenStudio}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-purple-500 group-hover:text-white" />
              <span>Studio DAW'ı Aç</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-white/80 font-mono">
              ⌘1
            </span>
          </button>

          <div className="h-px bg-black/5 dark:bg-white/10 my-1 mx-1.5" />

          {/* Item 4: Close All Windows */}
          <button
            type="button"
            onClick={handleCloseAllWindows}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-rose-500 group-hover:text-white" />
              <span>Pencereleri Kapat</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-white/80 font-mono">
              ⌥⌘W
            </span>
          </button>

          <div className="h-px bg-black/5 dark:bg-white/10 my-1 mx-1.5" />

          {/* Item 5: About Hüseyin Korumtaş */}
          <button
            type="button"
            onClick={handleOpenAbout}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
              <span>Hüseyin Korumtaş Hakkında</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-white/80">
              Notes
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
