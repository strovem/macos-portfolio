'use client';

import { create } from 'zustand';
import {
  WeatherCity,
  WeatherData,
  PRESET_CITIES,
  FALLBACK_WEATHER,
  fetchCityWeather,
  getCachedWeather,
} from '@/lib/weather';
import { useSettingsStore } from './useSettingsStore';

export type SolarPhase = 'dawn' | 'day' | 'sunset' | 'night';

export function calculateSolarPhase(
  date: Date = new Date(),
  sunriseStr?: string,
  sunsetStr?: string
): SolarPhase {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Defaults:
  // Dawn: ~05:30 to 08:30
  // Day: ~08:30 to 16:30
  // Sunset: ~16:30 to 19:30
  // Night: ~19:30 to 05:30
  let dawnStart = 5 * 60 + 30;
  let dayStart = 8 * 60 + 30;
  let sunsetStart = 16 * 60 + 30;
  let nightStart = 19 * 60 + 30;

  if (sunriseStr && sunriseStr.includes(':')) {
    const [sH, sM] = sunriseStr.split(':').map(Number);
    if (!isNaN(sH) && !isNaN(sM)) {
      const srMin = sH * 60 + sM;
      dawnStart = Math.max(0, srMin - 45);
      dayStart = srMin + 90;
    }
  }

  if (sunsetStr && sunsetStr.includes(':')) {
    const [ssH, ssM] = sunsetStr.split(':').map(Number);
    if (!isNaN(ssH) && !isNaN(ssM)) {
      const ssMin = ssH * 60 + ssM;
      sunsetStart = Math.max(dayStart, ssMin - 60);
      nightStart = ssMin + 45;
    }
  }

  if (totalMinutes >= dawnStart && totalMinutes < dayStart) {
    return 'dawn';
  }
  if (totalMinutes >= dayStart && totalMinutes < sunsetStart) {
    return 'day';
  }
  if (totalMinutes >= sunsetStart && totalMinutes < nightStart) {
    return 'sunset';
  }
  return 'night';
}

interface WeatherStoreState {
  currentCity: WeatherCity;
  weather: WeatherData;
  isLoading: boolean;
  isGeoLoading: boolean;
  isPopoverOpen: boolean;
  solarPhase: SolarPhase;
  initWeather: () => Promise<void>;
  fetchWeather: (forceRefresh?: boolean) => Promise<void>;
  setCityId: (cityId: string) => Promise<void>;
  useCurrentLocation: () => Promise<boolean>;
  setPopoverOpen: (open: boolean) => void;
  togglePopover: () => void;
  updateSolarPhase: () => void;
}

export const useWeatherStore = create<WeatherStoreState>((set, get) => ({
  currentCity: PRESET_CITIES[0], // Eskişehir default
  weather: FALLBACK_WEATHER,
  isLoading: false,
  isGeoLoading: false,
  isPopoverOpen: false,
  solarPhase: calculateSolarPhase(),

  initWeather: async () => {
    // Read persisted city from settings store if available
    const savedCityId = useSettingsStore.getState().weatherCityId || 'eskisehir';

    if (savedCityId === 'current-location') {
      const cachedCustom = getCachedWeather('current-location');
      let savedCoords: { latitude: number; longitude: number } | null = null;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('korumtas_custom_weather_coords');
          if (raw) savedCoords = JSON.parse(raw);
        } catch {
          // ignore
        }
      }

      const customCity: WeatherCity = {
        id: 'current-location',
        name: cachedCustom?.cityName || 'Current Location',
        trName: cachedCustom?.cityName || 'Mevcut Konum',
        latitude: cachedCustom?.latitude ?? savedCoords?.latitude ?? PRESET_CITIES[0].latitude,
        longitude: cachedCustom?.longitude ?? savedCoords?.longitude ?? PRESET_CITIES[0].longitude,
        isCustom: true,
      };

      if (cachedCustom) {
        set({
          currentCity: customCity,
          weather: cachedCustom,
          solarPhase: calculateSolarPhase(new Date(), cachedCustom.sunrise, cachedCustom.sunset),
        });
        return;
      }

      if (savedCoords) {
        set({ currentCity: customCity });
        await get().fetchWeather(false);
        return;
      }
    }

    const matched = PRESET_CITIES.find((c) => c.id === savedCityId) || PRESET_CITIES[0];

    const cached = getCachedWeather(matched.id);
    if (cached) {
      set({
        currentCity: matched,
        weather: cached,
        solarPhase: calculateSolarPhase(new Date(), cached.sunrise, cached.sunset),
      });
      return;
    }

    set({ currentCity: matched });
    await get().fetchWeather(false);
  },

  fetchWeather: async (forceRefresh = false) => {
    const { currentCity } = get();
    set({ isLoading: true });
    try {
      const data = await fetchCityWeather(currentCity, forceRefresh);
      set({
        weather: data,
        isLoading: false,
        solarPhase: calculateSolarPhase(new Date(), data.sunrise, data.sunset),
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setCityId: async (cityId: string) => {
    const target = PRESET_CITIES.find((c) => c.id === cityId);
    if (!target) return;

    useSettingsStore.getState().setWeatherCityId(target.id);
    set({ currentCity: target, isLoading: true });

    try {
      const data = await fetchCityWeather(target, false);
      set({
        weather: data,
        isLoading: false,
        solarPhase: calculateSolarPhase(new Date(), data.sunrise, data.sunset),
      });
    } catch {
      set({ isLoading: false });
    }
  },

  useCurrentLocation: async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return false;
    }

    set({ isGeoLoading: true });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const customCity: WeatherCity = {
            id: 'current-location',
            name: 'Current Location',
            trName: 'Mevcut Konum',
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
            isCustom: true,
          };

          set({ currentCity: customCity });
          useSettingsStore.getState().setWeatherCityId('current-location');
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                'korumtas_custom_weather_coords',
                JSON.stringify({
                  latitude: customCity.latitude,
                  longitude: customCity.longitude,
                })
              );
            } catch {
              // ignore storage quota
            }
          }

          try {
            const data = await fetchCityWeather(customCity, true);
            set({
              weather: data,
              isGeoLoading: false,
              solarPhase: calculateSolarPhase(new Date(), data.sunrise, data.sunset),
            });
            resolve(true);
          } catch {
            set({ isGeoLoading: false });
            resolve(false);
          }
        },
        (err) => {
          console.warn('[Weather] Geolocation denied or unavailable:', err);
          set({ isGeoLoading: false });
          resolve(false);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  },

  setPopoverOpen: (open: boolean) => set({ isPopoverOpen: open }),
  togglePopover: () => set((state) => ({ isPopoverOpen: !state.isPopoverOpen })),

  updateSolarPhase: () => {
    const { weather } = get();
    set({ solarPhase: calculateSolarPhase(new Date(), weather?.sunrise, weather?.sunset) });
  },
}));
