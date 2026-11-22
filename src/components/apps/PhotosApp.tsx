'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Layers,
  Heart,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoItem {
  id: string;
  title: string;
  category: 'ui' | '3d' | 'milestones';
  date: string;
  description: string;
  renderTool: string;
  gradient: string;
  accentColor: string;
  iconName: string;
}

const PHOTOS: PhotoItem[] = [
  {
    id: 'photo-macos',
    title: 'macOS Web OS Architecture',
    category: 'ui',
    date: 'Oct 2026',
    description:
      'Complete desktop interface running inside browser canvas with tactile draggable stickers and spring physics dock.',
    renderTool: 'Figma • Next.js 14 • Framer Motion',
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    accentColor: '#007AFF',
    iconName: 'Monitor',
  },
  {
    id: 'photo-canvas',
    title: 'Spatial Canvas Multiplayer Nodes',
    category: 'ui',
    date: 'Jul 2025',
    description:
      'Infinite vector whiteboard capable of rendering 10,000+ simultaneous canvas nodes with real-time peer sync.',
    renderTool: 'React • Three.js • Yjs CRDTs',
    gradient: 'from-purple-600 via-pink-700 to-indigo-950',
    accentColor: '#8B5CF6',
    iconName: 'Layers',
  },
  {
    id: 'photo-switch',
    title: 'Mechanical Switch Acoustics',
    category: '3d',
    date: 'May 2024',
    description:
      'Physical tactile soundboard simulating mechanical stem displacement, spring resonance, and acoustic wave propagation.',
    renderTool: 'Web Audio API • Canvas 2D',
    gradient: 'from-cyan-600 via-teal-700 to-slate-950',
    accentColor: '#06B6D4',
    iconName: 'Volume2',
  },
  {
    id: 'photo-aura',
    title: 'Aura Token Architecture',
    category: 'ui',
    date: 'Dec 2025',
    description:
      'Multi-brand design system token hierarchy supporting high contrast, dark mode, and sub-pixel typography scales.',
    renderTool: 'Radix UI • Tailwind CSS',
    gradient: 'from-emerald-600 via-teal-800 to-slate-900',
    accentColor: '#10B981',
    iconName: 'Palette',
  },
  {
    id: 'photo-studio',
    title: 'Late Night Studio Shipping',
    category: 'milestones',
    date: 'Oct 2026',
    description:
      'Studio workspace setup at 02:40 AM putting final touches on spring damping dock physics and sound synthesis.',
    renderTool: 'Studio Photography • 35mm f/1.4',
    gradient: 'from-amber-600 via-orange-800 to-neutral-950',
    accentColor: '#F59E0B',
    iconName: 'Coffee',
  },
  {
    id: 'photo-tmb',
    title: 'Tour du Mont Blanc Alpine Run',
    category: 'milestones',
    date: 'Aug 2025',
    description:
      '165km alpine trail circuit across France, Italy, and Switzerland with 10,200m elevation gain in 7 days.',
    renderTool: 'Garmin GPS • Trailhead Snapshot',
    gradient: 'from-rose-600 via-red-800 to-slate-950',
    accentColor: '#EF4444',
    iconName: 'Mountain',
  },
  {
    id: 'photo-sotd',
    title: 'Awwwards Site of the Day Trophy',
    category: 'milestones',
    date: 'Jan 2026',
    description:
      'Honored with Site of the Day and Developer Award for outstanding micro-interactions and tactile spatial design.',
    renderTool: 'Awwwards Jury Certificate',
    gradient: 'from-amber-500 via-yellow-600 to-stone-900',
    accentColor: '#F59E0B',
    iconName: 'Award',
  },
  {
    id: 'photo-glass',
    title: 'Liquid Glass Shader Refraction',
    category: '3d',
    date: 'Mar 2025',
    description:
      'Interactive normal map refraction shader simulating surface tension and chromatic dispersion in WebGL.',
    renderTool: 'GLSL • Three.js • GSAP',
    gradient: 'from-blue-500 via-cyan-600 to-indigo-950',
    accentColor: '#3B82F6',
    iconName: 'Droplets',
  },
];

export const PhotosApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ui' | '3d' | 'milestones'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  const filteredPhotos = PHOTOS.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxPhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setLightboxPhoto(filteredPhotos[nextIndex]);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxPhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxPhoto(filteredPhotos[prevIndex]);
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Left Sidebar: Albums */}
      <div className="w-52 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 p-3 flex flex-col justify-between backdrop-blur-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-2">
            Photos Library
          </span>

          <div className="mt-2 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>All Photos</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'all' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('ui')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'ui'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>UI & Systems</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'ui' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === 'ui').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('3d')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === '3d'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D & Shaders</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === '3d' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === '3d').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('milestones')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'milestones'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" />
                <span>Milestones</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'milestones' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === 'milestones').length}
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 text-[11px] text-slate-400 dark:text-neutral-500 px-2">
          {filteredPhotos.length} Items • Visual Archive
        </div>
      </div>

      {/* 2. Main Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLightboxPhoto(photo)}
              className="group relative aspect-4/3 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-black/5 dark:border-white/10"
            >
              {/* Graphic Mockup Preview */}
              <div
                className={`w-full h-full bg-gradient-to-tr ${photo.gradient} p-3 flex flex-col justify-between text-white transition-transform group-hover:scale-105 duration-300`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-xs">
                    {photo.category}
                  </span>
                  <Maximize2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div>
                  <h3 className="font-bold text-xs line-clamp-1 drop-shadow-sm">
                    {photo.title}
                  </h3>
                  <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                    {photo.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Lightbox Preview Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col"
            >
              {/* Lightbox Banner / Image */}
              <div
                className={`w-full h-64 bg-gradient-to-tr ${lightboxPhoto.gradient} p-6 flex flex-col justify-between text-white relative`}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left/Right Nav */}
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
                    {lightboxPhoto.category}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight drop-shadow-md">
                    {lightboxPhoto.title}
                  </h2>
                </div>
              </div>

              {/* Lightbox Details */}
              <div className="p-6 flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lightboxPhoto.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 font-mono">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{lightboxPhoto.renderTool}</span>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-neutral-300 text-sm leading-relaxed">
                  {lightboxPhoto.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
