import { create } from 'zustand';
import { playSpotlightSound } from '@/utils/soundEffects';

interface SpotlightStoreState {
  isOpen: boolean;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;
}

export const useSpotlightStore = create<SpotlightStoreState>((set) => ({
  isOpen: false,
  openSpotlight: () => {
    playSpotlightSound();
    set({ isOpen: true });
  },
  closeSpotlight: () => set({ isOpen: false }),
  toggleSpotlight: () =>
    set((state) => {
      const next = !state.isOpen;
      if (next) playSpotlightSound();
      return { isOpen: next };
    }),
}));
