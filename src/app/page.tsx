'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { Wallpaper } from '@/components/desktop/Wallpaper';
import { WeatherAtmosphere } from '@/components/os/WeatherAtmosphere';
import { FloatingBubbles } from '@/components/desktop/FloatingBubbles';
import { Menubar } from '@/components/menubar/Menubar';
import { Dock } from '@/components/dock/Dock';
import { Window } from '@/components/window/Window';
import { WindowSnapOverlay } from '@/components/window/WindowSnapOverlay';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { AppId } from '@/types/os';
import { DESKTOP_ITEMS } from '@/data/desktopItems';
import { DesktopItem } from '@/components/desktop/DesktopItem';
import { Trash2, Search, Sparkles, Moon, Sliders, RotateCcw, HelpCircle, LayoutGrid, Lock } from 'lucide-react';
import { FinderApp } from '@/components/apps/FinderApp';
import { NotesApp } from '@/components/apps/NotesApp';
import { MessagesApp } from '@/components/apps/MessagesApp';
import { ContextMenu } from '@/components/os/ContextMenu';
import { DesktopMarquee } from '@/components/os/DesktopMarquee';
import { SpotlightModal } from '@/components/os/SpotlightModal';
import { AppSwitcherHUD } from '@/components/os/AppSwitcherHUD';
import { NotificationStack } from '@/components/os/NotificationStack';
import { NotificationCenter } from '@/components/os/NotificationCenter';
import { DragPillOverlay } from '@/components/os/DragPillOverlay';
import { DynamicNotch } from '@/components/os/DynamicNotch';
import { StageManagerStrip } from '@/components/os/StageManagerStrip';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUrlDeepLink } from '@/hooks/useUrlDeepLink';
import { useTranslation } from '@/hooks/useTranslation';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useMissionControlStore } from '@/stores/useMissionControlStore';
import { useLockStore } from '@/stores/useLockStore';
import { WALLPAPERS } from '@/data/wallpapers';
import { ContextMenuEntry } from '@/types/os';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Z_INDEX } from '@/constants/zIndex';

const WindowLoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-8 text-slate-500 dark:text-neutral-400 bg-white/40 dark:bg-black/40 backdrop-blur-md">
    <div className="w-8 h-8 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin mb-3 opacity-80" />
    <span className="text-xs font-medium tracking-tight text-slate-600 dark:text-neutral-300">Uygulama Yükleniyor...</span>
  </div>
);

// Heavy Applications — Lazy Loaded On-Demand to optimize First Load JS bundle
const SafariApp = dynamic(() => import('@/components/apps/SafariApp').then((m) => m.SafariApp), {
  ssr: false,
  loading: WindowLoadingSkeleton,
});
const TerminalApp = dynamic(() => import('@/components/apps/TerminalApp').then((m) => m.TerminalApp), {
  ssr: false,
  loading: WindowLoadingSkeleton,
});
const PhotosApp = dynamic(() => import('@/components/apps/PhotosApp').then((m) => m.PhotosApp), {
  ssr: false,
  loading: WindowLoadingSkeleton,
});
const SettingsApp = dynamic(() => import('@/components/apps/SettingsApp').then((m) => m.SettingsApp), {
  ssr: false,
  loading: WindowLoadingSkeleton,
});
const ToneGeneratorApp = dynamic(() => import('@/components/apps/ToneGeneratorApp').then((m) => m.ToneGeneratorApp), {
  ssr: false,
  loading: WindowLoadingSkeleton,
});
const StudioApp = dynamic(() => import('@/components/apps/StudioApp').then((m) => m.StudioApp), {
  ssr: false,
  loading: WindowLoadingSkeleton,
});

// Heavy Full-Screen System Overlays — Lazy Loaded
const MissionControl = dynamic(() => import('@/components/os/MissionControl').then((m) => m.MissionControl), {
  ssr: false,
});
const LockScreen = dynamic(() => import('@/components/os/LockScreen').then((m) => m.LockScreen), {
  ssr: false,
});

