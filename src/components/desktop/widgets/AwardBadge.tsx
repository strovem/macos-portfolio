'use client';

import React from 'react';
import { DesktopCardItem } from '@/types/os';
import { Trophy, Award, Star, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface AwardBadgeProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function AwardBadge({ item, onOpenApp }: AwardBadgeProps) {
  const isAwwwards = item.id.includes('awwwards') || item.metadata?.awardType === 'awwwards';
  const badgeText = item.metadata?.badgeText || (isAwwwards ? 'SOTD 2026' : '1ST PRIZE');
  const score = item.metadata?.juryScore || '8.45';
  const organization = item.metadata?.organization || (isAwwwards ? 'Awwwards Official' : 'Global Hackathon');

  return (
    <div className="relative w-52 p-3.5 rounded-xl backdrop-blur-xl bg-white/75 dark:bg-neutral-900/75 border border-white/50 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200">
      {/* Subtle Golden Radial Glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/15 dark:bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Bar: Icon + Badge Pill */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center text-neutral-900">
          {isAwwwards ? (
            <Trophy className="w-4 h-4 fill-neutral-900" />
          ) : (
            <Award className="w-4 h-4" />
          )}
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold tracking-wide">
          <Star className="w-2.5 h-2.5 fill-current" />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-1.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-neutral-100 tracking-tight leading-snug">
          {item.title}
        </h4>
        <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
          {item.subtitle}
        </p>
      </div>

      {/* Content description */}
      {item.content && (
        <p className="text-[10px] text-slate-600 dark:text-neutral-400 leading-normal mb-3 line-clamp-2">
          {item.content}
        </p>
      )}

      {/* Footer Details */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-mono">
          <ShieldCheck className="w-3 h-3 text-amber-500" />
          <span>Score: <strong className="text-slate-800 dark:text-neutral-200">{score}</strong></span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-0.5 text-slate-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 font-semibold cursor-pointer transition-colors"
        >
          <span>{item.metadata?.callToAction || 'View'}</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
