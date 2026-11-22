'use client';

import React, { useState } from 'react';
import { DesktopCardItem } from '@/types/os';
import { ArrowUpRight } from 'lucide-react';

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
  const [isSelected, setIsSelected] = useState(false);

  // SVG representation of macOS blue folder with embossed music note
  const renderMacFolderIcon = (size = 'w-16 h-14') => (
    <div className={`relative ${size} shrink-0 select-none`}>
      <svg
        viewBox="0 0 68 56"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] transition-transform duration-150 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="macosFolderBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B92E8" />
            <stop offset="100%" stopColor="#1B60C4" />
          </linearGradient>

          <linearGradient id="macosFolderFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#55B0FF" />
            <stop offset="35%" stopColor="#2A86E9" />
            <stop offset="100%" stopColor="#0B56BE" />
          </linearGradient>

          <linearGradient id="macosFolderRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <filter id="folderInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Back flap with tab */}
        <path
          d="M 6 8 C 6 5.8 7.8 4 10 4 L 26 4 C 28.5 4 30.5 5.5 32 7.5 L 34.5 11 C 35.5 12.2 37 13 38.8 13 L 58 13 C 60.2 13 62 14.8 62 17 L 62 46 C 62 48.2 60.2 50 58 50 L 10 50 C 7.8 50 6 48.2 6 46 Z"
          fill="url(#macosFolderBackGrad)"
        />

        {/* Front pocket */}
        <path
          d="M 4 16 C 4 14.2 5.5 12.8 7.3 12.8 L 60.7 12.8 C 62.5 12.8 64 14.2 64 16 L 62.8 47.5 C 62.6 49.5 60.9 51 58.9 51 L 9.1 51 C 7.1 51 5.4 49.5 5.2 47.5 Z"
          fill="url(#macosFolderFrontGrad)"
          filter="url(#folderInnerShadow)"
        />

        {/* Top pocket highlight bar */}
        <path
          d="M 6 14 L 62 14"
          stroke="url(#macosFolderRimGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Embossed music glyph on the front pocket */}
        <g transform="translate(24, 23)" fill="white" opacity="0.88">
          <path
            d="M14 2v10.55A3.5 3.5 0 0 0 11.5 11 3.5 3.5 0 1 0 15 14.5V6h5V2h-6z"
            filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.3))"
          />
        </g>
      </svg>
    </div>
  );

  if (isMobile) {
    return (
      <div
        onClick={() => onOpenApp?.()}
        className="flex items-center gap-3 p-3 w-full rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg cursor-pointer active:scale-98 transition-transform"
      >
        {renderMacFolderIcon('w-12 h-10')}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {item.title || "My Music's"}
          </div>
          <div className="text-xs text-slate-500 dark:text-neutral-400">
            {item.subtitle || '8 Tracks'} • Finder&apos;da Aç
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#007AFF]" />
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(true);
      }}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
      className="flex flex-col items-center justify-center p-1.5 rounded-xl group cursor-pointer focus:outline-none w-24 select-none"
    >
      {/* Folder Icon */}
      {renderMacFolderIcon()}

      {/* Folder Label */}
      <div className="mt-1 flex flex-col items-center max-w-[96px]">
        <span
          className={`text-[11px] font-medium text-center leading-tight transition-colors px-1.5 py-0.5 rounded break-words line-clamp-2 ${
            isSelected
              ? 'bg-[#007AFF] text-white shadow-sm'
              : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] group-hover:bg-black/25'
          }`}
        >
          {item.title || "My Music's"}
        </span>
        <span className="text-[9px] text-white/80 font-normal drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] mt-0.5">
          {item.subtitle || '8 items'}
        </span>
      </div>
    </div>
  );
}
