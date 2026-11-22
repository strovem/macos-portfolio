import { create } from 'zustand';

export interface SettingsState {
  activeWallpaperId: string;
  isDarkMode: boolean;
  soundEnabled: boolean;
  bubblesEnabled: boolean;
  brightness: number;
  volume: number;
  setWallpaper: (id: string) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleBubbles: () => void;
  setBrightness: (val: number) => void;
  setVolume: (val: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  activeWallpaperId: 'gucduck-blue',
  isDarkMode: false,
  soundEnabled: true,
  bubblesEnabled: true,
  brightness: 100,
  volume: 80,
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
}));
