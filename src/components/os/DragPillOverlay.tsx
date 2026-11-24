'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, FileText } from 'lucide-react';
import { useDragStore } from '@/stores/useDragStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Z_INDEX } from '@/constants/zIndex';

export function DragPillOverlay() {
  const isDragging = useDragStore((state) => state.isDragging);
  const dragItem = useDragStore((state) => state.dragItem);
  const cursorPosition = useDragStore((state) => state.cursorPosition);
  const hoverTarget = useDragStore((state) => state.hoverTarget);
  const { language } = useTranslation();

  return (
    <AnimatePresence>
      {isDragging && dragItem && (
        <div
          data-modal="true"
          className="fixed pointer-events-none transition-transform duration-75 select-none"
          style={{
            left: cursorPosition.x + 14,
            top: cursorPosition.y + 14,
            zIndex: Z_INDEX.DRAG_PILL,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className={`liquid-glass px-3 py-1.5 rounded-full flex items-center gap-2 border shadow-2xl backdrop-blur-2xl transition-all duration-150 ${
              hoverTarget === 'studio'
                ? 'border-indigo-400 bg-indigo-600/30 text-white ring-2 ring-indigo-400/50 scale-105'
                : hoverTarget === 'notch'
                ? 'border-emerald-400 bg-emerald-600/30 text-white ring-2 ring-emerald-400/50 scale-105'
                : hoverTarget === 'trash'
                ? 'border-rose-400 bg-rose-600/30 text-white ring-2 ring-rose-400/50 scale-105'
                : 'border-white/30 dark:border-white/20 text-slate-900 dark:text-white'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                dragItem.type === 'music-track' ? 'bg-indigo-500' : 'bg-blue-500'
              }`}
            >
              {dragItem.type === 'music-track' ? (
                <Music className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
            </div>

            <span className="text-xs font-bold truncate max-w-[160px]">
              {dragItem.title}
            </span>

            {hoverTarget === 'studio' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/40 text-indigo-100">
                {language === 'tr' ? "Studio'da Çal" : 'Play in Studio'}
              </span>
            )}

            {hoverTarget === 'notch' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/40 text-emerald-100">
                {language === 'tr' ? "Çentik'te Çal" : 'Play on Notch'}
              </span>
            )}

            {hoverTarget === 'trash' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/40 text-rose-100">
                {language === 'tr' ? 'Çöpe At' : 'Move to Trash'}
              </span>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
