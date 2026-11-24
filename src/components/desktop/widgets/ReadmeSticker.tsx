'use client';

import React from 'react';
import { DesktopCardItem } from '@/types/os';
import { FileText, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ReadmeStickerProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function ReadmeSticker({ item, onOpenApp }: ReadmeStickerProps) {
  const { t } = useTranslation();
  const lines = [
    t('readmeLine1'),
    t('readmeLine2'),
    t('readmeLine3'),
  ];

  return (
    <div className="relative w-full max-w-[310px] sm:w-64 p-4 rounded-sm font-mono text-neutral-800 bg-[#FEF08A] dark:bg-[#FDE047] border border-yellow-300/80 shadow-xl select-none transition-shadow hover:shadow-2xl">
      {/* Scotch Tape / Pin at top center */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/60 dark:bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm rotate-[-1deg] rounded-[1px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/15">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-neutral-700" />
          <span className="font-bold text-xs tracking-tight text-neutral-900">
            {item.title}
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/10 text-neutral-800">
          {t('readmeTag')}
        </span>
      </div>

      {/* Greeting / Subtitle */}
      <div className="text-xs font-semibold text-neutral-900 mb-1">
        {t('readmeSubtitle')}
      </div>

      {/* Main Content */}
      <p className="text-[11px] leading-relaxed text-neutral-700 mb-3">
        {t('readmeContent')}
      </p>

      {/* Quick bullet points */}
      <div className="space-y-1 mb-3 text-[10px] text-neutral-800 font-medium">
        {lines.map((line: string, idx: number) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Bottom Row: Action pill & Duck footprints */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/15">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-full bg-neutral-900 text-yellow-200 hover:bg-neutral-800 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <span>{t('readmeCta')}</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>

        {/* Cute Duck Footprints SVG */}
        <div className="flex items-center gap-1 opacity-70" title="Duck footprints">
          <svg
            className="w-4 h-4 text-neutral-800 rotate-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* Left toe */}
            <path d="M7 6 C6.5 4, 5.5 3, 5 3 C4.5 3, 4 4.5, 5.5 8 L10 14 C10 14, 8 18, 9 20 C10 22, 12 21, 12 19 L12 15 C13 15, 14 18, 15 20 C16 21, 18 20, 17 18 L14 14 L18.5 8 C20 4.5, 19.5 3, 19 3 C18.5 3, 17.5 4, 17 6 L13 13 L11 13 Z" />
          </svg>
          <svg
            className="w-3.5 h-3.5 text-neutral-800 -rotate-12 translate-y-0.5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 6 C6.5 4, 5.5 3, 5 3 C4.5 3, 4 4.5, 5.5 8 L10 14 C10 14, 8 18, 9 20 C10 22, 12 21, 12 19 L12 15 C13 15, 14 18, 15 20 C16 21, 18 20, 17 18 L14 14 L18.5 8 C20 4.5, 19.5 3, 19 3 C18.5 3, 17.5 4, 17 6 L13 13 L11 13 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
