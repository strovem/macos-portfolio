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
};

export function AppIcon({ iconType, badge, className = '' }: AppIconProps) {
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
