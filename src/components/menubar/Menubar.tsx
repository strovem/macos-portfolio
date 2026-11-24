'use client';

import React, { useState, useEffect } from 'react';
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

export const Menubar: React.FC<MenubarProps> = ({ activeAppName = 'Finder' }) => {
  const openSpotlight = useSpotlightStore((state) => state.openSpotlight);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showAboutMac, setShowAboutMac] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const languageMenuRef = React.useRef<HTMLDivElement>(null);

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
      alert('macOS / Mobil Kurulum: Tarayıcınızın Paylaş (Share) veya Adres çubuğu menüsünden "Uygulama Olarak Yükle" ya da "Ana Ekrana Ekle"yi seçebilirsiniz.');
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
      setIsControlCenterOpen(false);
      setIsNowPlayingOpen(false);
      setIsLanguageMenuOpen(false);
    }
  };

  const { soundEnabled, toggleSound, volume, isDarkMode, toggleDarkMode, activeWallpaperId, setWallpaper } = useSettingsStore();
  const { isPlaying: isAudioPlaying, currentTrack } = useAudioStore();

  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const tileWindow = useWindowStore((state) => state.tileWindow);
  const cascadeWindows = useWindowStore((state) => state.cascadeWindows);
  const centerActiveWindow = useWindowStore((state) => state.centerActiveWindow);
  const bringAllToFront = useWindowStore((state) => state.bringAllToFront);
  const minimizeAllWindows = useWindowStore((state) => state.minimizeAllWindows);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const windows = useWindowStore((state) => state.windows);

  const { t, language, setLanguage } = useTranslation();

  const toggleMissionControl = useMissionControlStore((state) => state.toggleMissionControl);
  const { lock, sleep } = useLockStore();
  const toggleCenter = useNotificationStore((state) => state.toggleCenter);

  // Close menus when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setIsControlCenterOpen(false);
        setIsNowPlayingOpen(false);
        setIsLanguageMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for language menu
  useEffect(() => {
    if (!isLanguageMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageMenuOpen]);

  const handleMenuClick = (menuId: string) => {
    setActiveMenuId((prev) => (prev === menuId ? null : menuId));
  };

  const handleMenuHover = (menuId: string) => {
    if (activeMenuId !== null && activeMenuId !== menuId) {
      setActiveMenuId(menuId);
    }
  };

  // Apple Menu Items
  const appleMenuItems: MenuItem[] = [
    {
      label: 'Portfolyoyu Uygulama Olarak Yükle ',
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
      label: 'App Store...',
      action: () => window.open('https://github.com', '_blank'),
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
      label: `About ${activeAppName}`,
      action: () => setShowAboutMac(true),
    },
    { isDivider: true },
    {
      label: 'Settings...',
      shortcut: '⌘,',
      action: () => openWindow('settings'),
    },
    { isDivider: true },
    ...(activeAppName === 'Finder'
      ? [
          {
            label: 'Empty Trash...',
            shortcut: '⇧⌘⌫',
            action: () => {
              useNotificationStore.getState().pushNotification({
                title: 'Çöp Sepeti Boşaltıldı',
                message: 'Tüm silinmiş sistem öğeleri ve önbellek temizlendi.',
                appId: 'trash',
              });
            },
          },
          { isDivider: true },
        ]
      : []),
    {
      label: `Hide ${activeAppName}`,
      shortcut: '⌘H',
      action: () => {
        if (activeWindowId) minimizeWindow(activeWindowId);
      },
    },
    {
      label: 'Hide Others',
      shortcut: '⌥⌘H',
      action: () => {
        Object.values(windows).forEach((w) => {
          if (w.isOpen && w.id !== activeWindowId) {
            minimizeWindow(w.id);
          }
        });
      },
    },
    {
      label: 'Show All',
      action: bringAllToFront,
    },
  ];

  // File Menu Items
  const fileMenuItems: MenuItem[] = [
    {
      label: 'New Finder Window',
      shortcut: '⌘N',
      action: () => openWindow('finder'),
    },
    {
      label: 'New Note',
      shortcut: '⇧⌘N',
      action: () => openWindow('notes'),
    },
    {
      label: 'New Message',
      action: () => openWindow('messages'),
    },
    {
      label: 'Open Studio (DAW)',
      action: () => openWindow('studio'),
    },
    { isDivider: true },
    {
      label: 'Close Window',
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
      label: 'Undo',
      shortcut: '⌘Z',
      disabled: true,
    },
    {
      label: 'Redo',
      shortcut: '⇧⌘Z',
      disabled: true,
    },
    { isDivider: true },
    {
      label: 'Cut',
      shortcut: '⌘X',
    },
    {
      label: 'Copy',
      shortcut: '⌘C',
    },
    {
      label: 'Paste',
      shortcut: '⌘V',
    },
    {
      label: 'Select All',
      shortcut: '⌘A',
    },
  ];

  // View Menu Items
  const viewMenuItems: MenuItem[] = [
    {
      label: 'Toggle Dark Mode',
      shortcut: '⌃⌘D',
      action: toggleDarkMode,
    },
    {
      label: 'Next Wallpaper',
      shortcut: '⌥W',
      action: () => {
        const currentIndex = WALLPAPERS.findIndex((w) => w.id === activeWallpaperId);
        const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
        setWallpaper(WALLPAPERS[nextIndex].id);
      },
    },
    { isDivider: true },
    {
      label: 'Enter Full Screen',
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

  // Window Menu Items
  const openWindowList = Object.values(windows).filter((w) => w.isOpen);
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
      label: 'macOS Portfolio Help',
      action: () => setShowAboutMac(true),
    },
    {
      label: 'Keyboard Shortcuts Guide',
      shortcut: '⌘/',
      action: () => alert('Shortcuts:\n⌘, : Settings\n⌘M : Minimize\n⌃⌘F : Fullscreen\n⌃⌘Q : Lock Screen'),
    },
    { isDivider: true },
    {
      label: 'Visit Developer GitHub',
      action: () => window.open('https://github.com', '_blank'),
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
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.75-8.91-10.4-19.12-13.97-30.63-3.56-11.51-5.35-22.38-5.35-32.6 0-14.54 3.79-26.68 11.37-36.42 7.58-9.74 17.15-14.73 28.7-14.99 4.35 0 9.29 1.14 14.82 3.42 5.53 2.29 9.17 3.48 10.92 3.58 1.52-.1 5.3-1.35 11.37-3.75 6.06-2.4 11.19-3.46 15.38-3.18 13.98.76 24.96 5.8 32.93 15.13-11.83 7.18-17.61 17.14-17.34 29.89.28 10.07 4.13 18.52 11.56 25.35 7.42 6.84 16.32 10.74 26.7 11.71-2.16 6.32-4.63 12.65-7.43 18.99zM119.22 31.95c0-7.22 2.6-13.95 7.8-20.19 5.2-6.24 11.64-10.39 19.33-12.44.13 1.09.2 2.05.2 2.87 0 7.21-2.65 14.07-7.95 20.57-5.3 6.51-11.75 10.6-19.38 12.28-.06-.88-.1-1.78-.1-2.69z" />
              </svg>
            </button>
            <MenuDropdown
              isOpen={activeMenuId === 'apple'}
              onClose={() => setActiveMenuId(null)}
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
              onClose={() => setActiveMenuId(null)}
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
                onClose={() => setActiveMenuId(null)}
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
                onClose={() => setActiveMenuId(null)}
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
                onClose={() => setActiveMenuId(null)}
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
                onClose={() => setActiveMenuId(null)}
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
                onClose={() => setActiveMenuId(null)}
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
              setIsNowPlayingOpen(next);
              if (next) {
                setIsControlCenterOpen(false);
                setWeatherOpen(false);
                setIsLanguageMenuOpen(false);
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
              setIsControlCenterOpen(next);
              if (next) {
                setIsNowPlayingOpen(false);
                setWeatherOpen(false);
                setIsLanguageMenuOpen(false);
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
                setIsLanguageMenuOpen(next);
                if (next) {
                  setIsControlCenterOpen(false);
                  setIsNowPlayingOpen(false);
                  setWeatherOpen(false);
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
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl liquid-glass border border-white/20 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.28)] p-1 z-50 backdrop-blur-2xl"
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  {t('language')}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('tr');
                    setIsLanguageMenuOpen(false);
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
                    setIsLanguageMenuOpen(false);
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
          <Clock onClick={toggleCenter} />
        </div>
      </header>

      {/* Control Center Panel */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
      />

      {/* Now Playing MiniPlayer Popover */}
      <NowPlayingPopover
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
      />

      {/* Live macOS Weather Popover */}
      <WeatherPopover />

      {/* "About This Mac" Modal */}
      {showAboutMac && (
        <div
          style={{ zIndex: Z_INDEX.SPOTLIGHT }}
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm select-none p-4"
        >
          <div className="w-[380px] p-6 rounded-2xl glass-panel shadow-2xl backdrop-blur-2xl border border-black/10 dark:border-white/15 text-center flex flex-col items-center">
            {/* macOS Apple Logo */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-200 to-white dark:from-neutral-800 dark:to-neutral-700 shadow-md flex items-center justify-center mb-3 border border-black/5 dark:border-white/10">
              <svg className="w-9 h-9 fill-slate-800 dark:fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.75-8.91-10.4-19.12-13.97-30.63-3.56-11.51-5.35-22.38-5.35-32.6 0-14.54 3.79-26.68 11.37-36.42 7.58-9.74 17.15-14.73 28.7-14.99 4.35 0 9.29 1.14 14.82 3.42 5.53 2.29 9.17 3.48 10.92 3.58 1.52-.1 5.3-1.35 11.37-3.75 6.06-2.4 11.19-3.46 15.38-3.18 13.98.76 24.96 5.8 32.93 15.13-11.83 7.18-17.61 17.14-17.34 29.89.28 10.07 4.13 18.52 11.56 25.35 7.42 6.84 16.32 10.74 26.7 11.71-2.16 6.32-4.63 12.65-7.43 18.99zM119.22 31.95c0-7.22 2.6-13.95 7.8-20.19 5.2-6.24 11.64-10.39 19.33-12.44.13 1.09.2 2.05.2 2.87 0 7.21-2.65 14.07-7.95 20.57-5.3 6.51-11.75 10.6-19.38 12.28-.06-.88-.1-1.78-.1-2.69z" />
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
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};
