import { create } from 'zustand';
import { MusicTrack } from '@/data/music';

export interface DragItem {
  type: 'music-track' | 'file';
  id: string;
  title: string;
  track?: MusicTrack;
  fileName?: string;
}

interface DragStoreState {
  isDragging: boolean;
  dragItem: DragItem | null;
  cursorPosition: { x: number; y: number };
  hoverTarget: 'studio' | 'trash' | null;

  startDrag: (item: DragItem, pos: { x: number; y: number }) => void;
  updateCursor: (pos: { x: number; y: number }) => void;
  setHoverTarget: (target: 'studio' | 'trash' | null) => void;
  endDrag: () => void;
}

export const useDragStore = create<DragStoreState>((set) => ({
  isDragging: false,
  dragItem: null,
  cursorPosition: { x: 0, y: 0 },
  hoverTarget: null,

  startDrag: (item, pos) =>
    set({
      isDragging: true,
      dragItem: item,
      cursorPosition: pos,
      hoverTarget: null,
    }),

  updateCursor: (pos) => set({ cursorPosition: pos }),

  setHoverTarget: (target) => set({ hoverTarget: target }),

  endDrag: () =>
    set({
      isDragging: false,
      dragItem: null,
      hoverTarget: null,
    }),
}));
