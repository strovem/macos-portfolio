'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Wallpaper } from '@/components/desktop/Wallpaper';
import { FloatingBubbles } from '@/components/desktop/FloatingBubbles';
import { Menubar } from '@/components/menubar/Menubar';
import { Dock } from '@/components/dock/Dock';
import { Window } from '@/components/window/Window';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { AppId } from '@/types/os';
import { DESKTOP_ITEMS } from '@/data/desktopItems';
import { DesktopItem } from '@/components/desktop/DesktopItem';
import { Folder, HardDrive, Terminal as TermIcon, Globe, Image as ImageIcon, MessageCircle, FileText, Settings as GearIcon, Trash2 } from 'lucide-react';

export default function Home() {
  const brightness = useSettingsStore((state) => state.brightness);
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  // Desktop items z-index management for tactile elevation
  const [itemZIndices, setItemZIndices] = React.useState<Record<string, number>>({});
  const [maxItemZ, setMaxItemZ] = React.useState(1);

  const bringItemToFront = (id: string) => {
    setMaxItemZ((prev) => {
      const nextZ = prev + 1;
      setItemZIndices((indices) => ({ ...indices, [id]: nextZ }));
      return nextZ;
    });
  };

  // Synchronize menubar activeAppName with activeWindowId
  const activeAppName = activeWindowId
    ? windows[activeWindowId]?.title || (activeWindowId.charAt(0).toUpperCase() + activeWindowId.slice(1))
    : 'Finder';

  // Filter windows that are open and unminimized for rendering with AnimatePresence
  const openWindows = Object.values(windows).filter(
    (win) => win.isOpen && !win.isMinimized
  );

  const renderAppContent = (id: AppId) => {
    switch (id) {
      case 'finder':
        return (
          <div className="flex h-full text-xs">
            {/* Finder Sidebar */}
            <div className="w-48 bg-neutral-100/60 dark:bg-neutral-800/60 border-r border-black/5 dark:border-white/5 p-3 flex flex-col gap-4 select-none">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-neutral-500 tracking-wider px-2">Favorites</span>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#007AFF]/15 text-[#007AFF] font-medium">
                    <Folder className="w-3.5 h-3.5" />
                    <span>Projects</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Macintosh HD</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Finder Main Content */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 border border-blue-500/20">
                <Folder className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Portfolio Projects Directory</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
                Finder initialized with full multi-column navigation, project cards, and Quick Look integration coming in Task 6.
              </p>
            </div>
          </div>
        );

      case 'safari':
        return (
          <div className="flex flex-col h-full text-xs">
            {/* Safari Toolbar */}
            <div className="h-10 px-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-1.5 text-slate-400">
                <button type="button" className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">‹</button>
                <button type="button" className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">›</button>
              </div>
              <div className="flex-1 max-w-md mx-auto h-6 px-3 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px]">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>gucduck.portfolio.dev/welcome</span>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <Globe className="w-12 h-12 text-cyan-500 mb-3 opacity-80" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Safari Browser Engine</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
                Embedded browser preview and live project showcase interface.
              </p>
            </div>
          </div>
        );

      case 'terminal':
        return (
          <div className="h-full bg-slate-950 p-4 font-mono text-[12px] text-emerald-400 flex flex-col gap-2 selection:bg-emerald-500/30">
            <div className="text-slate-400 text-[11px]">Last login: Sun Nov 22 15:00:00 on ttys001</div>
            <div>
              <span className="text-cyan-400">guest@gucduck-macbook</span>:<span className="text-amber-400">~</span>$ neofetch
            </div>
            <div className="text-slate-300 text-xs leading-relaxed my-1">
              OS: macOS Web OS (x86_64 / arm64)<br />
              Host: Portfolio Virtual Container<br />
              Uptime: 99.9%<br />
              Shell: zsh 5.9 (custom interactive CLI)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">guest@gucduck-macbook</span>:<span className="text-amber-400">~</span>$
              <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse" />
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="flex h-full text-xs">
            <div className="w-48 bg-amber-50/40 dark:bg-neutral-800/50 border-r border-black/5 dark:border-white/5 p-3 flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">Quick Notes</span>
              <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/20">
                <div className="font-semibold text-slate-800 dark:text-white">About Me</div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">Senior Software & Design...</div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-amber-500 mb-3 opacity-80" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">macOS Notes App</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
                Rich Markdown notebook highlighting engineering philosophy, experience, and background.
              </p>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="flex h-full text-xs">
            <div className="w-48 bg-neutral-100/60 dark:bg-neutral-800/60 border-r border-black/5 dark:border-white/5 p-3 flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-neutral-500">Conversations</span>
              <div className="p-2 rounded-lg bg-green-500/15 border border-green-500/20">
                <div className="font-semibold text-slate-800 dark:text-white">GucDuck Studio</div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">Hey! Feel free to reach out...</div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <MessageCircle className="w-12 h-12 text-green-500 mb-3 opacity-80" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Direct Messages & Contact</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
                Interactive chat messenger to send direct inquiries or discuss opportunities.
              </p>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="h-full p-6 flex flex-col items-center justify-center text-center text-xs">
            <ImageIcon className="w-12 h-12 text-purple-500 mb-3 opacity-80" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Photos & Gallery</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
              Visual portfolio gallery featuring UI designs, 3D renderings, and project snapshots.
            </p>
          </div>
        );

      case 'settings':
        return (
          <div className="h-full p-6 flex flex-col items-center justify-center text-center text-xs">
            <GearIcon className="w-12 h-12 text-slate-500 mb-3 opacity-80" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">System Settings</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
              Personalize wallpapers, dark/light themes, sound effects, and ambient particles.
            </p>
          </div>
        );

      case 'trash':
        return (
          <div className="h-full p-6 flex flex-col items-center justify-center text-center text-xs">
            <Trash2 className="w-12 h-12 text-slate-400 mb-3 opacity-80" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Trash</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
              0 items in Trash. Drag files here or clean temporary cache.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      {/* Dynamic Wallpaper Canvas */}
      <Wallpaper />

      {/* Floating Ambient Glass Bubbles */}
      <FloatingBubbles />

      {/* Screen Brightness Overlay */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-[45] transition-opacity duration-150"
          style={{
            backgroundColor: 'black',
            opacity: ((100 - brightness) / 100) * 0.75,
          }}
        />
      )}

      {/* Menubar (top-0 fixed z-50) */}
      <Menubar activeAppName={activeAppName} />

      {/* Draggable Desktop Canvas Playground (gucduck-style cards & tactile stickers) */}
      <div className="absolute inset-0 pt-7 pb-20 pointer-events-none z-[15] overflow-hidden">
        {DESKTOP_ITEMS.map((item) => (
          <DesktopItem
            key={item.id}
            item={item}
            zIndex={itemZIndices[item.id] || 1}
            onFocus={() => bringItemToFront(item.id)}
          />
        ))}
      </div>

      {/* Desktop Canvas Root */}
      <div className="absolute inset-0 pt-7 flex flex-col justify-between pointer-events-none z-20">
        {/* Open Windows Render Canvas */}
        <div className="flex-1 relative pointer-events-none">
          <AnimatePresence>
            {openWindows.map((win) => (
              <Window key={win.id} id={win.id}>
                {renderAppContent(win.id)}
              </Window>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Spring-Magnified macOS Dock (bottom-3 fixed z-40) */}
      <Dock />
    </main>
  );
}
