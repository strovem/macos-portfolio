'use client';

import React, { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Wifi,
  Volume2,
  VolumeX,
  Battery,
  Search,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  Music2,
  LayoutGrid,
} from 'lucide-react';
import { Clock } from './Clock';
import { MenuDropdown, MenuItem } from './MenuDropdown';
import { ControlCenter } from './ControlCenter';
import { NowPlayingPopover } from './NowPlayingPopover';
import { WeatherPopover, getWeatherCategoryIcon } from '@/components/os/WeatherPopover';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { Z_INDEX } from '@/constants/zIndex';
import { useMissionControlStore } from '@/stores/useMissionControlStore';
import { useLockStore } from '@/stores/useLockStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useOverlayStore } from '@/stores/useOverlayStore';
import { WALLPAPERS } from '@/data/wallpapers';
import { AppId } from '@/types/os';
import { useTranslation } from '@/hooks/useTranslation';
import { playClickSound } from '@/utils/systemSounds';
import { getFrequencyBars } from '@/lib/audioAnalyser';

function MenubarAudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bar0Ref = React.useRef<HTMLSpanElement>(null);
  const bar1Ref = React.useRef<HTMLSpanElement>(null);
  const bar2Ref = React.useRef<HTMLSpanElement>(null);
  const bar3Ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (bar0Ref.current) bar0Ref.current.style.height = '4px';
      if (bar1Ref.current) bar1Ref.current.style.height = '6px';
      if (bar2Ref.current) bar2Ref.current.style.height = '4px';
      if (bar3Ref.current) bar3Ref.current.style.height = '6px';
      return;
    }

    let animId: number;
    const bars = [bar0Ref, bar1Ref, bar2Ref, bar3Ref];

    const update = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(update);
        return;
      }

      const freqs = getFrequencyBars(4, true);
      bars.forEach((ref, idx) => {
        if (ref.current) {
          const val = freqs[idx] || 0.1;
          const h = Math.max(3, Math.min(13, 3 + Math.round(val * 10)));
          ref.current.style.height = `${h}px`;
        }
      });

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div
      className={`flex items-end gap-[2px] h-3.5 transition-opacity ${
        isPlaying ? 'text-[#007AFF] dark:text-[#38BDF8]' : 'opacity-60'
      }`}
      aria-label="Equalizer Spectrum"
    >
      <span ref={bar0Ref} className="w-0.5 rounded-full bg-current" style={{ height: '4px' }} />
      <span ref={bar1Ref} className="w-0.5 rounded-full bg-current" style={{ height: '6px' }} />
      <span ref={bar2Ref} className="w-0.5 rounded-full bg-current" style={{ height: '4px' }} />
      <span ref={bar3Ref} className="w-0.5 rounded-full bg-current" style={{ height: '6px' }} />
    </div>
  );
}

interface MenubarProps {
  activeAppName?: string;
  onOpenApp?: (appId: string) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Menubar: React.FC<MenubarProps> = ({ activeAppName = 'Finder' }) => {
  const openSpotlight = useSpotlightStore((state) => state.openSpotlight);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showAboutMac, setShowAboutMac] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const languageMenuRef = React.useRef<HTMLDivElement>(null);

  const activePopover = useOverlayStore((state) => state.activePopover);
  const setActivePopover = useOverlayStore((state) => state.setActivePopover);
  const toggleOverlayPopover = useOverlayStore((state) => state.togglePopover);
  const closeAllPopovers = useOverlayStore((state) => state.closeAllPopovers);
  const registerQuickLook = useOverlayStore((state) => state.registerQuickLook);
  const unregisterQuickLook = useOverlayStore((state) => state.unregisterQuickLook);

