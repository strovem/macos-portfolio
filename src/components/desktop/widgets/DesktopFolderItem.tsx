'use client';

import React, { useId, useState } from 'react';
import { DesktopCardItem } from '@/types/os';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAudioStore } from '@/stores/useAudioStore';

interface DesktopFolderItemProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
  isMobile?: boolean;
}

export function DesktopFolderItem({
  item,
  onOpenApp,
  isMobile = false,
}: DesktopFolderItemProps) {
  const { t } = useTranslation();
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const rawUid = useId();
  const uid = rawUid.replace(/:/g, '');
  const [isSelected, setIsSelected] = useState(false);
  const title = item.id === 'my-musics-folder' ? t('folderMusicTitle') : item.title;
  const subtitle = item.id === 'my-musics-folder' ? t('folderMusicSubtitle') : (item.subtitle || '16 items');

  // Unique SVG gradient/filter IDs prevent duplicate-ID collisions between
  // the hidden mobile stack and desktop canvas (which previously hid gradients).
  const backGradId = `folderBack-${uid}`;
  const frontGradId = `folderFront-${uid}`;
  const waveGradId = `folderWave-${uid}`;
  const rimGradId = `folderRim-${uid}`;

  // Eye-catching macOS Sonic Waveform Folder icon
  const renderMacFolderIcon = (size = 'w-20 h-[68px]') => (
    <div
      className={`relative ${size} shrink-0 select-none transition-transform duration-200 group-hover:scale-105 ${
        isPlaying ? 'drop-shadow-[0_0_16px_rgba(56,189,248,0.45)]' : ''
      }`}
    >
      <svg
        viewBox="0 0 80 68"
        className="w-full h-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.42)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={backGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id={frontGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="48%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id={waveGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>

          <linearGradient id={rimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
            <stop offset="50%" stopColor="rgba(165,243,252,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
          </linearGradient>
        </defs>

        {/* Back folder body with macOS top tab */}
        <path
          d="M 6 11 C 6 7.7 8.7 5 12 5 L 29 5 C 31.8 5 34.2 6.4 35.8 8.8 L 38.4 12.6 C 39.6 14.1 41.3 15 43.2 15 L 68 15 C 71.3 15 74 17.7 74 21 L 74 56 C 74 59.3 71.3 62 68 62 L 12 62 C 8.7 62 6 59.3 6 56 Z"
          fill={`url(#${backGradId})`}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* Subtle inner sleeve preview edge (looks like studio stem sheets inside folder) */}
        <rect
          x="13"
          y="13"
          width="54"
          height="10"
          rx="3"
          fill="rgba(224,231,255,0.22)"
        />

        {/* Front folder pocket */}
        <path
          d="M 4 21 C 4 18.2 6.2 16 9 16 L 71 16 C 73.8 16 76 18.2 76 21 L 74.4 57.5 C 74.2 60.6 71.6 63 68.5 63 L 11.5 63 C 8.4 63 5.8 60.6 5.6 57.5 Z"
          fill={`url(#${frontGradId})`}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />

        {/* Specular glass edge highlight */}
        <path
          d="M 8 17.5 L 72 17.5"
          stroke={`url(#${rimGradId})`}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Dark glass inner soundstage plaque */}
        <rect
          x="13"
          y="25"
          width="54"
          height="29"
          rx="7"
          fill="rgba(9,10,24,0.48)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.9"
        />

        {/* Glowing multi-bar Audio Waveform spectrum */}
        <g>
          <rect x="19" y="37" width="3.2" height="6" rx="1.6" fill={`url(#${waveGradId})`} opacity="0.82" />
          <rect x="24.5" y="33" width="3.2" height="14" rx="1.6" fill={`url(#${waveGradId})`} opacity="0.92" />
          <rect x="30" y="29" width="3.2" height="22" rx="1.6" fill={`url(#${waveGradId})`} />
          <rect x="35.5" y="34" width="3.2" height="12" rx="1.6" fill={`url(#${waveGradId})`} opacity="0.95" />
          <rect x="41" y="27.5" width="3.2" height="25" rx="1.6" fill={`url(#${waveGradId})`} />
          <rect x="46.5" y="31.5" width="3.2" height="17" rx="1.6" fill={`url(#${waveGradId})`} opacity="0.95" />
          <rect x="52" y="34.5" width="3.2" height="11" rx="1.6" fill={`url(#${waveGradId})`} opacity="0.9" />
          <rect x="57.5" y="36.5" width="3.2" height="7" rx="1.6" fill={`url(#${waveGradId})`} opacity="0.82" />
        </g>
      </svg>
    </div>
  );

  if (isMobile) {
    return (
      <div
        onClick={() => onOpenApp?.()}
        className="flex items-center gap-3 p-3 w-full max-w-[310px] rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg cursor-pointer active:scale-98 transition-transform"
      >
        {renderMacFolderIcon('w-12 h-10')}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {title}
          </div>
          <div className="text-xs text-slate-500 dark:text-neutral-400">
            {subtitle}
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#007AFF]" />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsSelected(true)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenApp?.();
      }}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
      className="flex flex-col items-center justify-center p-1.5 rounded-xl group cursor-pointer focus:outline-none w-28 select-none"
    >
      {/* Folder Icon */}
      {renderMacFolderIcon()}

      {/* Folder Label */}
      <div className="mt-1.5 flex flex-col items-center max-w-[112px]">
        <span
          className={`text-[11px] font-semibold text-center leading-tight transition-all px-2 py-0.5 rounded-md break-words line-clamp-2 ${
            isSelected
              ? 'bg-[#007AFF] text-white shadow-md'
              : 'text-slate-900 bg-white/55 backdrop-blur-sm shadow-xs dark:bg-black/35 dark:text-white group-hover:bg-white/75 dark:group-hover:bg-black/50'
          }`}
        >
          {title}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/45 dark:bg-black/30 text-slate-800 dark:text-white/85 font-medium mt-0.5 backdrop-blur-xs">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
