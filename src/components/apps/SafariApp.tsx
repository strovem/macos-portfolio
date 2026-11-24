'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Globe,
  ExternalLink,
  Play,
  Pause,
  Sparkles,
  Layers,
  Radio,
  Sliders,
  Volume2,
} from 'lucide-react';
import { PROJECTS } from '@/data/projects';
import { ORIGINAL_TRACKS } from '@/data/music';
import { useAudioStore } from '@/stores/useAudioStore';

type CategoryFilter = 'all' | 'commercials' | 'electronic' | 'sound-design';

interface WebBookmark {
  title: string;
  url: string;
  category: string;
  description: string;
}

const BOOKMARKS: WebBookmark[] = [
  {
    title: 'Hüseyin Korumtaş Works',
    url: 'https://korumtas.com/works',
    category: 'Showcase',
    description: 'Curated creative production, commercial sound identity, and club records.',
  },
  {
    title: 'LinkedIn Profile',
    url: 'https://www.linkedin.com/in/h%C3%BCseyin-korumta%C5%9F-05379128a/',
    category: 'Professional',
    description: 'Connect on LinkedIn for creative production, audio directing, and collaboration.',
  },
  {
    title: 'Instagram Creative',
    url: 'https://www.instagram.com/korumtashuseyin/',
    category: 'Social',
    description: 'Creative studio sessions, visual storytelling, and productions.',
  },
];

export const SafariApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://korumtas.com/works');
  const [inputUrl, setInputUrl] = useState('https://korumtas.com/works');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'external'>('showcase');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [externalTitle, setExternalTitle] = useState('');
  const [externalDesc, setExternalDesc] = useState('');

  const { isPlaying, currentTrack, playTrack, togglePlay } = useAudioStore();

  const handleNavigate = (url: string, title?: string, desc?: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setInputUrl(url);

    if (url.includes('korumtas.com/works')) {
      setActiveTab('showcase');
    } else {
      setActiveTab('external');
      setExternalTitle(title || url);
      setExternalDesc(desc || 'External link preview.');
    }

    setTimeout(() => setIsLoading(false), 300);
  };

  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    handleNavigate(target);
  };

  const filteredProjects = PROJECTS.filter((p) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'commercials') {
      return p.tags.some((t) => t.toLowerCase().includes('commercial') || t.toLowerCase().includes('brand'));
    }
    if (categoryFilter === 'electronic') {
      return p.tags.some((t) => t.toLowerCase().includes('club') || t.toLowerCase().includes('house') || t.toLowerCase().includes('trap'));
    }
    if (categoryFilter === 'sound-design') {
      return p.tags.some((t) => t.toLowerCase().includes('sound') || t.toLowerCase().includes('ethnic') || t.toLowerCase().includes('fusion'));
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Safari Top Toolbar */}
      <div className="h-11 px-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 bg-neutral-100/70 dark:bg-neutral-950/40 backdrop-blur-md shrink-0">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400">
          <button
            type="button"
            onClick={() => handleNavigate('https://korumtas.com/works')}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Home"
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
            className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
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
              className="w-full h-7 pl-8 pr-8 rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white text-center text-base sm:text-xs focus:text-left focus:pl-8 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50 transition-all font-mono"
            />
            {isLoading && (
              <div className="w-3 h-3 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin absolute right-3" />
            )}
          </div>
        </form>

        {/* External Link Action */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400">
          <button
            type="button"
            onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
            className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-neutral-300 cursor-pointer"
            title="Open in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Bookmarks Bar */}
      <div className="h-8 px-4 flex items-center gap-2 border-b border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50 text-[11px] overflow-x-auto shrink-0 custom-scrollbar">
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.title}
            type="button"
            onClick={() => handleNavigate(bm.url, bm.title, bm.description)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors truncate max-w-[170px] cursor-pointer ${
              currentUrl === bm.url
                ? 'bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Globe className="w-3 h-3 text-cyan-500 shrink-0" />
            <span className="truncate">{bm.title}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Viewport */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 custom-scrollbar">
        {activeTab === 'showcase' ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Header Hero */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Creative Production & Sound Direction</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Selected Works & Commercial Case Studies
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Transforming conceptual briefs into memorable sound design, brand jingles, and club records.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full shrink-0">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                  }`}
                >
                  All ({PROJECTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('commercials')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    categoryFilter === 'commercials'
                      ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                  }`}
                >
                  Commercials
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('electronic')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    categoryFilter === 'electronic'
                      ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                  }`}
                >
                  Club & Electronic
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('sound-design')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    categoryFilter === 'sound-design'
                      ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                  }`}
                >
                  Sound Design
                </button>
              </div>
            </div>

            {/* Project Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => {
                // Find matching original audio track if exists
                const matchingTrack = ORIGINAL_TRACKS.find(
                  (t) =>
                    t.title.toLowerCase().includes('excalibur') ||
                    project.title.toLowerCase().includes(t.title.toLowerCase().slice(0, 8))
                ) || ORIGINAL_TRACKS[0];

                const isCurrentPlaying = isPlaying && currentTrack?.id === matchingTrack.id;

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-neutral-800 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                          {project.role}
                        </span>
                        <span className="text-xs font-mono text-slate-400 dark:text-neutral-500">
                          {project.date}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Creative Highlights */}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="mt-3.5 space-y-1.5 pt-3 border-t border-black/5 dark:border-white/5">
                          {project.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-neutral-400 leading-normal">
                              <span className="text-cyan-500 font-bold shrink-0">✓</span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action & Audio Preview */}
                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-600 dark:text-neutral-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Playback Control Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrentPlaying) {
                            togglePlay();
                          } else {
                            playTrack(matchingTrack);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          isCurrentPlaying
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : 'bg-[#007AFF] text-white hover:bg-blue-600'
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-3 h-3 fill-current" />
                            <span>Playing</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                            <span>Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* External Profile Preview */
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center border border-[#007AFF]/20">
              <Globe className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                SSL Secured • External Destination
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                {externalTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto mt-1 font-mono">
                {currentUrl}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 max-w-md text-xs text-slate-600 dark:text-neutral-300 leading-relaxed text-left">
              {externalDesc}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
                className="px-4 py-2 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>Open in External Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('https://korumtas.com/works')}
                className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Back to Selected Works
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
