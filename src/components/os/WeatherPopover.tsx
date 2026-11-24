'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Wind,
  Droplets,
  Thermometer,
  Sunrise,
  Sunset,
  MapPin,
  RotateCw,
  Navigation,
  Sparkles,
  X,
} from 'lucide-react';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useSettingsStore, AtmospherePreviewMode } from '@/stores/useSettingsStore';
import { PRESET_CITIES, WeatherCategory } from '@/lib/weather';
import { useTranslation } from '@/hooks/useTranslation';
import { Z_INDEX } from '@/constants/zIndex';

export function getWeatherCategoryIcon(category: WeatherCategory, isDay = true, className = 'w-6 h-6') {
  switch (category) {
    case 'clear':
      return isDay ? (
        <Sun className={`${className} text-amber-500`} />
      ) : (
        <Sun className={`${className} text-sky-200`} />
      );
    case 'partly-cloudy':
      return <CloudSun className={`${className} text-amber-500`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'fog':
      return <Cloud className={`${className} text-slate-400 opacity-80`} />;
    case 'rain':
      return <CloudRain className={`${className} text-sky-500`} />;
    case 'snow':
      return <CloudSnow className={`${className} text-sky-200`} />;
    case 'storm':
      return <Zap className={`${className} text-amber-400`} />;
    default:
      return <CloudSun className={`${className} text-amber-500`} />;
  }
}

export const WeatherPopover: React.FC = () => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();

  const isPopoverOpen = useWeatherStore((state) => state.isPopoverOpen);
  const setPopoverOpen = useWeatherStore((state) => state.setPopoverOpen);
  const weather = useWeatherStore((state) => state.weather);
  const currentCity = useWeatherStore((state) => state.currentCity);
  const isLoading = useWeatherStore((state) => state.isLoading);
  const isGeoLoading = useWeatherStore((state) => state.isGeoLoading);
  const fetchWeather = useWeatherStore((state) => state.fetchWeather);
  const setCityId = useWeatherStore((state) => state.setCityId);
  const useCurrentLocation = useWeatherStore((state) => state.useCurrentLocation);

  const atmospherePreview = useSettingsStore((state) => state.atmospherePreview);
  const setAtmospherePreview = useSettingsStore((state) => state.setAtmospherePreview);

  // Close on click outside (Escape is handled centrally by useKeyboardShortcuts)
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Guard against clicking the menubar trigger itself
        const target = e.target as HTMLElement;
        if (target.closest('[data-weather-trigger]')) return;
        setPopoverOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen, setPopoverOpen]);

  const cityName = language === 'tr' ? currentCity.trName : currentCity.name;
  const condition = language === 'tr' ? weather.conditionTextTr : weather.conditionTextEn;

  const previewOptions: { id: AtmospherePreviewMode; labelTr: string; labelEn: string }[] = [
    { id: 'auto', labelTr: 'Canlı (Oto)', labelEn: 'Live (Auto)' },
    { id: 'dawn', labelTr: 'Şafak', labelEn: 'Dawn' },
    { id: 'day', labelTr: 'Gündüz', labelEn: 'Noon' },
    { id: 'sunset', labelTr: 'Gün Batımı', labelEn: 'Sunset' },
    { id: 'night', labelTr: 'Gece', labelEn: 'Night' },
    { id: 'rain', labelTr: 'Yağmur', labelEn: 'Rain' },
    { id: 'snow', labelTr: 'Kar', labelEn: 'Snow' },
  ];

  return (
    <AnimatePresence>
      {isPopoverOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ zIndex: Z_INDEX.MENUBAR_POPOVER }}
          className="fixed top-8 right-2 sm:right-28 w-[320px] max-w-[calc(100vw-16px)] liquid-glass rounded-2xl p-4 shadow-2xl border border-white/20 dark:border-white/10 text-slate-800 dark:text-neutral-100 font-sans select-none overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                {cityName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium shrink-0">· Open-Meteo</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fetchWeather(true)}
                disabled={isLoading}
                title={language === 'tr' ? 'Hava durumunu yenile' : 'Refresh weather'}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#007AFF]' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setPopoverOpen(false)}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hero Weather Section */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="text-4xl font-light tracking-tight text-slate-900 dark:text-white tabular-nums">
                {weather.temperature}°
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-neutral-200 mt-0.5">
                {condition}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                {language === 'tr' ? 'Y' : 'H'}: {weather.tempMax}° · {language === 'tr' ? 'D' : 'L'}: {weather.tempMin}°
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/20 dark:border-white/10 flex items-center justify-center shadow-xs">
                {getWeatherCategoryIcon(weather.category, weather.isDay, 'w-8 h-8')}
              </div>
            </div>
          </div>

          {/* 4-Item Weather Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 py-2">
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  {language === 'tr' ? 'Hissedilen' : 'Feels Like'}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-neutral-100 tabular-nums">
                  {weather.apparentTemperature}°C
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  {language === 'tr' ? 'Nem' : 'Humidity'}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-neutral-100 tabular-nums">
                  %{weather.humidity}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  {language === 'tr' ? 'Rüzgar' : 'Wind'}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-neutral-100 tabular-nums">
                  {weather.windSpeed} km/h
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium">
                  {language === 'tr' ? 'Doğum / Batım' : 'Sun Rise / Set'}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-neutral-100 tabular-nums truncate">
                  {weather.sunrise} / {weather.sunset}
                </div>
              </div>
            </div>
          </div>

          {/* Preset Location Switcher */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-col gap-1.5">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {language === 'tr' ? 'Şehir Seçimi' : 'Select City'}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {PRESET_CITIES.map((city) => {
                const isSelected = currentCity.id === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setCityId(city.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#007AFF] text-white shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-neutral-300 hover:bg-black/10'
                    }`}
                  >
                    {language === 'tr' ? city.trName : city.name}
                  </button>
                );
              })}

              {/* Use My Location GPS button */}
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isGeoLoading}
                title={language === 'tr' ? 'Mevcut konumumu kullan' : 'Use my current location'}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  currentCity.id === 'current-location'
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-neutral-300 hover:bg-black/10'
                }`}
              >
                <Navigation className={`w-3 h-3 ${isGeoLoading ? 'animate-spin' : ''}`} />
                <span>{language === 'tr' ? 'Konumum' : 'GPS'}</span>
              </button>
            </div>
          </div>

          {/* Atmosphere Live Preview Bar (Demo Bar) */}
          <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{language === 'tr' ? 'Atmosfer Önizleme' : 'Atmosphere Preview'}</span>
              </span>
              {atmospherePreview !== 'auto' && (
                <button
                  type="button"
                  onClick={() => setAtmospherePreview('auto')}
                  className="text-[10px] text-[#007AFF] hover:underline cursor-pointer"
                >
                  {language === 'tr' ? 'Sıfırla' : 'Reset'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {previewOptions.map((opt) => {
                const active = atmospherePreview === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAtmospherePreview(opt.id)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-neutral-300 hover:bg-black/10'
                    }`}
                  >
                    {language === 'tr' ? opt.labelTr : opt.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
