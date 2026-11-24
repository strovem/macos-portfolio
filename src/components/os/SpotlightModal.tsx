'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  Sliders,
  Folder,
  Music2,
  SlidersHorizontal,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  Terminal,
  Camera,
  Compass,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  AppWindow,
} from 'lucide-react';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { Z_INDEX } from '@/constants/zIndex';
import { APPS } from '@/data/apps';
import { PROJECTS } from '@/data/projects';
import { ORIGINAL_TRACKS } from '@/data/music';
import { WALLPAPERS } from '@/data/wallpapers';
import { playClickSound } from '@/utils/soundEffects';
import { AppId } from '@/types/os';
import { useTranslation } from '@/hooks/useTranslation';

interface SpotlightItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Uygulamalar' | 'Projeler' | 'Müzik & Audio' | 'Sistem Komutları';
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

function normalizeSearch(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

export const SpotlightModal: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, closeSpotlight } = useSpotlightStore();
  const { openWindow, minimizeAllWindows, resetWindows, openFinderToSection } = useWindowStore();
  const {
    isDarkMode,
    toggleDarkMode,
    activeWallpaperId,
    setWallpaper,
    soundEnabled,
    toggleSound,
    stageManagerEnabled,
    toggleStageManager,
    dynamicNotchEnabled,
    toggleDynamicNotch,
  } = useSettingsStore();
  const { playTrack } = useAudioStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Comprehensive Search Database
  const allItems = useMemo<SpotlightItem[]>(() => {
    const list: SpotlightItem[] = [];

    // 1. Applications
    APPS.forEach((app) => {
      let icon = <Folder className="w-4 h-4 text-blue-500" />;
      if (app.id === 'studio') icon = <Sliders className="w-4 h-4 text-purple-500" />;
      if (app.id === 'safari') icon = <Compass className="w-4 h-4 text-cyan-500" />;
      if (app.id === 'messages') icon = <MessageCircle className="w-4 h-4 text-emerald-500" />;
      if (app.id === 'notes') icon = <FileText className="w-4 h-4 text-amber-500" />;
      if (app.id === 'photos') icon = <Camera className="w-4 h-4 text-pink-500" />;
      if (app.id === 'terminal') icon = <Terminal className="w-4 h-4 text-neutral-400" />;
      if (app.id === 'settings') icon = <SlidersHorizontal className="w-4 h-4 text-slate-400" />;

      list.push({
        id: `app-${app.id}`,
        title: app.title,
        subtitle: `${app.description} • Uygulama`,
        category: 'Uygulamalar',
        icon,
        action: () => openWindow(app.id),
        keywords: [app.id, app.title, app.description, 'app', 'uygulama', 'program'],
      });
    });

    // Tone Generator App
    list.push({
      id: 'app-tonegenerator',
      title: 'Tone Generator',
      subtitle: 'Ses frekansı osilatörü ve ses test aracı • Uygulama',
      category: 'Uygulamalar',
      icon: <Volume2 className="w-4 h-4 text-indigo-400" />,
      action: () => openWindow('tonegenerator' as AppId),
      keywords: ['tone', 'generator', 'frekans', 'hertz', 'ses', 'sinus', 'sawtooth'],
    });

    // 2. Projects & Productions
    PROJECTS.forEach((proj) => {
      list.push({
        id: `proj-${proj.id}`,
        title: proj.title,
        subtitle: `${proj.role} • ${proj.tags.join(', ')}`,
        category: 'Projeler',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        action: () => openFinderToSection('documents'),
        keywords: [proj.title, proj.description, proj.role || '', ...proj.tags, 'proje', 'vaka'],
      });
    });

    // 3. Original Tracks & Audio Works
    ORIGINAL_TRACKS.forEach((track) => {
      list.push({
        id: `music-${track.id}`,
        title: track.title,
        subtitle: `${track.genre} • ${track.bpm} BPM • ${track.album}`,
        category: 'Müzik & Audio',
        icon: <Music2 className="w-4 h-4 text-indigo-500" />,
        action: () => {
          openWindow('studio');
          playTrack(track);
        },
        keywords: [track.title, track.genre, track.artist, track.album, `${track.bpm} bpm`, 'muzik', 'sarki', 'track', 'audio'],
      });
    });

    // Studio MPC Beat Pad Special Entry
    list.push({
      id: 'studio-beatpad',
      title: 'MPC Beat Pad & Ritim Sentezleyici',
      subtitle: 'Prosedürel analog davul pedleri ile canlı ritim çal • Studio',
      category: 'Müzik & Audio',
      icon: <Sliders className="w-4 h-4 text-purple-400" />,
      action: () => openWindow('studio'),
      keywords: ['beat pad', 'mpc', 'drum', 'kick', 'snare', 'hihat', 'ritim', 'studio', 'synth'],
    });

    // 4. System Commands & Toggles
    list.push({
      id: 'cmd-theme',
      title: isDarkMode ? 'Açık Moda Geç (Light Mode)' : 'Koyu Moda Geç (Dark Mode)',
      subtitle: 'Arayüz temasını anında değiştir',
      category: 'Sistem Komutları',
      icon: isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: toggleDarkMode,
      keywords: ['tema', 'koyu mod', 'acik mod', 'dark mode', 'light mode', 'gorunum', 'renk'],
    });

    list.push({
      id: 'cmd-wallpaper',
      title: 'Duvar Kağıdını Değiştir',
      subtitle: 'Sonraki masaüstü duvar kağıdına geçiş yap',
      category: 'Sistem Komutları',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      action: () => {
        const currentIndex = WALLPAPERS.findIndex((w) => w.id === activeWallpaperId);
        const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
        setWallpaper(WALLPAPERS[nextIndex].id);
      },
      keywords: ['duvar kagidi', 'wallpaper', 'arka plan', 'background', 'resim'],
    });

    list.push({
      id: 'cmd-stage-manager',
      title: stageManagerEnabled ? 'Stage Manager: Kapat' : 'Stage Manager: Aç',
      subtitle: 'Masaüstü pencerelerini sol şeritte organize et (Alt+S)',
      category: 'Sistem Komutları',
      icon: <AppWindow className="w-4 h-4 text-blue-400" />,
      action: toggleStageManager,
      keywords: ['stage manager', 'sahne', 'pencere seridi', 'yonetici', 'coklu gorev', 'multitasking'],
    });

    list.push({
      id: 'cmd-dynamic-notch',
      title: dynamicNotchEnabled ? 'Dinamik Çentik: Kapat' : 'Dinamik Çentik: Aç',
      subtitle: 'MacBook dinamik ada ve medya kontrollerini aç/kapat',
      category: 'Sistem Komutları',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: toggleDynamicNotch,
      keywords: ['centik', 'notch', 'dynamic notch', 'ada', 'island', 'kamera'],
    });

    list.push({
      id: 'cmd-sound',
      title: soundEnabled ? 'Sistem Seslerini Kapat (Sessiz)' : 'Sistem Seslerini Aç',
      subtitle: soundEnabled ? 'UI tıklama ve pencere ses efektlerini sustur' : 'UI ses efektlerini etkinleştir',
      category: 'Sistem Komutları',
      icon: soundEnabled ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />,
      action: toggleSound,
      keywords: ['ses', 'ses efektleri', 'mute', 'sound', 'hoparlor'],
    });

    list.push({
      id: 'cmd-minimize-all',
      title: 'Tüm Pencereleri Küçült',
      subtitle: 'Açık olan tüm pencereleri simge durumuna al ve masaüstünü göster',
      category: 'Sistem Komutları',
      icon: <Maximize2 className="w-4 h-4 text-blue-400" />,
      action: minimizeAllWindows,
      keywords: ['kucult', 'minimize', 'masaustu', 'desktop', 'pencereler'],
    });

    list.push({
      id: 'cmd-reset-windows',
      title: 'Pencereleri Varsayılan Konumlarına Sıfırla',
      subtitle: 'Pencere konumlarını ve boyutlarını fabrika ayarlarına döndür',
      category: 'Sistem Komutları',
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
      action: resetWindows,
      keywords: ['sifirla', 'reset', 'pencere duzeni', 'yerlesim'],
    });

    return list;
  }, [
    openWindow,
    openFinderToSection,
    playTrack,
    isDarkMode,
    toggleDarkMode,
    activeWallpaperId,
    setWallpaper,
    soundEnabled,
    toggleSound,
    stageManagerEnabled,
    toggleStageManager,
    dynamicNotchEnabled,
    toggleDynamicNotch,
    minimizeAllWindows,
    resetWindows,
  ]);

  // Filtered results based on Turkish normalized query
  const filteredResults = useMemo(() => {
    const norm = normalizeSearch(query);
    if (!norm) {
      // Default suggested list when query is empty
      return allItems.slice(0, 8);
    }

    return allItems.filter((item) => {
      const matchTitle = normalizeSearch(item.title).includes(norm);
      const matchSub = normalizeSearch(item.subtitle).includes(norm);
      const matchCat = normalizeSearch(item.category).includes(norm);
      const matchKey = item.keywords.some((k) => normalizeSearch(k).includes(norm));
      return matchTitle || matchSub || matchCat || matchKey;
    });
  }, [query, allItems]);

  // Keep selection within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length]);

  // Keyboard navigation inside Spotlight
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        playClickSound();
        target.action();
        closeSpotlight();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSpotlight();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{ zIndex: Z_INDEX.SPOTLIGHT }}
        className="fixed inset-0 flex justify-center items-start pt-[12vh] sm:pt-[15vh] px-3 sm:px-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSpotlight}
          className="fixed inset-0 bg-black/35 backdrop-blur-xs select-none"
        />

        {/* Spotlight Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[620px] rounded-2xl liquid-glass shadow-2xl overflow-hidden flex flex-col z-10 border border-black/10 dark:border-white/15"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/10 dark:border-white/10">
            <Search className="w-5 h-5 text-slate-400 dark:text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono text-slate-400 dark:text-neutral-400">
                ESC
              </span>
            )}
          </div>

          {/* Results Stream */}
          <div
            ref={resultsContainerRef}
            className="max-h-[380px] overflow-y-auto p-1.5 no-scrollbar select-none"
          >
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-neutral-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>{t('noResults')}</span>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playClickSound();
                      item.action();
                      closeSpotlight();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#007AFF] text-white shadow-xs'
                        : 'text-slate-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-neutral-300'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate leading-tight">
                          {item.title}
                        </div>
                        <div
                          className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-slate-500 dark:text-neutral-400'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-neutral-500'
                        }`}
                      >
                        {item.category}
                      </span>
                      {isSelected && (
                        <ArrowRight className="w-3 h-3 text-white/90" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Keyboard Navigation Hints */}
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
            <span>{filteredResults.length} sonuç</span>
            <div className="flex items-center gap-3">
              <span>↑↓ Gezin</span>
              <span>↵ Seç</span>
              <span>esc Kapat</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
