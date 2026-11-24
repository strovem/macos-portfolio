'use client';

import React from 'react';
import { DesktopCardItem } from '@/types/os';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface MessageSnippetWidgetProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function MessageSnippetWidget({ item, onOpenApp }: MessageSnippetWidgetProps) {
  const { t } = useTranslation();
  const sender = t('messageSender');
  const handle = t('messageHandle');
  const time = t('messageTime');
  const bubbles = [
    { text: t('messageBubble1'), isSender: false },
    { text: t('messageBubble2'), isSender: false },
  ];

  return (
    <div className="relative w-full max-w-[310px] sm:w-72 p-3.5 rounded-2xl backdrop-blur-xl bg-white/85 dark:bg-[#1E1E1E]/85 border border-black/5 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200">
      {/* Top Header: Avatar & Contact Info */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          {/* Avatar with initials or gradient */}
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            <span>SJ</span>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-neutral-900" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-neutral-100 leading-tight">
              {sender}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-neutral-400 font-medium">
              {handle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
          <MessageCircle className="w-3 h-3 text-[#007AFF]" />
          <span>{time}</span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="space-y-2 mb-3">
        {bubbles.map((bubble: { text: string; isSender: boolean }, idx: number) => (
          <div
            key={idx}
            className={`flex ${bubble.isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                bubble.isSender
                  ? 'bg-[#007AFF] text-white rounded-br-sm'
                  : 'bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
              }`}
            >
              {bubble.text}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Reply in Messages CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
        <span className="text-[9px] text-slate-400 dark:text-neutral-500 font-mono">
          {t('messageDelivered')}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-1 text-[10px] text-[#007AFF] hover:text-blue-600 dark:hover:text-sky-400 font-semibold cursor-pointer transition-colors"
        >
          <span>{item.metadata?.callToAction || t('messageCta')}</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
