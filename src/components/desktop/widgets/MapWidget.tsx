'use client';

import React, { useState } from 'react';
import { DesktopCardItem } from '@/types/os';
import { Navigation, Mountain, Compass, ArrowUpRight, Activity } from 'lucide-react';

interface MapWidgetProps {
  item: DesktopCardItem;
  onOpenApp?: () => void;
}

export function MapWidget({ item, onOpenApp }: MapWidgetProps) {
  const [activeTab, setActiveTab] = useState<'gps' | 'elevation'>('gps');

  const distance = item.metadata?.distance || '165 km';
  const elevation = item.metadata?.elevation || '10,200 m';
  const duration = item.metadata?.duration || '7 Days';
  const region = item.metadata?.region || 'Alps Circuit';

  return (
    <div className="relative w-64 p-3.5 rounded-xl backdrop-blur-md bg-white/85 dark:bg-neutral-900/85 border border-black/5 dark:border-white/10 shadow-xl select-none hover:shadow-2xl transition-all duration-200">
      {/* Top Header: Trail Name & Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Mountain className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-neutral-100 leading-tight">
              {item.title}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-neutral-400 font-medium">
              {region}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>GPS Track</span>
        </div>
      </div>

      {/* Mini Topo Map / Elevation SVG Canvas */}
      <div className="relative h-28 w-full rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-inner mb-3">
        {activeTab === 'gps' ? (
          // Topographic Contour Map with GPS Trail
          <svg className="w-full h-full" viewBox="0 0 240 110" fill="none">
            <defs>
              <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {/* Topographic Contour Lines */}
            <path d="M 0 30 Q 60 10, 120 40 T 240 25" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />
            <path d="M 0 50 Q 70 25, 140 60 T 240 45" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />
            <path d="M 0 75 Q 80 45, 150 85 T 240 70" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />
            <path d="M 0 95 Q 90 70, 160 100 T 240 90" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />

            {/* Mountain Peaks */}
            <polygon points="120,15 140,55 100,55" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
            <polygon points="175,25 195,65 155,65" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
            <polygon points="55,35 75,70 35,70" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />

            {/* Snow on Peaks */}
            <polygon points="120,15 127,29 113,29" fill="#94A3B8" />
            <polygon points="175,25 182,37 168,37" fill="#94A3B8" />

            {/* GPS Circuit Loop Trail */}
            <path
              d="M 35 75 C 60 40, 95 30, 120 45 C 145 60, 175 40, 205 60 C 220 75, 190 95, 140 85 C 90 75, 55 95, 35 75 Z"
              stroke="url(#trailGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 2"
            />

            {/* Start / Finish Point */}
            <circle cx="35" cy="75" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* High Pass Waypoint (Col de la Seigne) */}
            <circle cx="120" cy="45" r="3.5" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="205" cy="60" r="3.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />

            {/* Label overlays */}
            <text x="38" y="90" fill="#10B981" fontSize="7" fontWeight="bold" fontFamily="monospace">START / FINISH</text>
            <text x="123" y="42" fill="#38BDF8" fontSize="7" fontWeight="bold" fontFamily="monospace">COL DE LA SEIGNE</text>
            <text x="160" y="78" fill="#94A3B8" fontSize="7" fontFamily="monospace">COURMAYEUR</text>
          </svg>
        ) : (
          // Elevation Profile Graph
          <svg className="w-full h-full" viewBox="0 0 240 110" fill="none">
            <defs>
              <linearGradient id="elevArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="20" y1="20" x2="220" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="20" y1="50" x2="220" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="20" y1="80" x2="220" y2="80" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* Altitude Area */}
            <path
              d="M 20 85 L 20 70 Q 45 30, 70 50 T 120 25 T 170 60 T 220 35 L 220 85 Z"
              fill="url(#elevArea)"
            />
            {/* Altitude Line */}
            <path
              d="M 20 70 Q 45 30, 70 50 T 120 25 T 170 60 T 220 35"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            <text x="25" y="18" fill="#64748B" fontSize="6.5" fontFamily="monospace">2,665m (Max Alt)</text>
            <text x="25" y="88" fill="#64748B" fontSize="6.5" fontFamily="monospace">1,000m (Base)</text>
            <text x="200" y="88" fill="#10B981" fontSize="7" fontWeight="bold" fontFamily="monospace">165 KM</text>
          </svg>
        )}

        {/* Mini Tab switcher inside Map */}
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md p-0.5 border border-white/10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('gps');
            }}
            className={`px-1.5 py-0.5 text-[8px] font-mono rounded ${
              activeTab === 'gps'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Track
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('elevation');
            }}
            className={`px-1.5 py-0.5 text-[8px] font-mono rounded ${
              activeTab === 'elevation'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Stats Grid: Distance, Elevation, Days */}
      <div className="grid grid-cols-3 gap-1.5 text-center mb-3">
        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
          <div className="text-[9px] font-semibold text-slate-500 dark:text-neutral-400">Distance</div>
          <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-neutral-100">{distance}</div>
        </div>
        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
          <div className="text-[9px] font-semibold text-slate-500 dark:text-neutral-400">Ascent</div>
          <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-neutral-100">{elevation}</div>
        </div>
        <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
          <div className="text-[9px] font-semibold text-slate-500 dark:text-neutral-400">Duration</div>
          <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-neutral-100">{duration}</div>
        </div>
      </div>

      {/* Footer link */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px]">
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-mono text-[9px]">
          <Compass className="w-3 h-3 text-emerald-500" />
          <span>Mont Blanc Massif</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApp?.();
          }}
          className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
        >
          <span>{item.metadata?.callToAction || 'Explore'}</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
