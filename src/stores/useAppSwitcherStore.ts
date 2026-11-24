import { create } from 'zustand';
import { AppId } from '@/types/os';
import { playClickSound } from '@/utils/soundEffects';

interface AppSwitcherState {
  isOpen: boolean;
  openApps: AppId[];
  selectedIndex: number;
  openSwitcher: (apps: AppId[]) => void;
  selectNext: () => void;
  selectPrev: () => void;
  closeSwitcher: () => AppId | null;
}

export const useAppSwitcherStore = create<AppSwitcherState>((set, get) => ({
  isOpen: false,
  openApps: [],
  selectedIndex: 0,

  openSwitcher: (apps) => {
    if (apps.length === 0) return;
    playClickSound();
    set({
      isOpen: true,
      openApps: apps,
      // Default to the next app in list (index 1 if available, else 0)
      selectedIndex: apps.length > 1 ? 1 : 0,
    });
  },

  selectNext: () => {
    const { openApps, selectedIndex } = get();
    if (openApps.length <= 1) return;
    playClickSound();
    set({ selectedIndex: (selectedIndex + 1) % openApps.length });
  },

  selectPrev: () => {
    const { openApps, selectedIndex } = get();
    if (openApps.length <= 1) return;
    playClickSound();
    set({ selectedIndex: (selectedIndex - 1 + openApps.length) % openApps.length });
  },

  closeSwitcher: () => {
    const { openApps, selectedIndex } = get();
    const chosenApp = openApps[selectedIndex] || null;
    set({ isOpen: false });
    return chosenApp;
  },
}));
