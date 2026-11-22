import { create } from 'zustand';
import { AppId, WindowState } from '@/types/os';

export type FinderSection =
  | 'recents'
  | 'downloads'
  | 'desktop'
  | 'documents'
  | 'music'
  | 'applications'
  | 'trash';

export interface WindowStoreState {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  maxZIndex: number;
  finderSection: FinderSection;
  setFinderSection: (section: FinderSection) => void;
  openFinderToSection: (section: FinderSection) => void;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updatePosition: (id: AppId, pos: { x: number; y: number }) => void;
  updateSize: (id: AppId, size: { width: number; height: number }) => void;
  toggleWindow: (id: AppId) => void;
}

const DEFAULT_WINDOWS: Record<AppId, WindowState> = {
  finder: {
    id: 'finder',
    title: 'Finder',
    icon: 'finder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 20,
    position: { x: 100, y: 60 },
    size: { width: 820, height: 520 },
    defaultSize: { width: 820, height: 520 },
  },
  safari: {
    id: 'safari',
    title: 'Safari',
    icon: 'safari',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 130, y: 80 },
    size: { width: 860, height: 540 },
    defaultSize: { width: 860, height: 540 },
  },
  messages: {
    id: 'messages',
    title: 'Messages',
    icon: 'messages',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 160, y: 100 },
    size: { width: 640, height: 520 },
    defaultSize: { width: 640, height: 520 },
  },
  notes: {
    id: 'notes',
    title: 'Notes',
    icon: 'notes',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 190, y: 120 },
    size: { width: 760, height: 500 },
    defaultSize: { width: 760, height: 500 },
  },
  photos: {
    id: 'photos',
    title: 'Photos',
    icon: 'photos',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 220, y: 140 },
    size: { width: 780, height: 520 },
    defaultSize: { width: 780, height: 520 },
  },
  terminal: {
    id: 'terminal',
    title: 'Terminal',
    icon: 'terminal',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 250, y: 160 },
    size: { width: 680, height: 420 },
    defaultSize: { width: 680, height: 420 },
  },
  settings: {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 280, y: 180 },
    size: { width: 600, height: 450 },
    defaultSize: { width: 600, height: 450 },
  },
  trash: {
    id: 'trash',
    title: 'Trash',
    icon: 'trash',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 310, y: 200 },
    size: { width: 600, height: 420 },
    defaultSize: { width: 600, height: 420 },
  },
};

/**
 * Finds next top-most window to focus when the active window is closed or minimized.
 */
function getNextActiveWindowId(
  windows: Record<AppId, WindowState>,
  excludeId?: AppId
): AppId | null {
  const eligibleWindows = Object.values(windows).filter(
    (w) => w.isOpen && !w.isMinimized && w.id !== excludeId
  );

  if (eligibleWindows.length === 0) return null;

  eligibleWindows.sort((a, b) => b.zIndex - a.zIndex);
  return eligibleWindows[0].id;
}

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: DEFAULT_WINDOWS,
  activeWindowId: 'finder',
  maxZIndex: 20,
  finderSection: 'documents',

  setFinderSection: (section: FinderSection) => set({ finderSection: section }),

  openFinderToSection: (section: FinderSection) => {
    get().openWindow('finder');
    get().focusWindow('finder');
    set({ finderSection: section });
  },

  openWindow: (id: AppId) => {
    const { windows, maxZIndex } = get();
    const target = windows[id];
    if (!target) return;

    const newMaxZ = maxZIndex + 1;
    set({
      windows: {
        ...windows,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
          zIndex: newMaxZ,
        },
      },
      activeWindowId: id,
      maxZIndex: newMaxZ,
    });
  },

  closeWindow: (id: AppId) => {
    const { windows, activeWindowId } = get();
    const target = windows[id];
    if (!target) return;

    const updatedWindows = {
      ...windows,
      [id]: {
        ...target,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      },
    };

    let nextActiveId = activeWindowId;
    if (activeWindowId === id) {
      nextActiveId = getNextActiveWindowId(updatedWindows, id);
    }

    set({
      windows: updatedWindows,
      activeWindowId: nextActiveId,
    });
  },

  minimizeWindow: (id: AppId) => {
    const { windows, activeWindowId } = get();
    const target = windows[id];
    if (!target) return;

    const updatedWindows = {
      ...windows,
      [id]: {
        ...target,
        isMinimized: true,
      },
    };

    let nextActiveId = activeWindowId;
    if (activeWindowId === id) {
      nextActiveId = getNextActiveWindowId(updatedWindows, id);
    }

    set({
      windows: updatedWindows,
      activeWindowId: nextActiveId,
    });
  },

  maximizeWindow: (id: AppId) => {
    const { windows, maxZIndex } = get();
    const target = windows[id];
    if (!target) return;

    const nextMaximized = !target.isMaximized;
    const newMaxZ = maxZIndex + 1;

    set({
      windows: {
        ...windows,
        [id]: {
          ...target,
          isMaximized: nextMaximized,
          zIndex: newMaxZ,
        },
      },
      activeWindowId: id,
      maxZIndex: newMaxZ,
    });
  },

  focusWindow: (id: AppId) => {
    const { windows, activeWindowId, maxZIndex } = get();
    const target = windows[id];
    if (!target) return;

    // If already active and at highest z-index, avoid unnecessary state update
    if (activeWindowId === id && target.zIndex === maxZIndex) {
      return;
    }

    const newMaxZ = maxZIndex + 1;
    set({
      windows: {
        ...windows,
        [id]: {
          ...target,
          zIndex: newMaxZ,
        },
      },
      activeWindowId: id,
      maxZIndex: newMaxZ,
    });
  },

  updatePosition: (id: AppId, pos: { x: number; y: number }) => {
    set((state) => {
      const target = state.windows[id];
      if (!target) return state;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...target,
            position: pos,
          },
        },
      };
    });
  },

  updateSize: (id: AppId, size: { width: number; height: number }) => {
    set((state) => {
      const target = state.windows[id];
      if (!target) return state;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...target,
            size: size,
          },
        },
      };
    });
  },

  toggleWindow: (id: AppId) => {
    const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = get();
    const target = windows[id];
    if (!target) return;

    if (!target.isOpen) {
      openWindow(id);
    } else if (target.isMinimized) {
      openWindow(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  },
}));
