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
} from 'lucide-react';
import { Clock } from './Clock';
import { MenuDropdown, MenuItem } from './MenuDropdown';
import { ControlCenter } from './ControlCenter';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';

interface MenubarProps {
  activeAppName?: string;
  onOpenApp?: (appId: string) => void;
}

export const Menubar: React.FC<MenubarProps> = ({ activeAppName = 'Finder' }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [showAboutMac, setShowAboutMac] = useState(false);
  const [weatherHover, setWeatherHover] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temp: 12,
    code: 2,
    condition: 'Parçalı Bulutlu',
    high: 16,
    low: 11,
    city: 'İstanbul',
  });

  // Fetch real-time weather for Istanbul with European standard (°C)
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FIstanbul'
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.current) return;

        const currentTemp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const high = Math.round(data.daily?.temperature_2m_max?.[0] ?? currentTemp + 3);
        const low = Math.round(data.daily?.temperature_2m_min?.[0] ?? currentTemp - 3);

        let condition = 'Parçalı Bulutlu';
        if (code === 0) condition = 'Açık';
        else if (code === 1) condition = 'Çoğunlukla Açık';
        else if (code === 2) condition = 'Parçalı Bulutlu';
        else if (code === 3) condition = 'Bulutlu';
        else if (code === 45 || code === 48) condition = 'Sisli';
        else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) condition = 'Yağmurlu';
        else if ([71, 73, 75, 85, 86].includes(code)) condition = 'Karlı';
        else if ([95, 96, 99].includes(code)) condition = 'Gök Gürültülü Sağanak';

        setWeatherData({
          temp: currentTemp,
          code,
          condition,
          high,
          low,
          city: 'İstanbul',
        });
      } catch {
        // Retain fallback initial state
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    if (code === 1 || code === 2) return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
    if (code === 3 || code === 45 || code === 48) return <Cloud className="w-3.5 h-3.5 text-slate-400" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="w-3.5 h-3.5 text-sky-500" />;
    if ([71, 73, 75, 85, 86].includes(code)) return <CloudSnow className="w-3.5 h-3.5 text-sky-200" />;
    return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
  };

  const { soundEnabled, toggleSound, volume, isDarkMode, toggleDarkMode } = useSettingsStore();
  const { isPlaying: isAudioPlaying, currentTrack } = useAudioStore();

  // Close menus when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setIsControlCenterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      label: 'About This Mac',
      action: () => setShowAboutMac(true),
    },
    { isDivider: true },
    {
      label: 'System Settings...',
      shortcut: '⌘,',
      action: () => setIsControlCenterOpen(true),
    },
    {
      label: 'App Store...',
      action: () => window.open('https://github.com', '_blank'),
    },
    { isDivider: true },
    {
      label: 'Recent Items',
      disabled: true,
    },
    { isDivider: true },
    {
      label: 'Force Quit...',
      shortcut: '⌥⌘⎋',
      action: () => console.log('Force Quit triggered'),
    },
    { isDivider: true },
    {
      label: 'Sleep',
      action: () => console.log('Sleep mode triggered'),
    },
    {
      label: 'Restart...',
      action: () => window.location.reload(),
    },
    {
      label: 'Shut Down...',
      action: () => alert('Shutting down Web OS... Refresh page to reboot.'),
    },
    { isDivider: true },
    {
      label: 'Lock Screen',
      shortcut: '⌃⌘Q',
      action: () => alert('Screen locked. Click OK to unlock.'),
    },
    {
      label: 'Log Out User...',
      shortcut: '⇧⌘Q',
      action: () => window.location.reload(),
    },
  ];

  // Active App (Finder) Menu Items
  const appMenuItems: MenuItem[] = [
    {
      label: `About ${activeAppName}`,
      action: () => setShowAboutMac(true),
    },
    { isDivider: true },
    {
      label: 'Settings...',
      shortcut: '⌘,',
      action: () => setIsControlCenterOpen(true),
    },
    { isDivider: true },
    {
      label: 'Empty Trash...',
      shortcut: '⇧⌘⌫',
      action: () => alert('Trash emptied.'),
    },
    { isDivider: true },
    {
      label: `Hide ${activeAppName}`,
      shortcut: '⌘H',
    },
    {
      label: 'Hide Others',
      shortcut: '⌥⌘H',
    },
    {
      label: 'Show All',
      disabled: true,
    },
  ];

  // File Menu Items
  const fileMenuItems: MenuItem[] = [
    {
      label: 'New Finder Window',
      shortcut: '⌘N',
    },
    {
      label: 'New Folder',
      shortcut: '⇧⌘N',
    },
    {
      label: 'New Smart Folder',
      shortcut: '⌥⌘N',
      disabled: true,
    },
    {
      label: 'Open...',
      shortcut: '⌘O',
    },
    {
      label: 'Close Window',
      shortcut: '⌘W',
    },
    { isDivider: true },
    {
      label: 'Get Info',
      shortcut: '⌘I',
    },
    {
      label: 'Quick Look',
      shortcut: 'Space',
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
      label: 'as Icons',
      shortcut: '⌘1',
    },
    {
      label: 'as List',
      shortcut: '⌘2',
    },
    {
      label: 'as Columns',
      shortcut: '⌘3',
    },
    { isDivider: true },
    {
      label: 'Toggle Dark Mode',
      shortcut: '⌃⌘D',
      action: toggleDarkMode,
    },
    {
      label: 'Clean Up',
    },
    {
      label: 'Sort By Name',
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
  const windowMenuItems: MenuItem[] = [
    {
      label: 'Minimize',
      shortcut: '⌘M',
    },
    {
      label: 'Zoom',
    },
    { isDivider: true },
    {
      label: 'Bring All to Front',
    },
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
      <header className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-3 text-xs select-none backdrop-blur-md bg-white/40 dark:bg-black/40 border-b border-black/5 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors">
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
                File
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
                Edit
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
                View
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
                Window
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
                Help
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
          {/* Active Music Playing Wave Indicator */}
          {isAudioPlaying && currentTrack && (
            <button
              type="button"
              onClick={() => setIsControlCenterOpen(true)}
              title={`Now Playing: ${currentTrack.title} — Hüseyin Korumtaş (Click to open Control Center)`}
              className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-500/20 text-[#007AFF] dark:text-[#38BDF8] text-[10px] font-medium transition-all hover:bg-indigo-500/20"
            >
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-2 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                <span className="w-0.5 h-2.5 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.4s', animationDelay: '0.15s' }} />
                <span className="w-0.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
              </div>
              <span className="truncate max-w-[110px]">{currentTrack.title}</span>
            </button>
          )}

          {/* Weather Pill (İstanbul - Celsius / Avrupa Standartları) */}
          <div
            className="hidden md:block relative"
            onMouseEnter={() => setWeatherHover(true)}
            onMouseLeave={() => setWeatherHover(false)}
          >
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-default text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {getWeatherIcon(weatherData.code)}
              <span>{weatherData.temp}°C</span>
            </div>

            {weatherHover && (
              <div className="absolute top-full right-0 mt-1 px-2.5 py-1.5 rounded-lg backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90 border border-black/10 dark:border-white/10 shadow-xl text-[11px] whitespace-nowrap z-50 text-slate-800 dark:text-slate-200">
                <span className="font-semibold">{weatherData.city}</span> · {weatherData.condition} · Y: {weatherData.high}°C D: {weatherData.low}°C
              </div>
            )}
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

          {/* Spotlight Search Icon */}
          <button
            type="button"
            onClick={() => alert('Spotlight Search: Press ⌘Space to search apps, files, and portfolio projects.')}
            title="Spotlight Search (⌘Space)"
            className="hidden sm:flex px-1.5 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* macOS Control Center Toggle Button */}
          <button
            type="button"
            data-control-center-trigger
            onClick={() => setIsControlCenterOpen(!isControlCenterOpen)}
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

          {/* Real-time Hydration-safe Clock */}
          <Clock />
        </div>
      </header>

      {/* Control Center Panel */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
      />

      {/* "About This Mac" Modal */}
      {showAboutMac && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm select-none p-4">
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
