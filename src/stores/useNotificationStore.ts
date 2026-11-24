import { create } from 'zustand';
import { AppId } from '@/types/os';
import { playNotificationSound } from '@/utils/soundEffects';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  appId?: AppId;
  timestamp: number;
  actionLabel?: string;
  onAction?: () => void;
  targetAppId?: AppId;
  duration?: number; // ms, default 5000
}

interface NotificationStoreState {
  toasts: NotificationItem[];
  history: NotificationItem[];
  isCenterOpen: boolean;
  pushNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => string;
  dismissToast: (id: string) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  toggleCenter: () => void;
  openCenter: () => void;
  closeCenter: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  toasts: [],
  history: [],
  isCenterOpen: false,

  pushNotification: (notifData) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: NotificationItem = {
      ...notifData,
      id,
      timestamp: Date.now(),
      duration: notifData.duration ?? 5000,
    };

    // Play procedural notification chime
    playNotificationSound();

    set((state) => {
      // Keep up to 3 active toasts at a time; if 3 are present, drop the oldest
      const updatedToasts = state.toasts.length >= 3
        ? [...state.toasts.slice(1), newNotif]
        : [...state.toasts, newNotif];

      // Keep up to 50 items in notification history
      const updatedHistory = [newNotif, ...state.history].slice(0, 50);

      return {
        toasts: updatedToasts,
        history: updatedHistory,
      };
    });

    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  removeHistoryItem: (id) => {
    set((state) => ({
      history: state.history.filter((h) => h.id !== id),
    }));
  },

  clearHistory: () => {
    set({ history: [] });
  },

  toggleCenter: () => {
    set((state) => ({ isCenterOpen: !state.isCenterOpen }));
  },

  openCenter: () => {
    set({ isCenterOpen: true });
  },

  closeCenter: () => {
    set({ isCenterOpen: false });
  },
}));
