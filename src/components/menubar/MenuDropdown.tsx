'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MenuItem {
  id?: string;
  label?: string;
  shortcut?: string;
  isDivider?: boolean;
  disabled?: boolean;
  action?: () => void;
  icon?: React.ReactNode;
}

export interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  className?: string;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  isOpen,
  onClose,
  items,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Allow menubar triggers to handle their own toggle without collision
        const target = e.target as HTMLElement;
        if (!target.closest('[data-menubar-trigger]')) {
          onClose();
        }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.97, y: -2 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -2 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className={`absolute top-full left-0 mt-0.5 min-w-[220px] backdrop-blur-xl bg-white/85 dark:bg-neutral-900/85 border border-black/10 dark:border-white/10 shadow-2xl rounded-lg py-1 text-xs z-50 text-slate-800 dark:text-slate-100 select-none ${className}`}
        >
          {items.map((item, idx) => {
            if (item.isDivider) {
              return (
                <div
                  key={`divider-${idx}`}
                  className="h-[1px] bg-black/10 dark:bg-white/10 my-1 mx-1.5"
                />
              );
            }

            if (item.disabled) {
              return (
                <div
                  key={item.id || item.label || idx}
                  className="px-2.5 py-1 mx-1 flex items-center justify-between text-slate-400 dark:text-neutral-500 cursor-not-allowed select-none rounded-[4px]"
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <span className="font-mono text-[11px] tracking-wider text-slate-400 dark:text-neutral-500">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id || item.label || idx}
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  }
                  onClose();
                }}
                className="w-[calc(100%-8px)] mx-1 px-2.5 py-1 text-left flex items-center justify-between rounded-[4px] cursor-default transition-colors group hover:bg-[#007AFF] hover:text-white focus:outline-none"
              >
                <span className="flex items-center gap-2 font-normal">
                  {item.icon}
                  {item.label}
                </span>
                {item.shortcut && (
                  <span className="font-mono text-[11px] tracking-wider text-slate-400 dark:text-neutral-400 group-hover:text-white transition-colors">
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
