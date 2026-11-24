'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { LayoutGrid, X, Folder, Music, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { useMissionControlStore } from '@/stores/useMissionControlStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { AppIcon } from '@/components/dock/AppIcon';
import { Z_INDEX } from '@/constants/zIndex';
import { AppMetadata } from '@/data/apps';
import { AppId, WindowState } from '@/types/os';
import { useTranslation } from '@/hooks/useTranslation';

export function MissionControl() {
  const { language, t } = useTranslation();
  const isOpen = useMissionControlStore((state) => state.isOpen);
  const closeMissionControl = useMissionControlStore((state) => state.closeMissionControl);

  const openWindows = useWindowStore(
    useShallow((state) => (isOpen ? Object.values(state.windows).filter((w) => w.isOpen) : []))
  );
  const activeWindowId = useWindowStore((state) => (isOpen ? state.activeWindowId : null));
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const openWindow = useWindowStore((state) => state.openWindow);

  const handleSelectWindow = (windowId: AppId) => {
    focusWindow(windowId);
    closeMissionControl();
  };

  const handleLaunchApp = (appId: AppId) => {
    openWindow(appId);
    focusWindow(appId);
    closeMissionControl();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeMissionControl}
          style={{ zIndex: Z_INDEX.MISSION_CONTROL }}
          className="fixed inset-0 bg-black/40 backdrop-blur-md select-none flex flex-col justify-between overflow-hidden"
        >
          {/* Top Virtual Desktops Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full pt-4 pb-2 px-6 flex items-center justify-between pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <div className="liquid-glass px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-white border border-white/25 shadow-lg">
                <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'tr' ? 'Masaüstü 1' : 'Desktop 1'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/70 px-2.5 py-1 rounded-full liquid-glass border border-white/15">
                {language === 'tr' ? 'Esc ile Çık' : 'Press Esc to Exit'}
              </span>
              <button
                type="button"
                onClick={closeMissionControl}
                className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                title={language === 'tr' ? 'Kapat' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Window Overview Grid */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 max-w-6xl w-full mx-auto p-6 flex items-center justify-center overflow-y-auto no-scrollbar pointer-events-auto"
          >
            {openWindows.length === 0 ? (
              /* Empty State: Quick Launcher */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="liquid-glass p-8 rounded-3xl border border-white/20 max-w-md w-full text-center shadow-2xl flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 text-white shadow-inner">
                  <LayoutGrid className="w-7 h-7 opacity-70" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {language === 'tr' ? 'Açık Pencere Yok' : 'No Open Windows'}
                </h3>
                <p className="text-xs text-white/70 max-w-xs mb-6">
                  {language === 'tr'
                    ? 'Şu an açık olan bir uygulama penceresi bulunmuyor. Aşağıdan hızlıca bir uygulama başlatabilirsiniz:'
                    : 'There are currently no open application windows. Quickly launch one below:'}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => handleLaunchApp('finder')}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer active:scale-95"
                  >
                    <Folder className="w-4 h-4 text-sky-400" />
                    <span>Finder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchApp('studio')}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer active:scale-95"
                  >
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>Studio (DAW)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchApp('notes')}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <span>Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchApp('messages')}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Messages</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Active Windows Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-center justify-center">
                {openWindows.map((win) => {
                  const isActive = activeWindowId === win.id;
                  return (
                    <motion.div
                      key={win.id}
                      layout
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.04, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      onClick={() => handleSelectWindow(win.id)}
                      className={`group relative rounded-2xl liquid-glass border cursor-pointer overflow-hidden shadow-2xl transition-all duration-200 ${
                        isActive
                          ? 'border-blue-400/80 ring-2 ring-blue-400/50'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      {/* Window Header Mockup */}
                      <div className="h-8 px-3 flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-black/15 dark:bg-white/10">
                        {/* Traffic lights */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeWindow(win.id);
                            }}
                            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-110 flex items-center justify-center cursor-pointer"
                            title="Kapat"
                          >
                            <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100" />
                          </button>
                          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                        </div>

                        {/* Title & App Icon */}
                        <div className="flex items-center gap-1.5 max-w-[65%] truncate">
                          <div className="w-3.5 h-3.5 shrink-0">
                            <AppIcon iconType={win.icon as AppMetadata['iconType']} />
                          </div>
                          <span className="text-[11px] font-bold text-white truncate">
                            {win.title}
                          </span>
                        </div>

                        {/* Status Tag */}
                        <div>
                          {win.isMinimized ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                              Simge
                            </span>
                          ) : isActive ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
                              Açık
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mockup Preview Body */}
                      <div className="h-44 sm:h-48 p-4 flex flex-col items-center justify-center text-center bg-black/20 dark:bg-black/35">
                        <div className="w-20 h-20 mb-3 drop-shadow-xl transition-transform group-hover:scale-110">
                          <AppIcon iconType={win.icon as AppMetadata['iconType']} />
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {win.title}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Hint */}
          <div className="p-3 text-center pointer-events-none">
            <span className="text-[10px] text-white/50 font-mono">
              Pencereye tıklayarak öne getirebilir veya Esc tuşuna basarak çıkabilirsiniz
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
