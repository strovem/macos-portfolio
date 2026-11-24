import { create } from 'zustand';
import { AppId, WindowState } from '@/types/os';
import { playWindowOpenSound, playWindowCloseSound, playMinimizeSound } from '@/utils/soundEffects';

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
  minimizeAllWindows: () => void;
  resetWindows: () => void;
  cascadeWindows: () => void;
  centerActiveWindow: () => void;
  bringAllToFront: () => void;
  unfocusAllWindows: () => void;
  clampAllWindowsToViewport: (viewportWidth: number, viewportHeight: number) => void;
  snapPreviewZone: 'left' | 'right' | 'top' | null;
  setSnapPreviewZone: (zone: 'left' | 'right' | 'top' | null) => void;
  tileWindow: (id: AppId, tile: 'left' | 'right' | 'full' | 'center' | 'restore') => void;
  unsnapWindow: (id: AppId) => void;
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
  instagram: {
    id: 'instagram',
    title: 'Instagram',
    icon: 'instagram',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 175, y: 110 },
    size: { width: 480, height: 600 },
    defaultSize: { width: 480, height: 600 },
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
  tonegenerator: {
    id: 'tonegenerator',
    title: 'Tone Generator',
    icon: 'tonegenerator',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 260, y: 110 },
    size: { width: 420, height: 530 },
    defaultSize: { width: 420, height: 530 },
  },
  studio: {
    id: 'studio',
    title: 'Hüseyin Studio — DAW & Audio Lab',
    icon: 'studio',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 120, y: 50 },
    size: { width: 940, height: 580 },
    defaultSize: { width: 940, height: 580 },
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

    if (!target.isOpen || target.isMinimized) {
      playWindowOpenSound();
    }

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

    if (target.isOpen) {
      playWindowCloseSound();
    }

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

    playMinimizeSound();

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

  minimizeAllWindows: () => {
    set((state) => {
      const updated = { ...state.windows };
      Object.keys(updated).forEach((key) => {
        const appId = key as AppId;
        if (updated[appId].isOpen) {
          updated[appId] = { ...updated[appId], isMinimized: true };
        }
      });
      return { windows: updated, activeWindowId: null };
    });
  },

  resetWindows: () => {
    set((state) => {
      const updated = { ...state.windows };
      Object.keys(updated).forEach((key) => {
        const appId = key as AppId;
        const defaultWin = DEFAULT_WINDOWS[appId];
        if (defaultWin) {
          updated[appId] = {
            ...updated[appId],
            position: { ...defaultWin.position },
            size: { ...defaultWin.size },
            isMaximized: false,
            isMinimized: false,
          };
        }
      });
      return { windows: updated };
    });
  },

  cascadeWindows: () => {
    const { windows } = get();
    const openWins = Object.values(windows).filter((w) => w.isOpen && !w.isMinimized);
    if (openWins.length === 0) return;

    const updated = { ...windows };
    openWins.forEach((w, idx) => {
      const newX = 50 + idx * 34;
      const newY = 46 + idx * 34;
      updated[w.id] = {
        ...w,
        position: { x: newX, y: newY },
        isMaximized: false,
      };
    });
    set({ windows: updated });
  },

  centerActiveWindow: () => {
    const { windows, activeWindowId } = get();
    if (!activeWindowId) return;
    const target = windows[activeWindowId];
    if (!target || !target.isOpen) return;

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const newX = Math.max(20, Math.round((winW - target.size.width) / 2));
    const newY = Math.max(34, Math.round((winH - target.size.height) / 2));

    set({
      windows: {
        ...windows,
        [activeWindowId]: {
          ...target,
          position: { x: newX, y: newY },
          isMaximized: false,
        },
      },
    });
  },

  bringAllToFront: () => {
    const { windows, maxZIndex } = get();
    let currentZ = maxZIndex;
    const updated = { ...windows };

    Object.keys(updated).forEach((key) => {
      const appId = key as AppId;
      if (updated[appId].isOpen) {
        currentZ += 1;
        updated[appId] = {
          ...updated[appId],
          isMinimized: false,
          zIndex: currentZ,
        };
      }
    });

    set({ windows: updated, maxZIndex: currentZ });
  },

  unfocusAllWindows: () => {
    set({ activeWindowId: null });
  },

  clampAllWindowsToViewport: (viewportWidth: number, viewportHeight: number) => {
    const menubarHeight = 32;
    const dockHeight = 70;
    set((state) => {
      let changed = false;
      const nextWindows = { ...state.windows };

      for (const key of Object.keys(nextWindows) as AppId[]) {
        const win = nextWindows[key];
        if (!win.isOpen || win.isMinimized || win.isMaximized) continue;

        let { x, y } = win.position;
        let { width, height } = win.size;

        const maxWidth = Math.max(320, viewportWidth - 24);
        if (width > maxWidth) {
          width = maxWidth;
          changed = true;
        }

        const maxHeight = Math.max(240, viewportHeight - menubarHeight - dockHeight - 20);
        if (height > maxHeight) {
          height = maxHeight;
          changed = true;
        }

        const maxX = Math.max(12, viewportWidth - width - 12);
        const clampedX = Math.min(Math.max(12, x), maxX);
        if (clampedX !== x) {
          x = clampedX;
          changed = true;
        }

        const maxY = Math.max(menubarHeight + 6, viewportHeight - dockHeight - height);
        const clampedY = Math.min(Math.max(menubarHeight + 6, y), maxY);
        if (clampedY !== y) {
          y = clampedY;
          changed = true;
        }

        if (changed) {
          nextWindows[key] = {
            ...win,
            position: { x, y },
            size: { width, height },
          };
        }
      }

      return changed ? { windows: nextWindows } : state;
    });
  },

  snapPreviewZone: null,

  setSnapPreviewZone: (zone: 'left' | 'right' | 'top' | null) => {
    if (get().snapPreviewZone !== zone) {
      set({ snapPreviewZone: zone });
    }
  },

  tileWindow: (id: AppId, tile: 'left' | 'right' | 'full' | 'center' | 'restore') => {
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const menubarHeight = 32;
    const dockMargin = 72;
    const availableHeight = winHeight - menubarHeight - dockMargin - 10;
    const targetY = menubarHeight + 6;

    set((state) => {
      const win = state.windows[id];
      if (!win) return state;

      const previousBounds = (win.tilePosition || win.isMaximized) && win.previousBounds
        ? win.previousBounds
        : { position: { ...win.position }, size: { ...win.size } };

      const newMaxZ = state.maxZIndex + 1;

      if (tile === 'restore') {
        if (win.previousBounds) {
          return {
            windows: {
              ...state.windows,
              [id]: {
                ...win,
                position: win.previousBounds.position,
                size: win.previousBounds.size,
                isMaximized: false,
                tilePosition: null,
                zIndex: newMaxZ,
              },
            },
            activeWindowId: id,
            maxZIndex: newMaxZ,
          };
        }
        return state;
      }

      if (tile === 'center') {
        const newX = Math.max(16, Math.round((winWidth - win.size.width) / 2));
        const newY = Math.max(menubarHeight + 6, Math.round((winHeight - win.size.height - dockMargin + menubarHeight) / 2));
        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              position: { x: newX, y: newY },
              isMaximized: false,
              tilePosition: null,
              zIndex: newMaxZ,
            },
          },
          activeWindowId: id,
          maxZIndex: newMaxZ,
        };
      }

      if (tile === 'left') {
        const halfWidth = Math.floor((winWidth - 24) / 2);
        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              position: { x: 8, y: targetY },
              size: { width: halfWidth, height: availableHeight },
              isMaximized: false,
              tilePosition: 'left',
              previousBounds,
              zIndex: newMaxZ,
            },
          },
          activeWindowId: id,
          maxZIndex: newMaxZ,
        };
      }

      if (tile === 'right') {
        const halfWidth = Math.floor((winWidth - 24) / 2);
        const targetX = Math.floor(winWidth / 2) + 4;
        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              position: { x: targetX, y: targetY },
              size: { width: halfWidth, height: availableHeight },
              isMaximized: false,
              tilePosition: 'right',
              previousBounds,
              zIndex: newMaxZ,
            },
          },
          activeWindowId: id,
          maxZIndex: newMaxZ,
        };
      }

      if (tile === 'full') {
        const fullWidth = winWidth - 16;
        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              position: { x: 8, y: targetY },
              size: { width: fullWidth, height: availableHeight },
              isMaximized: false,
              tilePosition: 'full',
              previousBounds,
              zIndex: newMaxZ,
            },
          },
          activeWindowId: id,
          maxZIndex: newMaxZ,
        };
      }

      return state;
    });
  },

  unsnapWindow: (id: AppId) => {
    set((state) => {
      const win = state.windows[id];
      if (!win || (!win.tilePosition && !win.isMaximized)) return state;

      const restoredSize = win.previousBounds ? win.previousBounds.size : win.defaultSize;

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            isMaximized: false,
            tilePosition: null,
            size: restoredSize,
          },
        },
      };
    });
  },
}));
