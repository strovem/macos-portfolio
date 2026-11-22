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
import { Trash2 } from 'lucide-react';
import { FinderApp } from '@/components/apps/FinderApp';
import { SafariApp } from '@/components/apps/SafariApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { NotesApp } from '@/components/apps/NotesApp';
import { MessagesApp } from '@/components/apps/MessagesApp';
import { PhotosApp } from '@/components/apps/PhotosApp';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { ToneGeneratorApp } from '@/components/apps/ToneGeneratorApp';
import { StudioApp } from '@/components/apps/StudioApp';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function Home() {
  const brightness = useSettingsStore((state) => state.brightness);
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const isMobile = useIsMobile();

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
        return <FinderApp />;
      case 'safari':
        return <SafariApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'notes':
        return <NotesApp />;
      case 'messages':
        return <MessagesApp />;
      case 'photos':
        return <PhotosApp />;
      case 'settings':
        return <SettingsApp />;
      case 'tonegenerator':
        return <ToneGeneratorApp />;
      case 'studio':
        return <StudioApp />;
      case 'trash':
        return (
          <div className="h-full p-6 flex flex-col items-center justify-center text-center text-xs bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 font-sans">
            <Trash2 className="w-12 h-12 text-slate-400 mb-3 opacity-60" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Trash is Empty</h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm">
              All system files and portfolio assets are in pristine condition. No deleted files found.
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

      {/* Draggable Desktop Canvas Playground (Responsive vertical stack on mobile, free-canvas on desktop) */}
      {isMobile ? (
        <div className="absolute inset-0 pt-10 pb-24 px-4 overflow-y-auto no-scrollbar z-[15] pointer-events-auto flex flex-col items-center gap-4">
          {DESKTOP_ITEMS.map((item) => (
            <DesktopItem
              key={item.id}
              item={item}
              isMobile={true}
              zIndex={itemZIndices[item.id] || 1}
              onFocus={() => bringItemToFront(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 pt-7 pb-20 pointer-events-none z-[15] overflow-hidden">
          {DESKTOP_ITEMS.map((item) => (
            <DesktopItem
              key={item.id}
              item={item}
              isMobile={false}
              zIndex={itemZIndices[item.id] || 1}
              onFocus={() => bringItemToFront(item.id)}
            />
          ))}
        </div>
      )}

      {/* Desktop Canvas Root */}
      <div className="absolute inset-0 pt-7 flex flex-col justify-between pointer-events-none z-20">
        {/* Open Windows Render Canvas */}
        <div className="flex-1 relative pointer-events-none">
          <AnimatePresence>
            {openWindows.map((win) => (
              <Window key={win.id} id={win.id} hideHeader={win.id === 'finder'}>
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
