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
import { Trash2, Search, Sparkles, Moon, Sliders, RotateCcw, HelpCircle } from 'lucide-react';
import { FinderApp } from '@/components/apps/FinderApp';
import { SafariApp } from '@/components/apps/SafariApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { NotesApp } from '@/components/apps/NotesApp';
import { MessagesApp } from '@/components/apps/MessagesApp';
import { PhotosApp } from '@/components/apps/PhotosApp';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { ToneGeneratorApp } from '@/components/apps/ToneGeneratorApp';
import { StudioApp } from '@/components/apps/StudioApp';
import { ContextMenu } from '@/components/os/ContextMenu';
import { DesktopMarquee } from '@/components/os/DesktopMarquee';
import { SpotlightModal } from '@/components/os/SpotlightModal';
import { AppSwitcherHUD } from '@/components/os/AppSwitcherHUD';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { WALLPAPERS } from '@/data/wallpapers';
import { ContextMenuEntry } from '@/types/os';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function Home() {
  const brightness = useSettingsStore((state) => state.brightness);
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const isMobile = useIsMobile();

  // Global keyboard shortcuts (Cmd+K, Alt+W, Alt+M, Alt+Tab, Esc)
  useKeyboardShortcuts();

  const openContextMenu = useContextMenuStore((state) => state.openContextMenu);
  const openSpotlight = useSpotlightStore((state) => state.openSpotlight);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const setWallpaper = useSettingsStore((state) => state.setWallpaper);
  const activeWallpaperId = useSettingsStore((state) => state.activeWallpaperId);
  const minimizeAllWindows = useWindowStore((state) => state.minimizeAllWindows);
  const resetWindows = useWindowStore((state) => state.resetWindows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const unfocusAllWindows = useWindowStore((state) => state.unfocusAllWindows);

  const handleDesktopPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-window]') ||
      target.closest('[data-dock]') ||
      target.closest('[data-desktop-item]') ||
      target.closest('header') ||
      target.closest('[data-context-menu]') ||
      target.closest('[data-modal]')
    ) {
      return;
    }
    unfocusAllWindows();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Disabled on mobile viewports (< 768px)
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('[data-window]') ||
      target.closest('[data-dock]') ||
      target.closest('[data-desktop-item]') ||
      target.closest('header') ||
      target.closest('[data-context-menu]') ||
      target.closest('[data-modal]')
    ) {
      return;
    }

    e.preventDefault();

    const desktopItems: ContextMenuEntry[] = [
      {
        label: 'Spotlight Ara...',
        shortcut: '⌘K',
        icon: <Search className="w-3.5 h-3.5 text-blue-500" />,
        onClick: openSpotlight,
      },
      { separator: true },
      {
        label: 'Duvar Kağıdını Değiştir',
        shortcut: '⌥W',
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
        onClick: () => {
          const currentIndex = WALLPAPERS.findIndex((w) => w.id === activeWallpaperId);
          const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
          setWallpaper(WALLPAPERS[nextIndex].id);
        },
      },
      {
        label: 'Açık / Koyu Mod Değiştir',
        shortcut: '⌥T',
        icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
        onClick: toggleDarkMode,
      },
      {
        label: 'Tüm Pencereleri Küçült',
        shortcut: '⌥M',
        icon: <Sliders className="w-3.5 h-3.5 text-slate-500" />,
        onClick: minimizeAllWindows,
      },
      {
        label: 'Pencereleri Sıfırla',
        icon: <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />,
        onClick: resetWindows,
      },
      { separator: true },
      {
        label: 'Bu Mac Hakkında',
        icon: <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />,
        onClick: () => openWindow('notes'),
      },
    ];

    openContextMenu(e.clientX, e.clientY, desktopItems);
  };

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
  const activeWindow = activeWindowId ? windows[activeWindowId] : null;
  const isTargetActive = Boolean(activeWindow && activeWindow.isOpen && !activeWindow.isMinimized && activeWindowId);
  const activeAppName = isTargetActive && activeWindow && activeWindowId
    ? activeWindow.title || (activeWindowId.charAt(0).toUpperCase() + activeWindowId.slice(1))
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
    <main
      onContextMenu={handleContextMenu}
      onPointerDown={handleDesktopPointerDown}
      className="relative w-full h-full overflow-hidden select-none"
    >
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

      {/* Draggable Desktop Canvas Playground (Pure CSS Responsive: Vertical stack on mobile, free-canvas on desktop) */}
      {/* 1. Mobile Desktop Stack: block md:hidden. Zero-delay vertical stack, no horizontal overflow or swiping */}
      <div className="block md:hidden absolute inset-0 pt-10 pb-28 px-3 overflow-y-auto overflow-x-hidden no-scrollbar z-[15] pointer-events-auto">
        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto py-2">
          {DESKTOP_ITEMS.map((item) => (
            <div key={`mobile-wrap-${item.id}`} className="w-full flex justify-center">
              <DesktopItem
                key={`mobile-${item.id}`}
                item={item}
                isMobile={true}
                zIndex={itemZIndices[item.id] || 1}
                onFocus={() => bringItemToFront(item.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Desktop Canvas: hidden md:block. Draggable tactile playground for desktop screens */}
      <div className="hidden md:block absolute inset-0 pt-7 pb-20 pointer-events-none z-[15] overflow-hidden">
        {DESKTOP_ITEMS.map((item) => (
          <DesktopItem
            key={`desktop-${item.id}`}
            item={item}
            isMobile={false}
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
              <Window key={win.id} id={win.id} hideHeader={win.id === 'finder'}>
                {renderAppContent(win.id)}
              </Window>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Spring-Magnified macOS Dock (bottom-3 fixed z-40) */}
      <Dock />

      {/* Dynamic macOS Liquid Glass Overlays & Input Layer */}
      <ContextMenu />
      <DesktopMarquee disabled={isMobile} />
      <SpotlightModal />
      <AppSwitcherHUD />
    </main>
  );
}
