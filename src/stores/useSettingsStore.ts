import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuraIntensity = 'subtle' | 'vibrant' | 'max';
export type AtmospherePreviewMode = 'auto' | 'dawn' | 'day' | 'sunset' | 'night' | 'rain' | 'snow';

export interface SettingsState {
  _hasHydrated: boolean;
  language: 'tr' | 'en';
  activeWallpaperId: string;
  isDarkMode: boolean;
  soundEnabled: boolean;
  bubblesEnabled: boolean;
  brightness: number;
  volume: number;
  auraIntensity: AuraIntensity;
  tapeWarmth: boolean;
  audioReactiveAmbience: boolean;
  dynamicAtmosphereEnabled: boolean;
  weatherCityId: string;
  atmospherePreview: AtmospherePreviewMode;
  setHasHydrated: (val: boolean) => void;
  setLanguage: (lang: 'tr' | 'en') => void;
  toggleLanguage: () => void;
  setWallpaper: (id: string) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleBubbles: () => void;
  toggleAudioReactiveAmbience: () => void;
  setAudioReactiveAmbience: (val: boolean) => void;
  toggleDynamicAtmosphere: () => void;
  setDynamicAtmosphere: (val: boolean) => void;
  setWeatherCityId: (id: string) => void;
  setAtmospherePreview: (mode: AtmospherePreviewMode) => void;
  setBrightness: (val: number) => void;
  setVolume: (val: number) => void;
  setAuraIntensity: (val: AuraIntensity) => void;
  toggleTapeWarmth: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      language: 'tr',
      activeWallpaperId: 'gucduck-blue',
      isDarkMode: false,
      soundEnabled: true,
      bubblesEnabled: true,
      brightness: 100,
      volume: 80,
      auraIntensity: 'vibrant',
      tapeWarmth: false,
      audioReactiveAmbience: true,
      dynamicAtmosphereEnabled: true,
      weatherCityId: 'eskisehir',
      atmospherePreview: 'auto',
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      setLanguage: (lang: 'tr' | 'en') => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'tr' ? 'en' : 'tr' })),
      setWallpaper: (id: string) => set({ activeWallpaperId: id }),
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.isDarkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
          }
          return { isDarkMode: next };
        }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleBubbles: () => set((state) => ({ bubblesEnabled: !state.bubblesEnabled })),
      toggleAudioReactiveAmbience: () => set((state) => ({ audioReactiveAmbience: !state.audioReactiveAmbience })),
      setAudioReactiveAmbience: (val: boolean) => set({ audioReactiveAmbience: val }),
      toggleDynamicAtmosphere: () => set((state) => ({ dynamicAtmosphereEnabled: !state.dynamicAtmosphereEnabled })),
      setDynamicAtmosphere: (val: boolean) => set({ dynamicAtmosphereEnabled: val }),
      setWeatherCityId: (id: string) => set({ weatherCityId: id }),
      setAtmospherePreview: (mode: AtmospherePreviewMode) => set({ atmospherePreview: mode }),
      setBrightness: (val: number) => set({ brightness: val }),
      setVolume: (val: number) => set({ volume: val }),
      setAuraIntensity: (val: AuraIntensity) => set({ auraIntensity: val }),
      toggleTapeWarmth: () => set((state) => ({ tapeWarmth: !state.tapeWarmth })),
    }),
    {
      name: 'korumtas-os-settings',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', state.isDarkMode);
        }
      },
    }
  )
);

/**
 * Hydration-safe hook for client rendering.
 * Returns true once client hydration is complete.
 */
export function useHasHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
