'use client';

import React from 'react';
import { AppMetadata } from '@/data/apps';

interface AppIconProps {
  iconType: AppMetadata['iconType'];
  badge?: string | number;
  className?: string;
}

export function AppIcon({ iconType, badge, className = '' }: AppIconProps) {
  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {renderIcon(iconType)}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-slate-800 shadow-md pointer-events-none z-20">
          {badge}
        </span>
      )}
    </div>
  );
}

function renderIcon(type: AppMetadata['iconType']) {
  switch (type) {
    case 'finder':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="finder-left" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="finder-right" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="finder-gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="finder-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#finder-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="#1e40af" />
            {/* Left face */}
            <path
              d="M4 4 L50 4 L50 42 C50 48 44 52 44 57 C44 63 50 67 50 72 L50 96 L4 96 Z"
              fill="url(#finder-left)"
            />
            {/* Right face */}
            <path
              d="M50 4 L96 4 L96 96 L50 96 L50 72 C50 67 44 63 44 57 C44 52 50 48 50 42 Z"
              fill="url(#finder-right)"
            />
            {/* Gloss highlight */}
            <rect x="4" y="4" width="92" height="38" fill="url(#finder-gloss)" />
            {/* Center face divider & nose */}
            <path
              d="M50 4 L50 42 C50 48 44 52 44 57 C44 63 50 67 50 72 L50 96"
              stroke="#0f172a"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <ellipse cx="32" cy="40" rx="4.5" ry="7" fill="#0f172a" />
            <ellipse cx="68" cy="40" rx="4.5" ry="7" fill="#0f172a" />
            {/* Eye shines */}
            <circle cx="34" cy="38" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="38" r="1.5" fill="#ffffff" />
            {/* Smile */}
            <path
              d="M24 67 C34 82 66 82 76 67"
              stroke="#0f172a"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'safari':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="safari-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="safari-dial" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="safari-needle-r" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="safari-needle-rd" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <clipPath id="safari-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#safari-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#safari-bg)" />
            {/* Center Dial */}
            <circle cx="50" cy="50" r="38" fill="url(#safari-dial)" stroke="#38bdf8" strokeWidth="1" />
            {/* Compass ticks */}
            <circle
              cx="50"
              cy="50"
              r="34"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="1.5"
              strokeDasharray="1.5 7.4"
              fill="none"
            />
            {/* Major Ticks */}
            <line x1="50" y1="14" x2="50" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="80" x2="50" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="50" x2="20" y2="50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="80" y1="50" x2="86" y2="50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Compass Needle (rotated 45 deg) */}
            <g transform="rotate(45 50 50)">
              {/* Red Top Half */}
              <polygon points="50,15 55,50 50,47" fill="url(#safari-needle-r)" />
              <polygon points="50,15 45,50 50,47" fill="url(#safari-needle-rd)" />
              {/* White/Silver Bottom Half */}
              <polygon points="50,85 55,50 50,53" fill="#f8fafc" />
              <polygon points="50,85 45,50 50,53" fill="#cbd5e1" />
              {/* Pivot */}
              <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="50" cy="50" r="2" fill="#334155" />
            </g>
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'messages':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="msg-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="msg-gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="msg-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#msg-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#msg-bg)" />
            <rect x="4" y="4" width="92" height="42" fill="url(#msg-gloss)" />
            {/* White Speech Bubble */}
            <path
              d="M24 44 C24 30 35 22 50 22 C65 22 76 30 76 44 C76 57 65 65 50 65 C44 65 38 63.5 33 61 L20 68 L23 56 C21 52 24 48 24 44 Z"
              fill="#ffffff"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.18))"
            />
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'notes':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="notes-paper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="notes-header" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <clipPath id="notes-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#notes-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#notes-paper)" />
            {/* Amber leather binding strip */}
            <rect x="4" y="4" width="92" height="24" fill="url(#notes-header)" />
            {/* Perforated stitch line */}
            <line x1="4" y1="27" x2="96" y2="27" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Ruled lines */}
            <line x1="16" y1="40" x2="84" y2="40" stroke="#d97706" strokeOpacity="0.35" strokeWidth="1.5" />
            <line x1="16" y1="54" x2="84" y2="54" stroke="#d97706" strokeOpacity="0.35" strokeWidth="1.5" />
            <line x1="16" y1="68" x2="84" y2="68" stroke="#d97706" strokeOpacity="0.35" strokeWidth="1.5" />
            <line x1="16" y1="82" x2="60" y2="82" stroke="#d97706" strokeOpacity="0.35" strokeWidth="1.5" />
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'photos':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="photos-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <clipPath id="photos-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#photos-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#photos-bg)" />
            {/* 8 Flower Petals around center (50, 50) */}
            <g transform="translate(50, 50)">
              {/* Petal template: oval centered at (0, -18) with rx=7.5, ry=16 */}
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" fill="#f59e0b" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(45)" fill="#ef4444" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(90)" fill="#ec4899" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(135)" fill="#a855f7" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(180)" fill="#3b82f6" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(225)" fill="#06b6d4" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(270)" fill="#10b981" fillOpacity="0.82" />
              <ellipse cx="0" cy="-17" rx="7.5" ry="16" transform="rotate(315)" fill="#84cc16" fillOpacity="0.82" />
              <circle cx="0" cy="0" r="3.5" fill="#ffffff" fillOpacity="0.9" />
            </g>
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'terminal':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="term-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <clipPath id="term-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#term-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#term-bg)" />
            {/* Subtle top header separator */}
            <line x1="4" y1="20" x2="96" y2="20" stroke="#475569" strokeWidth="0.8" strokeOpacity="0.5" />
            {/* Terminal prompt: >_ */}
            <path
              d="M26 38 L42 52 L26 66"
              stroke="#4ade80"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="48" y1="66" x2="72" y2="66" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" />
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'settings':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="gear-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="gear-chrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <clipPath id="gear-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#gear-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#gear-bg)" />
            {/* Intricate Gear */}
            <g transform="translate(50, 50)" fill="url(#gear-chrome)">
              {/* 8 Teeth */}
              <rect x="-5" y="-35" width="10" height="12" rx="2" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(45)" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(90)" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(135)" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(180)" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(225)" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(270)" />
              <rect x="-5" y="-35" width="10" height="12" rx="2" transform="rotate(315)" />
              {/* Outer Gear Ring */}
              <circle cx="0" cy="0" r="26" />
              {/* Hollow Center */}
              <circle cx="0" cy="0" r="12" fill="url(#gear-bg)" />
              {/* Axle */}
              <circle cx="0" cy="0" r="5" fill="url(#gear-chrome)" />
            </g>
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'trash':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="trash-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="trash-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <clipPath id="trash-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#trash-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#trash-bg)" />
            {/* Crumpled paper inside */}
            <path
              d="M42 34 Q45 22 55 24 Q62 27 58 34 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Basket Rim */}
            <ellipse cx="50" cy="34" rx="26" ry="6.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            {/* Wireframe basket body */}
            <path
              d="M26 34 L33 76 C34 79 40 82 50 82 C60 82 66 79 67 76 L74 34 Z"
              fill="rgba(255, 255, 255, 0.12)"
              stroke="url(#trash-metal)"
              strokeWidth="1.5"
            />
            {/* Vertical basket ribs */}
            <line x1="38" y1="38" x2="42" y2="79" stroke="#cbd5e1" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="50" y1="40" x2="50" y2="82" stroke="#cbd5e1" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="62" y1="38" x2="58" y2="79" stroke="#cbd5e1" strokeWidth="1.2" strokeOpacity="0.7" />
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );

    case 'mail':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="mail-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <clipPath id="mail-squircle">
              <rect x="4" y="4" width="92" height="92" rx="22" />
            </clipPath>
          </defs>
          <g clipPath="url(#mail-squircle)">
            <rect x="4" y="4" width="92" height="92" fill="url(#mail-bg)" />
            {/* Envelope shape */}
            <rect x="20" y="30" width="60" height="42" rx="4" fill="#ffffff" />
            <path d="M20 32 L50 54 L80 32" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );
  }
}