  const isControlCenterOpen = activePopover === 'controlCenter';
  const isNowPlayingOpen = activePopover === 'nowPlaying';
  const isLanguageMenuOpen = activePopover === 'language';

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      useNotificationStore.getState().pushNotification({
        title: language === 'tr' ? 'Uygulama Olarak Yükle' : 'Install Web OS App',
        message:
          language === 'tr'
            ? 'Tarayıcınızın Paylaş veya adres çubuğu menüsünden "Uygulama Olarak Yükle" ya da "Ana Ekrana Ekle"yi seçebilirsiniz.'
            : 'Choose "Install App" or "Add to Home Screen" from your browser share or address bar menu.',
        duration: 5500,
      });
    }
  };
  // Live Open-Meteo Weather Store Integration
  const weather = useWeatherStore((state) => state.weather);
  const isWeatherOpen = useWeatherStore((state) => state.isPopoverOpen);
  const setWeatherOpen = useWeatherStore((state) => state.setPopoverOpen);
  const toggleWeatherPopover = useWeatherStore((state) => state.togglePopover);
  const initWeather = useWeatherStore((state) => state.initWeather);
  const updateSolarPhase = useWeatherStore((state) => state.updateSolarPhase);

  useEffect(() => {
    initWeather();
    const interval = setInterval(() => {
      updateSolarPhase();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [initWeather, updateSolarPhase]);

  const handleWeatherClick = () => {
    const next = !isWeatherOpen;
    toggleWeatherPopover();
    if (next) {
      closeAllPopovers();
      setActiveMenuId(null);
      useNotificationStore.getState().closeCenter();
    }
  };

  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const volume = useSettingsStore((s) => s.volume);
  const activeWallpaperId = useSettingsStore((s) => s.activeWallpaperId);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);
  const stageManagerEnabled = useSettingsStore((s) => s.stageManagerEnabled);
  const toggleStageManager = useSettingsStore((s) => s.toggleStageManager);

  const isAudioPlaying = useAudioStore((s) => s.isPlaying);
  const currentTrack = useAudioStore((s) => s.currentTrack);

  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const tileWindow = useWindowStore((state) => state.tileWindow);
  const cascadeWindows = useWindowStore((state) => state.cascadeWindows);
  const centerActiveWindow = useWindowStore((state) => state.centerActiveWindow);
  const bringAllToFront = useWindowStore((state) => state.bringAllToFront);
  const minimizeAllWindows = useWindowStore((state) => state.minimizeAllWindows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const activeWindow = useWindowStore((state) =>
    state.activeWindowId ? state.windows[state.activeWindowId] : null
  );

  const { t, language, setLanguage } = useTranslation();

  const toggleMissionControl = useMissionControlStore((state) => state.toggleMissionControl);
  const lock = useLockStore((state) => state.lock);
  const sleep = useLockStore((state) => state.sleep);
  const toggleCenter = useNotificationStore((state) => state.toggleCenter);

  // Sync local activeMenuId when overlay store clears menu popover (e.g. Esc or another popover opening)
  useEffect(() => {
    if (activePopover !== 'menu' && activeMenuId !== null) {
      setActiveMenuId(null);
    }
  }, [activePopover, activeMenuId]);

  // Register About This Mac / Shortcuts Modal Escape closer
  useEffect(() => {
    if (!showAboutMac && !showShortcutsModal) return;
    const closer = () => {
      setShowAboutMac(false);
      setShowShortcutsModal(false);
    };
    registerQuickLook(closer);
    return () => unregisterQuickLook(closer);
  }, [showAboutMac, showShortcutsModal, registerQuickLook, unregisterQuickLook]);

  // Click outside listener for language menu
  useEffect(() => {
    if (!isLanguageMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageMenuOpen, setActivePopover]);

  const closeMenuDropdown = () => {
    setActiveMenuId(null);
    if (useOverlayStore.getState().activePopover === 'menu') {
      setActivePopover(null);
    }
  };

  const handleMenuClick = (menuId: string) => {
    const next = activeMenuId === menuId ? null : menuId;
    setActiveMenuId(next);
    if (next) {
      setWeatherOpen(false);
      useNotificationStore.getState().closeCenter();
      setActivePopover('menu');
    } else if (activePopover === 'menu') {
      setActivePopover(null);
    }
  };

  const handleMenuHover = (menuId: string) => {
    if (activeMenuId !== null && activeMenuId !== menuId) {
      setActiveMenuId(menuId);
    }
  };

  // Apple Menu Items
  const appleMenuItems: MenuItem[] = [
    {
      label: language === 'tr' ? 'Portfolyoyu Uygulama Olarak Yükle' : 'Install Portfolio as App',
      action: handleInstallPWA,
    },
    { isDivider: true },
    {
      label: t('aboutMac'),
      action: () => setShowAboutMac(true),
    },
    { isDivider: true },
    {
      label: t('systemSettings'),
      shortcut: '⌘,',
      action: () => openWindow('settings'),
    },
    {
      label: t('spotlight'),
      shortcut: '⌘K',
      action: openSpotlight,
    },
    { isDivider: true },
    {
      label: t('minimizeAll'),
      shortcut: '⌥M',
      action: minimizeAllWindows,
    },
    {
      label: language === 'tr' ? 'Uygulamalar (Finder)' : 'Applications Folder...',
      action: () => useWindowStore.getState().openFinderToSection('applications'),
    },
    { isDivider: true },
    {
      label: t('sleep'),
      action: sleep,
    },
    {
      label: t('lock'),
      shortcut: '⌥L',
      action: lock,
    },
    { isDivider: true },
    {
      label: t('restart'),
      action: () => window.location.reload(),
    },
    {
      label: t('shutDown'),
      action: () => {
        useNotificationStore.getState().pushNotification({
          title: t('systemShutdownTitle'),
          message: t('systemShutdownMessage'),
          duration: 4000,
        });
      },
    },
    {
      label: t('logOut'),
      shortcut: '⇧⌘Q',
      action: () => window.location.reload(),
    },
  ];

  // Active App Menu Items
  const appMenuItems: MenuItem[] = [
    {
      label: language === 'tr' ? `${activeAppName} Hakkında` : `About ${activeAppName}`,
      action: () => setShowAboutMac(true),
    },
    { isDivider: true },
    {
      label: t('systemSettings'),
      shortcut: '⌘,',
      action: () => openWindow('settings'),
    },
    { isDivider: true },
    ...(activeAppName === 'Finder'
      ? [
          {
            label: t('emptyTrash'),
            shortcut: '⇧⌘⌫',
            action: () => {
              useNotificationStore.getState().pushNotification({
                title: t('emptyTrashSuccessTitle'),
                message: t('emptyTrashSuccessMessage'),
                appId: 'trash',
              });
            },
          },
          { isDivider: true },
        ]
      : []),
    {
      label: t('hideApp').replace('{app}', activeAppName),
      shortcut: '⌘H',
      action: () => {
        if (activeWindowId) minimizeWindow(activeWindowId);
      },
    },
    {
      label: language === 'tr' ? 'Diğerlerini Gizle' : 'Hide Others',
      shortcut: '⌥⌘H',
      action: () => {
        const allWins = useWindowStore.getState().windows;
        Object.values(allWins).forEach((w) => {
          if (w.isOpen && w.id !== activeWindowId) {
            minimizeWindow(w.id);
          }
        });
      },
    },
    {
      label: language === 'tr' ? 'Tümünü Göster' : 'Show All',
      action: bringAllToFront,
    },
  ];

  // File Menu Items
  const fileMenuItems: MenuItem[] = [
    {
      label: language === 'tr' ? 'Yeni Finder Penceresi' : 'New Finder Window',
      shortcut: '⌘N',
      action: () => openWindow('finder'),
    },
    {
      label: language === 'tr' ? 'Yeni Not' : 'New Note',
      shortcut: '⇧⌘N',
      action: () => openWindow('notes'),
    },
    {
      label: language === 'tr' ? 'Yeni Mesaj' : 'New Message',
      action: () => openWindow('messages'),
    },
    {
      label: language === 'tr' ? "Studio (DAW)'ı Aç" : 'Open Studio (DAW)',
      action: () => openWindow('studio'),
    },
    { isDivider: true },
    {
      label: language === 'tr' ? 'Pencereyi Kapat' : 'Close Window',
      shortcut: '⌘W',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) closeWindow(activeWindowId);
      },
    },
  ];

  // Edit Menu Items
  const editMenuItems: MenuItem[] = [
    {
      label: language === 'tr' ? 'Geri Al' : 'Undo',
      shortcut: '⌘Z',
      disabled: true,
    },
    {
      label: language === 'tr' ? 'Yinele' : 'Redo',
      shortcut: '⇧⌘Z',
      disabled: true,
    },
    { isDivider: true },
    {
      label: language === 'tr' ? 'Kes' : 'Cut',
      shortcut: '⌘X',
    },
    {
      label: language === 'tr' ? 'Kopyala' : 'Copy',
      shortcut: '⌘C',
    },
    {
      label: language === 'tr' ? 'Yapıştır' : 'Paste',
      shortcut: '⌘V',
    },
    {
      label: language === 'tr' ? 'Tümünü Seç' : 'Select All',
      shortcut: '⌘A',
    },
  ];

  // View Menu Items
  const viewMenuItems: MenuItem[] = [
    {
      label: t('toggleAppearance'),
      shortcut: '⌃⌘D',
      action: toggleDarkMode,
    },
    {
      label: language === 'tr' ? 'Sonraki Duvar Kağıdı' : 'Next Wallpaper',
      shortcut: '⌥W',
      action: () => {
        const currentIndex = WALLPAPERS.findIndex((w) => w.id === activeWallpaperId);
        const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
        setWallpaper(WALLPAPERS[nextIndex].id);
      },
    },
    { isDivider: true },
    {
      label: t('fullScreen'),
      shortcut: '⌃⌘F',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      },
    },
  ];

  const openWindowList = useWindowStore(
    useShallow((state) =>
      Object.values(state.windows)
        .filter((w) => w.isOpen)
        .map((w) => ({ id: w.id, title: w.title }))
    )
  );
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const windowMenuItems: MenuItem[] = [
    {
      label: t('tileLeft'),
      shortcut: '⌥←',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) tileWindow(activeWindowId, 'left');
      },
    },
    {
      label: t('tileRight'),
      shortcut: '⌥→',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) tileWindow(activeWindowId, 'right');
      },
    },
    {
      label: t('fillScreen'),
      shortcut: '⌥⇧↑',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) tileWindow(activeWindowId, 'full');
      },
    },
    {
      label: t('centerWindow'),
      disabled: !activeWindowId,
      action: centerActiveWindow,
    },
    { isDivider: true },
    {
      label: 'Minimize',
      shortcut: '⌘M',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) minimizeWindow(activeWindowId);
      },
    },
    {
      label: 'Zoom / Maximize',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) maximizeWindow(activeWindowId);
      },
    },
    { isDivider: true },
    {
      label: stageManagerEnabled ? t('disableStageManager') : t('enableStageManager'),
      shortcut: '⌥S',
      action: toggleStageManager,
    },
    {
      label: 'Mission Control',
      shortcut: 'F3',
      action: toggleMissionControl,
    },
    {
      label: t('cascade'),
      action: cascadeWindows,
    },
    {
      label: t('bringAllFront'),
      action: bringAllToFront,
    },
    {
      label: t('minimizeAll'),
      shortcut: '⌥M',
      action: minimizeAllWindows,
    },
    ...(openWindowList.length > 0
      ? [
          { isDivider: true },
          ...openWindowList.map((w) => ({
            label: `${activeWindowId === w.id ? '✓ ' : '   '}${w.title}`,
            action: () => focusWindow(w.id),
          })),
        ]
      : []),
  ];

  // Help Menu Items
  const helpMenuItems: MenuItem[] = [
    {
      label: language === 'tr' ? 'macOS Portfolyo Yardım' : 'macOS Portfolio Help',
      action: () => setShowAboutMac(true),
    },
    {
      label: language === 'tr' ? 'Klavye Kısayolları Rehberi' : 'Keyboard Shortcuts Guide',
      shortcut: '⌘/',
      action: () => setShowShortcutsModal(true),
    },
    { isDivider: true },
    {
      label: language === 'tr' ? 'Yapımcı LinkedIn Profili' : 'Producer LinkedIn Profile',
      action: () =>
        window.open(
          'https://www.linkedin.com/in/h%C3%BCseyin-korumta%C5%9F-05379128a/',
          '_blank',
          'noopener,noreferrer'
        ),
    },
  ];

  return (
    <>
      <header
        style={{ zIndex: Z_INDEX.MENUBAR }}
        className="fixed top-0 left-0 right-0 h-7 flex items-center justify-between px-3 text-xs select-none liquid-glass border-b border-black/5 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors"
      >
        {/* Left Side: Apple Logo & App Menus */}
        <div className="flex items-center space-x-1">
          {/* Apple Logo Trigger */}
          <div className="relative">
            <button
              type="button"
              data-menubar-trigger
              onClick={() => handleMenuClick('apple')}
              onMouseEnter={() => handleMenuHover('apple')}
              className={`px-2 py-0.5 rounded transition-colors focus:outline-none flex items-center justify-center ${
                activeMenuId === 'apple'
                  ? 'bg-black/15 dark:bg-white/20'
                  : 'hover:bg-black/10 dark:hover:bg-white/10'
              }`}
              aria-label="Apple Menu"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 814 1000" aria-hidden="true">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
            </button>
            <MenuDropdown
              isOpen={activeMenuId === 'apple'}
              onClose={closeMenuDropdown}
              items={appleMenuItems}
            />
          </div>

          {/* Active App Name (e.g. Finder) */}
          <div className="relative">
            <button
              type="button"
              data-menubar-trigger
              onClick={() => handleMenuClick('app')}
              onMouseEnter={() => handleMenuHover('app')}
              className={`px-2 py-0.5 rounded font-bold transition-colors focus:outline-none ${
                activeMenuId === 'app'
                  ? 'bg-black/15 dark:bg-white/20'
                  : 'hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {activeAppName}
            </button>
            <MenuDropdown
              isOpen={activeMenuId === 'app'}
              onClose={closeMenuDropdown}
              items={appMenuItems}
            />
          </div>

          {/* Desktop Secondary Menus (Hidden on mobile < 768px) */}
          <div className="hidden md:flex items-center space-x-1">
            {/* File Menu */}
            <div className="relative">
              <button
                type="button"
                data-menubar-trigger
                onClick={() => handleMenuClick('file')}
                onMouseEnter={() => handleMenuHover('file')}
                className={`px-2 py-0.5 rounded transition-colors focus:outline-none ${
                  activeMenuId === 'file'
                    ? 'bg-black/15 dark:bg-white/20'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t('file')}
              </button>
              <MenuDropdown
                isOpen={activeMenuId === 'file'}
                onClose={closeMenuDropdown}
                items={fileMenuItems}
              />
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button
                type="button"
                data-menubar-trigger
                onClick={() => handleMenuClick('edit')}
                onMouseEnter={() => handleMenuHover('edit')}
                className={`px-2 py-0.5 rounded transition-colors focus:outline-none ${
                  activeMenuId === 'edit'
                    ? 'bg-black/15 dark:bg-white/20'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t('edit')}
              </button>
              <MenuDropdown
                isOpen={activeMenuId === 'edit'}
                onClose={closeMenuDropdown}
                items={editMenuItems}
              />
            </div>

            {/* View Menu */}
            <div className="relative">
              <button
                type="button"
                data-menubar-trigger
                onClick={() => handleMenuClick('view')}
                onMouseEnter={() => handleMenuHover('view')}
                className={`px-2 py-0.5 rounded transition-colors focus:outline-none ${
                  activeMenuId === 'view'
                    ? 'bg-black/15 dark:bg-white/20'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t('view')}
              </button>
              <MenuDropdown
                isOpen={activeMenuId === 'view'}
                onClose={closeMenuDropdown}
                items={viewMenuItems}
              />
            </div>

            {/* Window Menu */}
            <div className="relative">
              <button
                type="button"
                data-menubar-trigger
                onClick={() => handleMenuClick('window')}
                onMouseEnter={() => handleMenuHover('window')}
                className={`px-2 py-0.5 rounded transition-colors focus:outline-none ${
                  activeMenuId === 'window'
                    ? 'bg-black/15 dark:bg-white/20'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t('window')}
              </button>
              <MenuDropdown
                isOpen={activeMenuId === 'window'}
                onClose={closeMenuDropdown}
                items={windowMenuItems}
              />
            </div>

            {/* Help Menu */}
            <div className="relative">
              <button
                type="button"
                data-menubar-trigger
                onClick={() => handleMenuClick('help')}
                onMouseEnter={() => handleMenuHover('help')}
                className={`px-2 py-0.5 rounded transition-colors focus:outline-none ${
                  activeMenuId === 'help'
                    ? 'bg-black/15 dark:bg-white/20'
                    : 'hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {t('help')}
              </button>
              <MenuDropdown
                isOpen={activeMenuId === 'help'}
                onClose={closeMenuDropdown}
                items={helpMenuItems}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Status Widgets & Control Center */}
        <div className="flex items-center space-x-1">
          {/* Active Music Playing / Now Playing Popover Trigger */}
          <button
            type="button"
            data-now-playing-trigger
            onClick={() => {
              const next = !isNowPlayingOpen;
              toggleOverlayPopover('nowPlaying');
              if (next) {
                setWeatherOpen(false);
                setActiveMenuId(null);
                useNotificationStore.getState().closeCenter();
              }
            }}
            title={
              currentTrack
                ? `Now Playing: ${currentTrack.title} — Hüseyin Korumtaş (Click for Player)`
                : 'Now Playing MiniPlayer (Hüseyin Korumtaş)'
            }
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all focus:outline-none ${
              isNowPlayingOpen
                ? 'bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/40 shadow-sm'
                : isAudioPlaying
                ? 'bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-500/20 text-[#007AFF] dark:text-[#38BDF8] hover:bg-indigo-500/20'
                : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            <MenubarAudioVisualizer isPlaying={isAudioPlaying} />
            <span className="hidden lg:inline-block truncate max-w-[120px] text-[10px] font-medium">
              {currentTrack?.title || 'Now Playing'}
            </span>
          </button>

          {/* Real-Time Live Weather Badge & Weather Popover Trigger */}
          <div className="hidden md:block relative">
            <button
              type="button"
              data-weather-trigger
              onClick={handleWeatherClick}
              title={
                language === 'tr'
                  ? `${weather.cityName}: ${weather.conditionTextTr} (${weather.temperature}°C) — Detaylar için tıklayın`
                  : `${weather.cityName}: ${weather.conditionTextEn} (${weather.temperature}°C) — Click for weather`
              }
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all focus:outline-none cursor-pointer ${
                isWeatherOpen
                  ? 'bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              {getWeatherCategoryIcon(weather.category, weather.isDay, 'w-3.5 h-3.5')}
              <span className="tabular-nums text-[11px] font-medium">{weather.temperature}°C</span>
            </button>
          </div>

          {/* Sound / Volume Indicator */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? `Sound: ${volume}%` : 'Muted'}
            className="hidden sm:flex px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none items-center justify-center text-slate-700 dark:text-slate-300"
          >
            {soundEnabled && volume > 0 ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* WiFi Indicator */}
          <div
            title="Wi-Fi: Connected (Studio-5G)"
            className="hidden sm:flex px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-default items-center justify-center text-slate-700 dark:text-slate-300"
          >
            <Wifi className="w-3.5 h-3.5" />
          </div>

          {/* Battery Status */}
          <div
            title="Battery: 100% Charged"
            className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-default text-[11px] font-medium text-slate-700 dark:text-slate-300"
          >
            <span className="text-[10px]">100%</span>
            <Battery className="w-3.5 h-3.5 fill-current" />
          </div>

          {/* Mission Control Icon */}
          <button
            type="button"
            onClick={toggleMissionControl}
            title="Mission Control (F3)"
            className="flex px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          {/* Spotlight Search Icon */}
          <button
            type="button"
            onClick={openSpotlight}
            title="Spotlight Search (⌘K / ⌘Space)"
            className="flex px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* macOS Control Center Toggle Button */}
          <button
            type="button"
            data-control-center-trigger
            onClick={() => {
              const next = !isControlCenterOpen;
              toggleOverlayPopover('controlCenter');
              if (next) {
                setWeatherOpen(false);
                setActiveMenuId(null);
                useNotificationStore.getState().closeCenter();
              }
            }}
            title="Control Center"
            aria-label="Control Center"
            className={`px-1.5 py-0.5 rounded transition-colors focus:outline-none flex items-center justify-center ${
              isControlCenterOpen
                ? 'bg-black/15 dark:bg-white/20 text-black dark:text-white'
                : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}
          >
            {/* Authentic macOS Control Center dual toggle switch SVG */}
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.6]" viewBox="0 0 16 16">
              <rect x="2" y="3" width="12" height="4" rx="2" />
              <circle cx="5" cy="5" r="1.2" fill="currentColor" />
              <rect x="2" y="9" width="12" height="4" rx="2" />
              <circle cx="11" cy="11" r="1.2" fill="currentColor" />
            </svg>
          </button>

          {/* macOS Input Source (TR / EN) Language Switcher */}
          <div ref={languageMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                const next = !isLanguageMenuOpen;
                toggleOverlayPopover('language');
                if (next) {
                  setWeatherOpen(false);
                  setActiveMenuId(null);
                  useNotificationStore.getState().closeCenter();
                }
              }}
              title={t('language')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wider transition-colors focus:outline-none flex items-center gap-1 cursor-pointer ${
                isLanguageMenuOpen
                  ? 'bg-black/15 dark:bg-white/20 text-black dark:text-white'
                  : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="uppercase">{language}</span>
            </button>

            {/* Input Source Popover Menu */}
            {isLanguageMenuOpen && (
              <div
                style={{ zIndex: Z_INDEX.MENUBAR_POPOVER }}
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl liquid-glass border border-white/20 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.28)] p-1 backdrop-blur-2xl"
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  {t('language')}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('tr');
                    setActivePopover(null);
                    playClickSound();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                    language === 'tr'
                      ? 'bg-[#007AFF] text-white'
                      : 'text-slate-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{t('turkish')}</span>
                  {language === 'tr' && <span className="font-bold">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setActivePopover(null);
                    playClickSound();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#007AFF] text-white'
                      : 'text-slate-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{t('english')}</span>
                  {language === 'en' && <span className="font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Real-time Hydration-safe Clock & Notification Center Trigger */}
          <Clock
            onClick={() => {
              closeAllPopovers();
              setWeatherOpen(false);
              setActiveMenuId(null);
              toggleCenter();
            }}
          />
        </div>
      </header>

      {/* Control Center Panel */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => {
          if (useOverlayStore.getState().activePopover === 'controlCenter') {
            setActivePopover(null);
          }
        }}
      />

      {/* Now Playing MiniPlayer Popover */}
      <NowPlayingPopover
        isOpen={isNowPlayingOpen}
        onClose={() => {
          if (useOverlayStore.getState().activePopover === 'nowPlaying') {
            setActivePopover(null);
          }
        }}
      />

      {/* Live macOS Weather Popover */}
      <WeatherPopover />

      {/* "About This Mac" Modal */}
      {showAboutMac && (
        <div
          data-modal="true"
          style={{ zIndex: Z_INDEX.SPOTLIGHT }}
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm select-none p-4"
        >
          <div className="w-[380px] p-6 rounded-2xl glass-panel shadow-2xl backdrop-blur-2xl border border-black/10 dark:border-white/15 text-center flex flex-col items-center">
            {/* macOS Apple Logo */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-200 to-white dark:from-neutral-800 dark:to-neutral-700 shadow-md flex items-center justify-center mb-3 border border-black/5 dark:border-white/10">
              <svg className="w-9 h-9 fill-slate-800 dark:fill-white" viewBox="0 0 814 1000" aria-hidden="true">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hüseyin Korumtaş Portfolio
            </h2>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-4 italic">
              &ldquo;Ideas into experiences.&rdquo;
            </p>

            <div className="w-full bg-black/5 dark:bg-white/5 rounded-xl p-3 text-left text-xs flex flex-col gap-1.5 mb-4 border border-black/5 dark:border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Producer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Hüseyin Korumtaş</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Role</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Creative Producer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Email</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">korumtashuseyin@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Architecture</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">macOS Web OS • Next.js 14</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAboutMac(false)}
              className="px-5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-xs transition-colors shadow-sm focus:outline-none"
            >
              {language === 'tr' ? 'Tamam' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Guide Modal */}
      {showShortcutsModal && (
        <div
          data-modal="true"
          style={{ zIndex: Z_INDEX.SPOTLIGHT }}
          onClick={() => setShowShortcutsModal(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm select-none p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[380px] max-w-full p-5 rounded-2xl liquid-glass shadow-2xl border border-black/10 dark:border-white/15 flex flex-col gap-3 text-xs"
          >
            <h2 className="text-sm font-bold text-slate-900 dark:text-white text-center">
              {language === 'tr' ? 'Klavye Kısayolları' : 'Keyboard Shortcuts'}
            </h2>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 flex flex-col gap-2 border border-black/5 dark:border-white/5">
              {[
                { key: '⌘ K / ⌘ Space', label: language === 'tr' ? 'Spotlight Arama' : 'Spotlight Search' },
                { key: 'F3 / ⌥ ↑', label: 'Mission Control' },
                { key: '⌥ Tab', label: language === 'tr' ? 'Uygulama Değiştirici' : 'App Switcher HUD' },
                { key: '⌥ ← / ⌥ →', label: language === 'tr' ? 'Sola / Sağa Yasla' : 'Tile Window Left / Right' },
                { key: '⌥ ⇧ ↑', label: language === 'tr' ? 'Tam Ekran / Geri Yükle' : 'Fill / Restore Window' },
                { key: '⌥ S', label: 'Stage Manager' },
                { key: '⌥ L / ⌃⌘Q', label: language === 'tr' ? 'Ekranı Kilitle' : 'Lock Screen' },
                { key: 'Space (Finder)', label: language === 'tr' ? 'Hızlı Bakış' : 'Quick Look Preview' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/40 border border-black/10 dark:border-white/15 font-mono text-[10px] font-semibold text-slate-800 dark:text-neutral-200">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="mx-auto px-5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-xs transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              {language === 'tr' ? 'Tamam' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
