'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSwitcherStore } from '@/stores/useAppSwitcherStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { APPS } from '@/data/apps';
import { AppIcon } from '@/components/dock/AppIcon';

export const AppSwitcherHUD: React.FC = () => {
  const { isOpen, openApps, selectedIndex } = useAppSwitcherStore();
  const windows = useWindowStore((state) => state.windows);

  if (!isOpen || openApps.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2 border border-black/10 dark:border-white/15 min-w-[200px]"
        >
          {/* App Icons Row */}
          <div className="flex items-center gap-2">
            {openApps.map((appId, idx) => {
              const isSelected = selectedIndex === idx;
              const appMeta = APPS.find((a) => a.id === appId);
              const iconType = appMeta?.iconType || 'finder';

              return (
                <div
                  key={appId}
                  className={`relative p-2 rounded-xl transition-all duration-150 flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-black/15 dark:bg-white/20 border border-[#007AFF] shadow-md scale-105'
                      : 'opacity-70 scale-95'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <AppIcon iconType={iconType} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active App Title */}
          <div className="text-xs font-semibold text-slate-800 dark:text-white px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
            {windows[openApps[selectedIndex]]?.title || openApps[selectedIndex]}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
