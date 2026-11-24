import { create } from 'zustand';

interface MissionControlStoreState {
  isOpen: boolean;
  openMissionControl: () => void;
  closeMissionControl: () => void;
  toggleMissionControl: () => void;
}

export const useMissionControlStore = create<MissionControlStoreState>((set) => ({
  isOpen: false,
  openMissionControl: () => set({ isOpen: true }),
  closeMissionControl: () => set({ isOpen: false }),
  toggleMissionControl: () => set((state) => ({ isOpen: !state.isOpen })),
}));
