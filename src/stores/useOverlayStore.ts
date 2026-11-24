'use client';

import { create } from 'zustand';

export type MenubarPopoverId =
  | 'menu'
  | 'controlCenter'
  | 'nowPlaying'
  | 'weather'
  | 'language'
  | null;

interface OverlayStoreState {
  activePopover: MenubarPopoverId;
  isNotchExpanded: boolean;
  quickLookCloser: (() => void) | null;
  matrixCloser: (() => void) | null;

  setActivePopover: (popover: MenubarPopoverId) => void;
  togglePopover: (popover: Exclude<MenubarPopoverId, null>) => void;
  closeAllPopovers: () => void;
  setNotchExpanded: (expanded: boolean) => void;
  registerQuickLook: (closer: () => void) => void;
  unregisterQuickLook: (closer: () => void) => void;
  registerMatrixMode: (closer: () => void) => void;
  unregisterMatrixMode: (closer: () => void) => void;
}

export const useOverlayStore = create<OverlayStoreState>((set, get) => ({
  activePopover: null,
  isNotchExpanded: false,
  quickLookCloser: null,
  matrixCloser: null,

  setActivePopover: (popover) => {
    set({
      activePopover: popover,
      ...(popover ? { isNotchExpanded: false } : {}),
    });
  },

  togglePopover: (popover) => {
    const next = get().activePopover === popover ? null : popover;
    set({
      activePopover: next,
      ...(next ? { isNotchExpanded: false } : {}),
    });
  },

  closeAllPopovers: () => {
    if (get().activePopover !== null || get().isNotchExpanded) {
      set({ activePopover: null, isNotchExpanded: false });
    }
  },

  setNotchExpanded: (expanded) => {
    set({
      isNotchExpanded: expanded,
      ...(expanded ? { activePopover: null } : {}),
    });
  },

  registerQuickLook: (closer) => set({ quickLookCloser: closer }),
  unregisterQuickLook: (closer) => {
    if (get().quickLookCloser === closer) {
      set({ quickLookCloser: null });
    }
  },

  registerMatrixMode: (closer) => set({ matrixCloser: closer }),
  unregisterMatrixMode: (closer) => {
    if (get().matrixCloser === closer) {
      set({ matrixCloser: null });
    }
  },
}));