export default function Home() {
  const desktopMainRef = React.useRef<HTMLElement>(null);
  const brightness = useSettingsStore((state) => state.brightness);
  const stageManagerEnabled = useSettingsStore((state) => state.stageManagerEnabled);
  const openWindowIds = useWindowStore(
    useShallow((state) =>
      Object.values(state.windows)
        .filter((win) => win.isOpen && !win.isMinimized)
        .map((win) => win.id)
    )
  );
  const activeAppName = useWindowStore((state) => {
    const activeWin = state.activeWindowId ? state.windows[state.activeWindowId] : null;
    if (activeWin && activeWin.isOpen && !activeWin.isMinimized && state.activeWindowId) {
      return (
        activeWin.title ||
        state.activeWindowId.charAt(0).toUpperCase() + state.activeWindowId.slice(1)
      );
    }
    return 'Finder';
  });
  const toggleDesktopPeek = useWindowStore((state) => state.toggleDesktopPeek);
  const isLocked = useLockStore((state) => state.isLocked);
  const isSleeping = useLockStore((state) => state.isSleeping);
  const isMobile = useIsMobile();

  // Make background OS surface non-interactive (keyboard/focus trapped) when locked or sleeping
  useEffect(() => {
    if (desktopMainRef.current) {
      desktopMainRef.current.inert = isLocked || isSleeping;
    }
  }, [isLocked, isSleeping]);

  // Global keyboard shortcuts (Cmd+K, Alt+W, Alt+M, Alt+Tab, Esc)
  useKeyboardShortcuts();

  // URL Deep-Linking & Shareable link synchronization (?app=studio, ?app=finder&section=music)
  useUrlDeepLink();

  // Viewport resize guard: clamp open windows inside viewport boundaries
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        useWindowStore.getState().clampAllWindowsToViewport(window.innerWidth, window.innerHeight);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const openContextMenu = useContextMenuStore((state) => state.openContextMenu);
  const openSpotlight = useSpotlightStore((state) => state.openSpotlight);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const setWallpaper = useSettingsStore((state) => state.setWallpaper);
  const activeWallpaperId = useSettingsStore((state) => state.activeWallpaperId);
  const minimizeAllWindows = useWindowStore((state) => state.minimizeAllWindows);
  const resetWindows = useWindowStore((state) => state.resetWindows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const unfocusAllWindows = useWindowStore((state) => state.unfocusAllWindows);

  const pushNotification = useNotificationStore((state) => state.pushNotification);
  const toggleMissionControl = useMissionControlStore((state) => state.toggleMissionControl);
  const lock = useLockStore((state) => state.lock);
  const { t } = useTranslation();

  // First Visit Welcome Notification (once per session via sessionStorage)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const alreadyShown = sessionStorage.getItem('macos_welcome_shown');
      if (!alreadyShown) {
        sessionStorage.setItem('macos_welcome_shown', 'true');
        const timer = setTimeout(() => {
          pushNotification({
            title: t('welcomeTitle'),
            message: t('welcomeMessage'),
            appId: 'studio',
            targetAppId: 'studio',
            actionLabel: t('openInStudio'),
            duration: 8000,
          });
        }, 2500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [pushNotification, t]);

  const handleDesktopPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-window]') ||
      target.closest('[data-dock]') ||
      target.closest('[data-desktop-item]') ||
      target.closest('header') ||
      target.closest('[data-context-menu]') ||
      target.closest('[data-modal]') ||
      target.closest('[data-drop-zone="notch"]') ||
      target.closest('aside')
    ) {
      return;
    }
    unfocusAllWindows();
    if (stageManagerEnabled && !isMobile) {
      toggleDesktopPeek();
    }
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
        label: t('spotlight'),
        shortcut: '⌘K',
        icon: <Search className="w-3.5 h-3.5 text-blue-500" />,
        onClick: openSpotlight,
      },
      {
        label: t('missionControl'),
        shortcut: 'F3',
        icon: <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />,
        onClick: toggleMissionControl,
      },
      { separator: true },
      {
        label: t('changeWallpaper'),
        shortcut: '⌥W',
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
        onClick: () => {
          const currentIndex = WALLPAPERS.findIndex((w) => w.id === activeWallpaperId);
          const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
          setWallpaper(WALLPAPERS[nextIndex].id);
          pushNotification({
            title: t('wallpaperChangedTitle'),
            message: WALLPAPERS[nextIndex].name,
            duration: 2500,
          });
        },
      },
      {
        label: t('toggleAppearance'),
        shortcut: '⌥T',
        icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
        onClick: () => {
          toggleDarkMode();
          pushNotification({
            title: t('appearanceChangedTitle'),
            message: !isDarkMode ? t('darkModeActive') : t('lightModeActive'),
            duration: 2500,
          });
        },
      },
      {
        label: t('minimizeAll'),
        shortcut: '⌥M',
        icon: <Sliders className="w-3.5 h-3.5 text-slate-500" />,
        onClick: minimizeAllWindows,
      },
      {
        label: t('resetWindows'),
        icon: <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />,
        onClick: () => {
          resetWindows();
          pushNotification({
            title: t('windowsResetTitle'),
            message: t('windowsResetMessage'),
            duration: 2500,
          });
        },
      },
      { separator: true },
      {
        label: t('lock'),
        shortcut: '⌥L',
        icon: <Lock className="w-3.5 h-3.5 text-rose-500" />,
        onClick: lock,
      },
      {
        label: t('aboutMac'),
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
    <>
      <main
        ref={desktopMainRef}
        onContextMenu={handleContextMenu}
        onPointerDown={handleDesktopPointerDown}
        className="relative w-full h-full overflow-hidden select-none"
      >
      {/* Dynamic Wallpaper Canvas */}
      <Wallpaper />

      {/* Atmospheric Weather Effects (Rain, Snow, Mist & Stars) */}
      <WeatherAtmosphere />

      {/* Floating Ambient Glass Bubbles */}
      <FloatingBubbles />

      {/* Screen Brightness Overlay */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            zIndex: Z_INDEX.BRIGHTNESS_OVERLAY,
            backgroundColor: 'black',
            opacity: ((100 - brightness) / 100) * 0.75,
          }}
        />
      )}

      {/* Menubar (top-0 fixed) */}
      <Menubar activeAppName={activeAppName} />

      {/* Draggable Desktop Canvas Playground (Pure CSS Responsive: Vertical stack on mobile, free-canvas on desktop) */}
      {/* 1. Mobile Desktop Stack: block md:hidden. Zero-delay vertical stack, no horizontal overflow or swiping */}
      <div
        style={{ zIndex: Z_INDEX.DESKTOP_CANVAS }}
        className="block md:hidden absolute inset-0 pt-10 pb-28 px-3 overflow-y-auto overflow-x-hidden no-scrollbar pointer-events-auto"
      >
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
      <div
        style={{ zIndex: Z_INDEX.DESKTOP_CANVAS }}
        className="hidden md:block absolute inset-0 pt-7 pb-20 pointer-events-none overflow-hidden"
      >
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
      <div
        style={{ zIndex: Z_INDEX.WINDOWS_BASE }}
        className="absolute inset-0 pt-7 flex flex-col justify-between pointer-events-none"
      >
        {/* Ghost Preview Frame for Sequoia Window Snap / Tiling */}
        <WindowSnapOverlay />

        {/* Open Windows Render Canvas */}
        <div className="flex-1 relative pointer-events-none">
          <AnimatePresence>
            {openWindowIds.map((winId) => (
              <Window key={winId} id={winId} hideHeader={winId === 'finder'}>
                {renderAppContent(winId)}
              </Window>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Spring-Magnified macOS Dock (bottom-3 fixed z-40) */}
      <Dock />

      {/* Dynamic MacBook Notch (Top-Center Island on >=1024px) */}
      <DynamicNotch />

      {/* macOS Stage Manager Vertical 3D Perspective Strip (Left Side on >=1024px) */}
      <StageManagerStrip />

      {/* Dynamic macOS Liquid Glass Overlays & Input Layer */}
      <ContextMenu />
      <DesktopMarquee disabled={isMobile} />
      <SpotlightModal />
      <AppSwitcherHUD />
      <MissionControl />
        <NotificationStack />
        <NotificationCenter />
        <DragPillOverlay />
      </main>
      <LockScreen />
    </>
  );
}
