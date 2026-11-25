'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Disc3, Folder, Terminal, Compass } from 'lucide-react';
import { useWindowStore } from '@/stores/useWindowStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { playClickSound } from '@/utils/systemSounds';
import { AppId } from '@/types/os';
import { APPS } from '@/data/apps';
import { AppIcon } from '@/components/dock/AppIcon';
import { Z_INDEX } from '@/constants/zIndex';

function MiniWindowContent({ id }: { id: AppId }) {
  switch (id) {
    case 'studio':
      return (
        <div className="w-full h-full rounded-md bg-gradient-to-br from-indigo-950/80 to-purple-950/80 p-1.5 flex flex-col justify-between border border-white/5">
          <div className="flex items-center gap-1 text-[8px] text-purple-300">
            <Disc3 className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="truncate">Audio Lab</span>
          </div>
          <div className="flex items-end gap-[1.5px] h-3 px-0.5">
            <span className="w-1 h-2 bg-purple-400 rounded-sm" />
            <span className="w-1 h-3 bg-indigo-400 rounded-sm" />
            <span className="w-1 h-1.5 bg-purple-400 rounded-sm" />
            <span className="w-1 h-2.5 bg-indigo-300 rounded-sm" />
            <span className="w-1 h-1 bg-purple-500 rounded-sm" />
          </div>
        </div>
      );
    case 'terminal':
      return (
        <div className="w-full h-full rounded-md bg-black/90 p-1.5 font-mono text-[7px] text-emerald-400 flex flex-col justify-between border border-emerald-500/20">
          <p className="truncate opacity-80">&gt; korumtas$ zsh</p>
          <div className="flex items-center gap-0.5 text-white/50">
            <Terminal className="w-2 h-2 text-emerald-400" />
            <span className="truncate">ready</span>
          </div>
        </div>
      );
    case 'safari':
      return (
        <div className="w-full h-full rounded-md bg-neutral-900/80 p-1.5 flex flex-col gap-1 border border-white/5">
          <div className="w-full h-2 rounded bg-white/10 flex items-center px-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400" />
          </div>
          <div className="w-full flex-1 rounded bg-white/5 flex items-center justify-center">
            <Compass className="w-3 h-3 text-cyan-400/50" />
          </div>
        </div>
      );
    case 'finder':
      return (
        <div className="w-full h-full rounded-md bg-blue-950/40 p-1.5 flex flex-col justify-between border border-white/5">
          <div className="grid grid-cols-3 gap-1">
            <Folder className="w-2.5 h-2.5 text-blue-400 fill-blue-400/30" />
            <Folder className="w-2.5 h-2.5 text-blue-400 fill-blue-400/30" />
            <Folder className="w-2.5 h-2.5 text-blue-400 fill-blue-400/30" />
          </div>
          <p className="text-[7px] text-blue-300/60 truncate">Documents</p>
        </div>
      );
    case 'messages':
      return (
        <div className="w-full h-full rounded-md bg-emerald-950/40 p-1.5 flex flex-col justify-between border border-white/5">
          <div className="w-3/4 h-2 rounded-full bg-emerald-500/30 self-start" />
          <div className="w-2/3 h-2 rounded-full bg-blue-500/40 self-end" />
        </div>
      );
    case 'notes':
      return (
        <div className="w-full h-full rounded-md bg-amber-950/40 p-1.5 flex flex-col gap-1 border border-white/5">
          <div className="w-full h-0.5 bg-amber-400/30 rounded" />
          <div className="w-4/5 h-0.5 bg-amber-400/20 rounded" />
          <div className="w-3/5 h-0.5 bg-amber-400/20 rounded" />
        </div>
      );
    default:
      return (
        <div className="w-full h-full rounded-md bg-white/5 p-1.5 flex items-center justify-center border border-white/5">
          <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      );
  }
}

export function StageManagerStrip() {
  const stageManagerEnabled = useSettingsStore((state) => state.stageManagerEnabled);
  const displayWindowsKey = useWindowStore((state) =>
    Object.values(state.windows)
      .filter((win) => win.isOpen && !win.isMinimized && !state.stageWindowIds.includes(win.id))
      .slice(0, 5)
      .map((win) => `${win.id}\x01${win.title}`)
      .join('\x02')
  );
  const displayWindows = React.useMemo(
    () =>
      displayWindowsKey
        ? displayWindowsKey.split('\x02').map((entry) => {
            const [id, title] = entry.split('\x01');
            return { id: id as AppId, title };
          })
        : [],
    [displayWindowsKey]
  );
  const switchStageTo = useWindowStore((state) => state.switchStageTo);
  const addWindowToStage = useWindowStore((state) => state.addWindowToStage);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const { language } = useTranslation();

  const isVisible = stageManagerEnabled && displayWindows.length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="Stage Manager Strip"
          style={{ zIndex: Z_INDEX.STAGE_MANAGER_STRIP }}
          className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 flex-col gap-3 select-none pointer-events-auto"
        >
          {displayWindows.map((win) => {
            const appMeta = APPS.find((a) => a.id === win.id);

            return (
              <motion.div
                key={win.id}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.85, rotateY: 16 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotateY: 16 }}
                exit={{ opacity: 0, x: -50, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{
                  transformPerspective: 900,
                  transformStyle: 'preserve-3d',
                }}
                whileHover={{
                  rotateY: 0,
                  scale: 1.05,
                  transition: { duration: 0.18, ease: 'easeOut' },
                }}
                className="relative group cursor-pointer"
                onClick={(e) => {
                  playClickSound();
                  if (e.shiftKey) {
                    addWindowToStage(win.id);
                  } else {
                    switchStageTo(win.id);
                  }
                }}
              >
                {/* Close Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    closeWindow(win.id);
                  }}
                  title={language === 'tr' ? 'Kapat' : 'Close'}
                  className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md z-20"
                >
                  <X className="w-2.5 h-2.5" />
                </button>

                {/* 3D Angled Glass Preview Card */}
                <div className="w-36 h-24 rounded-xl border border-white/20 bg-[#0a0a0c]/60 backdrop-blur-xl p-2 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:border-white/40 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.5)] transition-colors duration-200">
                  {/* Header: App icon + Title */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    {appMeta && (
                      <div className="w-3.5 h-3.5 shrink-0">
                        <AppIcon iconType={appMeta.iconType} />
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-white/90 truncate leading-tight">
                      {win.title}
                    </span>
                  </div>

                  {/* Body: Symbolic Application Content Preview */}
                  <div className="w-full flex-1 mt-1.5 overflow-hidden">
                    <MiniWindowContent id={win.id} />
                  </div>
                </div>

                {/* Shift-click tooltip indicator on hover */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/80 text-[9px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg backdrop-blur-md">
                  {language === 'tr' ? 'Shift + Tık: Sahneye Ekle' : 'Shift + Click: Add to Stage'}
                </div>
              </motion.div>
            );
          })}
        </aside>
      )}
    </AnimatePresence>
  );
}
