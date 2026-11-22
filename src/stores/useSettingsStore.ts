import { create } from 'zustand';

export interface SettingsState {
  activeWallpaperId: string;
  isDarkMode: boolean;
  soundEnabled: boolean;
  bubblesEnabled: boolean;
  setWallpaper: (id: string) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleBubbles: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  activeWallpaperId: 'gucduck-blue',
  isDarkMode: false,
  soundEnabled: true,
  bubblesEnabled: true,
  setWallpaper: (id: string) => set({ activeWallpaperId: id }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleBubbles: () => set((state) => ({ bubblesEnabled: !state.bubblesEnabled })),
}));
