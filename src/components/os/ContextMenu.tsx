'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { ContextMenuEntry, ContextMenuItem } from '@/types/os';
import { playClickSound } from '@/utils/soundEffects';
import { Z_INDEX } from '@/constants/zIndex';

export function useContextMenu() {
  const openContextMenu = useContextMenuStore((state) => state.openContextMenu);
  const closeContextMenu = useContextMenuStore((state) => state.closeContextMenu);

  const handleContextMenu = (e: React.MouseEvent, items: ContextMenuEntry[]) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, items);
  };

  return { handleContextMenu, closeContextMenu };
}

export const ContextMenu: React.FC = () => {
  const { isOpen, x, y, items, closeContextMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });

  // Calculate position with viewport clamping and flip
  useEffect(() => {
    if (!isOpen) return;

    const estimatedWidth = 220;
    const estimatedHeight = Math.max(100, items.length * 32 + 20);

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

    let targetX = x;
    let targetY = y;

    // Flip to left if overflowing right edge
    if (x + estimatedWidth > winW - 12) {
      targetX = Math.max(12, x - estimatedWidth);
    }

    // Flip to top if overflowing bottom edge
    if (y + estimatedHeight > winH - 12) {
      targetY = Math.max(34, y - estimatedHeight);
    }

    setPosition({ x: targetX, y: targetY });
  }, [isOpen, x, y, items.length]);

  // Click outside and Esc key listeners
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeContextMenu]);

  return (
    <AnimatePresence>
      {isOpen && items.length > 0 && (
        <motion.div
          ref={menuRef}
          data-context-menu="true"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          style={{ top: position.y, left: position.x, zIndex: Z_INDEX.CONTEXT_MENU }}
          className="fixed w-56 rounded-xl liquid-glass py-1.5 px-1 select-none text-slate-800 dark:text-neutral-100 text-xs font-sans shadow-2xl"
        >
          {items.map((entry, idx) => {
            if (entry.separator) {
              return (
                <div
                  key={`sep-${idx}`}
                  className="h-px bg-black/10 dark:bg-white/10 my-1 mx-1.5"
                />
              );
            }

            const item = entry as ContextMenuItem;
            return (
              <button
                key={`item-${idx}-${item.label}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  item.onClick();
                  closeContextMenu();
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors group focus:outline-none cursor-pointer ${
                  item.variant === 'danger'
                    ? 'hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400'
                    : 'hover:bg-[#007AFF] hover:text-white text-slate-800 dark:text-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.icon && (
                    <span className="shrink-0 text-slate-600 dark:text-slate-300 group-hover:text-white">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="shrink-0 text-[10px] text-slate-400 dark:text-neutral-500 group-hover:text-white/80 font-mono ml-2">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
