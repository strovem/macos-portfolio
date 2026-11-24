'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { useNotificationStore, NotificationItem } from '@/stores/useNotificationStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { Z_INDEX } from '@/constants/zIndex';
import { AppIcon } from '@/components/dock/AppIcon';
import { AppMetadata } from '@/data/apps';

interface SingleToastProps {
  item: NotificationItem;
  onDismiss: (id: string) => void;
}

function SingleToast({ item, onDismiss }: SingleToastProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(item.duration ?? 5000);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss with pause on hover
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(1000, remainingTimeRef.current - elapsed);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, item.id, onDismiss]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent if close button was clicked
    if ((e.target as HTMLElement).closest('button[data-close]')) return;

    if (item.onAction) {
      item.onAction();
    } else if (item.targetAppId) {
      openWindow(item.targetAppId);
      focusWindow(item.targetAppId);
    }
    onDismiss(item.id);
  };

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 180 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) {
          onDismiss(item.id);
        }
      }}
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', damping: 24, stiffness: 360 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleClick}
      className="group relative flex items-start gap-3 p-3.5 rounded-2xl liquid-glass shadow-2xl border border-white/30 dark:border-white/10 max-w-sm w-full cursor-pointer select-none overflow-hidden transition-all duration-150 active:scale-[0.98]"
      role="alert"
    >
      {/* App Icon or Bell */}
      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
        {item.appId ? (
          <AppIcon iconType={item.appId as AppMetadata['iconType']} />
        ) : (
          <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center rounded-xl">
            <Bell className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-5">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
            {item.title}
          </h4>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono shrink-0">
            Now
          </span>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-snug line-clamp-2">
          {item.message}
        </p>

        {item.actionLabel && (
          <div className="mt-2">
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-600/90 text-white shadow-xs">
              {item.actionLabel}
            </span>
          </div>
        )}
      </div>

      {/* Close Button on Hover */}
      <button
        type="button"
        data-close="true"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(item.id);
        }}
        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer"
        title="Kapat"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

export function NotificationStack() {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{ zIndex: Z_INDEX.NOTIFICATION_STACK }}
      className="fixed top-10 right-4 sm:right-6 flex flex-col gap-2.5 pointer-events-auto max-w-sm w-[calc(100vw-2rem)] sm:w-88"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SingleToast key={toast.id} item={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
