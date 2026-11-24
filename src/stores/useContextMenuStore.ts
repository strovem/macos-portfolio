import { create } from 'zustand';
import { ContextMenuEntry } from '@/types/os';
import { playMenuOpenSound } from '@/utils/soundEffects';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuEntry[];
  openContextMenu: (x: number, y: number, items: ContextMenuEntry[]) => void;
  closeContextMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  x: 0,
  y: 0,
  items: [],
  openContextMenu: (x, y, items) => {
    playMenuOpenSound();
    set({
      isOpen: true,
      x,
      y,
      items,
    });
  },
  closeContextMenu: () => set({ isOpen: false }),
}));
