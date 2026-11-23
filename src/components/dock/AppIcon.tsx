'use client';

import React from 'react';
import { AppMetadata } from '@/data/apps';

interface AppIconProps {
  iconType: AppMetadata['iconType'];
  badge?: string | number;
  className?: string;
}

const ICON_MAP: Record<AppMetadata['iconType'], string> = {
  finder: '/icons/macos/app_finder.png',
  safari: '/icons/macos/app_safari.png',
  messages: '/icons/macos/app_messages.png',
  mail: '/icons/macos/app_mail.png',
  notes: '/icons/macos/app_notes.png',
  photos: '/icons/macos/app_photos.png',
  terminal: '/icons/macos/app_terminal.png',
  settings: '/icons/macos/app_settings.png',
  trash: '/icons/macos/app_trash.png',
  studio: '',
  instagram: '',
};

export function AppIcon({ iconType, badge, className = '' }: AppIconProps) {
  if (iconType === 'instagram') {
    return (
      <div className={`relative w-full h-full select-none flex items-center justify-center ${className}`}>
        {/* macOS squircle container with official Instagram radial/linear brand gradient */}
        <div
          className="w-full h-full rounded-[22%] flex items-center justify-center p-2.5 relative overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.45)] border border-pink-400/30"
          style={{
            background:
              'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
          }}
        >
          {/* Subtle glossy top reflection like Apple app icons */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none rounded-t-[22%]" />

          {/* Authentic Instagram glyph in crisp white */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] relative z-10"
          >
            {/* Camera outer body squircle */}
            <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" />
            {/* Center lens circle */}
            <circle cx="12" cy="12" r="4.2" />
            {/* Flash dot */}
            <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
          </svg>
        </div>
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-slate-800 shadow-md pointer-events-none z-20">
            {badge}
          </span>
        )}
      </div>
    );
  }

  if (iconType === 'studio') {
    return (
      <div className={`relative w-full h-full select-none flex items-center justify-center ${className}`}>
        <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-[#1E112A] via-[#31154E] to-[#120824] flex flex-col items-center justify-center p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.4)] border border-purple-400/30 relative overflow-hidden">
          {/* Subtle glossy top reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none rounded-t-[22%]" />
          
          {/* Glowing DAW Waveform & Mixer Lines */}
          <div className="flex items-center justify-center gap-[3px] w-full h-full relative z-10">
            <span className="w-1.5 h-3 bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="w-1.5 h-6 bg-gradient-to-t from-purple-500 to-indigo-300 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="w-1.5 h-8 bg-gradient-to-t from-fuchsia-500 to-rose-400 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
            <span className="w-1.5 h-5 bg-gradient-to-t from-purple-500 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="w-1.5 h-7 bg-gradient-to-t from-indigo-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="w-1.5 h-3.5 bg-gradient-to-t from-violet-500 to-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
          </div>
        </div>
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-slate-800 shadow-md pointer-events-none z-20">
            {badge}
          </span>
        )}
      </div>
    );
  }

  const iconSrc = ICON_MAP[iconType] || '/icons/macos/app_finder.png';

  return (
    <div className={`relative w-full h-full select-none flex items-center justify-center ${className}`}>
      <img
        src={iconSrc}
        alt={iconType}
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.28)] select-none"
        draggable={false}
        loading="eager"
      />
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-slate-800 shadow-md pointer-events-none z-20">
          {badge}
        </span>
      )}
    </div>
  );
}
