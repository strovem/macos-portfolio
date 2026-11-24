import { create } from 'zustand';

interface LockStoreState {
  isLocked: boolean;
  isSleeping: boolean;
  lock: () => void;
  unlock: () => void;
  sleep: () => void;
  wake: () => void;
}

export const useLockStore = create<LockStoreState>((set) => ({
  isLocked: false,
  isSleeping: false,

  lock: () => set({ isLocked: true, isSleeping: false }),
  unlock: () => set({ isLocked: false, isSleeping: false }),
  sleep: () => set({ isSleeping: true, isLocked: true }),
  wake: () => set({ isSleeping: false }),
}));
