'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Globe,
  Share,
  Plus,
  ExternalLink,
  Github,
  Monitor,
  Smartphone,
  Star,
  Sparkles,
} from 'lucide-react';

interface WebBookmark {
  title: string;
  url: string;
  icon: string;
  category: string;
  description: string;
}

const BOOKMARKS: WebBookmark[] = [
  {
    title: 'Spatial Canvas Studio',
    url: 'https://spatial-canvas.io',
    icon: 'Layers',
    category: 'Featured App',
    description: 'Infinite collaborative whiteboard with WebGL shaders & CRDT multiplayer sync.',
  },
  {
    title: 'Aura Design System',
    url: 'https://aura-design.dev',
    icon: 'Palette',
    category: 'Design Systems',
    description: 'Enterprise multi-brand design tokens & accessible primitives.',
  },
  {
    title: 'GucDuck GitHub',
    url: 'https://github.com/gucduck',
    icon: 'Github',
    category: 'Open Source',
    description: 'Explore 40+ repositories, stars, and open source contributions.',
  },
  {
    title: 'Awwwards Honors',
    url: 'https://awwwards.com/sites/macos-web-os',
    icon: 'Award',
    category: 'Recognition',
    description: 'Site of the Day showcase for high-precision tactile motion design.',
  },
];

export const SafariApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://github.com/gucduck');
  const [inputUrl, setInputUrl] = useState('https://github.com/gucduck');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'preview'>('bookmarks');
  const [selectedBookmark, setSelectedBookmark] = useState<WebBookmark>(BOOKMARKS[0]);

  const handleNavigate = (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setInputUrl(url);
    setActiveTab('preview');
    setTimeout(() => setIsLoading(false), 400);
  };

  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    handleNavigate(target);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Safari Top Toolbar */}
      <div className="h-11 px-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 bg-neutral-100/70 dark:bg-neutral-950/40 backdrop-blur-md shrink-0">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400">
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Back to Bookmarks"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded-md text-slate-300 dark:text-neutral-600 cursor-not-allowed"
            disabled
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReload}
            className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
              isLoading ? 'animate-spin text-[#007AFF]' : ''
            }`}
            title="Reload Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address & Search Input */}
        <form onSubmit={handleSubmitUrl} className="flex-1 max-w-lg mx-auto">
          <div className="relative flex items-center justify-center">
            <Lock className="w-3 h-3 text-emerald-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full h-7 pl-8 pr-8 rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white text-center text-xs focus:text-left focus:pl-8 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 transition-all font-mono"
            />
            {isLoading && (
              <div className="w-3 h-3 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin absolute right-3" />
            )}
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400">
          <button
            type="button"
            onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
            className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-neutral-300"
            title="Open in external browser window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Bookmarks Bar */}
      <div className="h-8 px-4 flex items-center gap-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50 text-[11px] overflow-x-auto shrink-0 custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors ${
            activeTab === 'bookmarks'
              ? 'bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white font-medium'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Globe className="w-3 h-3 text-cyan-500" />
          <span>Bookmarks</span>
        </button>

        {BOOKMARKS.map((bm) => (
          <button
            key={bm.title}
            type="button"
            onClick={() => {
              setSelectedBookmark(bm);
              handleNavigate(bm.url);
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors truncate max-w-[140px] ${
              activeTab === 'preview' && currentUrl === bm.url
                ? 'bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>{bm.title}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Safari Viewport */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center custom-scrollbar">
        {activeTab === 'bookmarks' ? (
          /* Bookmarks Home Grid */
          <div className="max-w-2xl w-full flex flex-col gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Safari Favorites & Web Showcase
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto mt-0.5">
                Curated portfolio bookmarks, live prototypes, and external profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOOKMARKS.map((item) => (
                <div
                  key={item.title}
                  onClick={() => {
                    setSelectedBookmark(item);
                    handleNavigate(item.url);
                  }}
                  className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                        {item.category}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-mono text-slate-400 truncate">
                    {item.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Live Web Preview Simulation */
          <div className="max-w-2xl w-full flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center border border-[#007AFF]/20">
              <Globe className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                SSL Secured • 200 OK
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                {selectedBookmark?.title || currentUrl}
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto mt-1 font-mono">
                {currentUrl}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 max-w-md text-xs text-slate-600 dark:text-neutral-300 leading-relaxed text-left">
              {selectedBookmark?.description ||
                'Web showcase preview container. Due to X-Frame-Options headers on third-party domains (like GitHub), click below to open the live site in a new tab.'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
                className="px-4 py-2 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Open in Full Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs transition-colors"
              >
                Back to Bookmarks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
