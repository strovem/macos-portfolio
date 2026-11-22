'use client';

import React from 'react';
import { DesktopCardItem } from '@/types/os';
import { Image as ImageIcon, ArrowUpRight } from 'lucide-react';

interface PolaroidCardProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function PolaroidCard({ item, onOpenApp }: PolaroidCardProps) {
  const scene = item.metadata?.scene || 'workspace';
  const caption = item.metadata?.caption || item.title;
  const date = item.metadata?.date || '2026';

  return (
    <div className="group relative w-52 p-2.5 pb-5 rounded-sm bg-white dark:bg-neutral-100 border border-neutral-200/80 shadow-xl transition-all duration-200 hover:shadow-2xl select-none">
      {/* Translucent Scotch Tape on top */}
      <div
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/65 backdrop-blur-md border border-white/60 shadow-sm rounded-[1px] rotate-1 z-10 pointer-events-none"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      />

      {/* Glossy Photo Frame Area */}
      <div className="relative aspect-square w-full rounded-[2px] overflow-hidden bg-neutral-900 border border-neutral-800/10 shadow-inner flex items-center justify-center">
        {scene === 'workspace' ? (
          // Scene 1: Late Night Workspace Scene
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="nightSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B132B" />
                <stop offset="100%" stopColor="#1C2541" />
              </linearGradient>
              <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0072FF" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3A506B" />
                <stop offset="100%" stopColor="#2A3B52" />
              </linearGradient>
            </defs>

            {/* Background Room */}
            <rect width="200" height="200" fill="url(#nightSky)" />

            {/* Window with moon & stars */}
            <rect x="130" y="20" width="55" height="60" rx="4" fill="#0E1E38" stroke="#3A506B" strokeWidth="1" />
            <circle cx="165" cy="45" r="10" fill="#FEF08A" opacity="0.9" />
            <circle cx="162" cy="42" r="9" fill="#0E1E38" />
            <circle cx="140" cy="35" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="148" cy="55" r="1.2" fill="#FFFFFF" opacity="0.6" />

            {/* Desk Surface */}
            <path d="M 0 145 L 200 145 L 200 200 L 0 200 Z" fill="url(#deskGrad)" />
            <line x1="0" y1="145" x2="200" y2="145" stroke="#4A6572" strokeWidth="1.5" />

            {/* Monitor Screen with IDE Code */}
            <rect x="45" y="65" width="110" height="72" rx="4" fill="#0A0E1A" stroke="#5BC0BE" strokeWidth="1.5" />
            <rect x="50" y="70" width="100" height="62" rx="2" fill="url(#screenGlow)" opacity="0.25" />
            
            {/* Monitor Stand */}
            <rect x="94" y="137" width="12" height="10" fill="#2A3B52" />
            <rect x="80" y="145" width="40" height="3" rx="1.5" fill="#4A6572" />

            {/* Code Lines on Screen */}
            <line x1="56" y1="78" x2="88" y2="78" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="86" x2="110" y2="86" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            <line x1="64" y1="94" x2="135" y2="94" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
            <line x1="64" y1="102" x2="120" y2="102" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="110" x2="95" y2="110" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />

            {/* Mechanical Keyboard */}
            <rect x="65" y="152" width="70" height="22" rx="2" fill="#1C2541" stroke="#3A506B" strokeWidth="1" />
            <rect x="70" y="155" width="60" height="15" rx="1" fill="#0B132B" />

            {/* Steaming Coffee Mug */}
            <rect x="150" y="148" width="16" height="20" rx="3" fill="#E2E8F0" />
            <path d="M 166 153 C 172 153, 172 163, 166 163" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            {/* Steam trails */}
            <path d="M 155 144 C 153 140, 157 136, 155 132" stroke="#FEF08A" strokeWidth="1" opacity="0.6" strokeLinecap="round" fill="none" />
            <path d="M 160 144 C 158 139, 162 135, 160 130" stroke="#FEF08A" strokeWidth="1" opacity="0.6" strokeLinecap="round" fill="none" />

            {/* Duck Mascot on desk */}
            <ellipse cx="32" cy="162" rx="9" ry="7" fill="#FACC15" />
            <circle cx="37" cy="155" r="5" fill="#FACC15" />
            <polygon points="41,154 46,156 41,158" fill="#F97316" />
            <circle cx="38" cy="154" r="0.8" fill="#1E293B" />
          </svg>
        ) : (
          // Scene 2: Speaker / Keynote Scene
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="stageBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#312E81" />
              </linearGradient>
              <linearGradient id="spotlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <rect width="200" height="200" fill="url(#stageBg)" />

            {/* Spotlight Beam */}
            <polygon points="100,0 30,200 170,200" fill="url(#spotlight)" />

            {/* Giant Keynote Slide Backdrop */}
            <rect x="30" y="25" width="140" height="85" rx="6" fill="#0F172A" stroke="#818CF8" strokeWidth="1.5" />
            {/* Slide title */}
            <text x="100" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              TACTILE SYSTEMS
            </text>
            <text x="100" y="70" textAnchor="middle" fill="#A5B4FC" fontSize="8" fontFamily="sans-serif">
              Web OS & Spatial Interfaces
            </text>
            <rect x="70" y="82" width="60" height="12" rx="6" fill="#6366F1" />
            <text x="100" y="91" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              KEYNOTE 2026
            </text>

            {/* Stage Floor */}
            <polygon points="0,165 200,165 200,200 0,200" fill="#111827" />
            <line x1="0" y1="165" x2="200" y2="165" stroke="#4F46E5" strokeWidth="1" />

            {/* Speaker Silhouette */}
            <circle cx="100" cy="138" r="8" fill="#F8FAFC" />
            <path d="M 88 165 C 88 150, 112 150, 112 165 Z" fill="#F8FAFC" />

            {/* Mic Stand */}
            <line x1="114" y1="144" x2="114" y2="165" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx="114" cy="143" r="2.5" fill="#CBD5E1" />

            {/* Audience Silhouette in Foreground */}
            <circle cx="20" cy="195" r="10" fill="#0B0F19" />
            <circle cx="48" cy="192" r="9" fill="#0B0F19" />
            <circle cx="152" cy="193" r="10" fill="#0B0F19" />
            <circle cx="180" cy="196" r="11" fill="#0B0F19" />
          </svg>
        )}

        {/* Gloss sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      </div>

      {/* Handwritten Marker Caption & Date */}
      <div className="pt-2.5 px-0.5 flex items-center justify-between">
        <div>
          <div className="text-[12px] font-bold text-neutral-800 tracking-tight leading-tight">
            {caption}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
            {item.subtitle}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
            {date}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenApp?.();
            }}
            className="mt-1 text-[9px] text-neutral-600 hover:text-neutral-900 font-semibold inline-flex items-center gap-0.5 hover:underline"
          >
            Photos <ArrowUpRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
