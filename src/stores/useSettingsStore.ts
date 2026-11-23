import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuraIntensity = 'subtle' | 'vibrant' | 'max';

export interface SettingsState {
  activeWallpaperId: string;
  isDarkMode: boolean;
  soundEnabled: boolean;
  bubblesEnabled: boolean;
  brightness: number;
  volume: number;
  auraIntensity: AuraIntensity;
  tapeWarmth: boolean;
  setWallpaper: (id: string) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleBubbles: () => void;
  setBrightness: (val: number) => void;
  setVolume: (val: number) => void;
  setAuraIntensity: (val: AuraIntensity) => void;
  toggleTapeWarmth: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activeWallpaperId: 'gucduck-blue',
      isDarkMode: false,
      soundEnabled: true,
      bubblesEnabled: true,
      brightness: 100,
      volume: 80,
      auraIntensity: 'vibrant',
      tapeWarmth: false,
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
      setBrightness: (val: number) => set({ brightness: val }),
      setVolume: (val: number) => set({ volume: val }),
      setAuraIntensity: (val: AuraIntensity) => set({ auraIntensity: val }),
      toggleTapeWarmth: () => set((state) => ({ tapeWarmth: !state.tapeWarmth })),
    }),
    {
      name: 'korumtas-os-settings',
    }
  )
);
