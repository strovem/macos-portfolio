import { create } from 'zustand';

interface SpotlightStoreState {
  isOpen: boolean;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;
}

export const useSpotlightStore = create<SpotlightStoreState>((set) => ({
  isOpen: false,
  openSpotlight: () => set({ isOpen: true }),
  closeSpotlight: () => set({ isOpen: false }),
  toggleSpotlight: () => set((state) => ({ isOpen: !state.isOpen })),
}));
