'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, X, ChevronRight } from 'lucide-react';
import { useNotificationStore, NotificationItem } from '@/stores/useNotificationStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { AppIcon } from '@/components/dock/AppIcon';
import { AppMetadata } from '@/data/apps';

export function NotificationCenter() {
  const isCenterOpen = useNotificationStore((state) => state.isCenterOpen);
  const closeCenter = useNotificationStore((state) => state.closeCenter);
  const history = useNotificationStore((state) => state.history);
  const clearHistory = useNotificationStore((state) => state.clearHistory);
  const removeHistoryItem = useNotificationStore((state) => state.removeHistoryItem);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  // Client-safe formatted date
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    setCurrentDateStr(formatter.format(now));
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isCenterOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCenter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCenterOpen, closeCenter]);

  const handleItemClick = (item: NotificationItem) => {
    if (item.onAction) {
      item.onAction();
    } else if (item.targetAppId) {
      openWindow(item.targetAppId);
      focusWindow(item.targetAppId);
    }
    closeCenter();
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Az önce';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} sa önce`;
    return new Date(timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <AnimatePresence>
      {isCenterOpen && (
        <>
          {/* Subtle click-outside backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeCenter}
            className="fixed inset-0 z-[75] bg-black/10 dark:bg-black/25"
          />

          {/* Sliding Notification Drawer */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-7 right-0 bottom-0 w-84 sm:w-96 z-[80] liquid-glass border-l border-white/20 dark:border-white/10 shadow-2xl flex flex-col select-none overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 pb-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">
                  {currentDateStr || 'Bugün'}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>Bildirimler</span>
                  {history.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                      {history.length}
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                    title="Tümünü Temizle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Temizle</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeCenter}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Kapat (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List Body */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto no-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-neutral-500">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 opacity-40" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Yeni Bildirim Yok
                  </p>
                  <p className="text-xs max-w-xs text-slate-500 dark:text-neutral-400">
                    Sistem olayları ve gelen mesajlar bu alanda listelenir.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="group relative p-3 rounded-xl bg-white/70 dark:bg-neutral-800/70 hover:bg-white/95 dark:hover:bg-neutral-800/95 border border-black/5 dark:border-white/10 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start gap-3"
                  >
                    {/* App Icon */}
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
                      {item.appId ? (
                        <AppIcon iconType={item.appId as AppMetadata['iconType']} />
                      ) : (
                        <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center rounded-lg">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono shrink-0 ml-2">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(item.id);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
