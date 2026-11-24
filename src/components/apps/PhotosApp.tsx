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
  Sliders,
  Play,
  Pause,
  Music,
  Headphones,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/useAudioStore';
import { useOverlayStore } from '@/stores/useOverlayStore';
import { ORIGINAL_TRACKS } from '@/data/music';

interface PhotoItem {
  id: string;
  title: string;
  category: 'campaign' | 'gear' | 'sessions' | 'club';
  date: string;
  description: string;
  renderTool: string;
  gradient: string;
  accentColor: string;
  relatedTrackId?: string;
  gearList: string[];
}

const PHOTOS: PhotoItem[] = [
  {
    id: 'photo-excalibur',
    title: 'Casper Excalibur — Official Campaign Jingle',
    category: 'campaign',
    date: 'Ekim 2026',
    description:
      'Casper Excalibur televizyon ve dijital lansman kampanyası için bestelenen sinematik 3 saniyelik sonic logo ve ana fragman tema müziği. Yüksek transient netliği, patlayıcı analog sub-bass ve fütüristik ses tasarımı.',
    renderTool: 'Ableton Live 12 • Moog Sub 37 • FabFilter Pro',
    gradient: 'from-amber-600 via-yellow-600 to-neutral-950',
    accentColor: '#F59E0B',
    relatedTrackId: 'track-excalibur',
    gearList: ['Moog Sub 37 (Lead Bass)', 'Spire Synth', 'FabFilter Saturn 2', 'SSL G-Master Bus'],
  },
  {
    id: 'photo-analog-racks',
    title: 'Analog Hardware Synthesizers & Summing',
    category: 'gear',
    date: 'Ağustos 2026',
    description:
      'Stüdyodaki analog donanım zinciri: Moog Sub 37 bas synthesizer, Roland TB-303 analog bas hattı ve sıcak analog harmonikler üreten tüplü kompresör ve ekolayzır devreleri.',
    renderTool: 'Studio Rack • Universal Audio Apollo x8',
    gradient: 'from-purple-700 via-indigo-800 to-slate-950',
    accentColor: '#8B5CF6',
    relatedTrackId: 'track-dark-elektro',
    gearList: ['Roland TB-303', 'Moog Sub 37', 'UAD Manley Massive Passive', 'Neve 1073 Preamp'],
  },
  {
    id: 'photo-tech-house',
    title: 'Club Masters — "I AM A LOVER" Session',
    category: 'sessions',
    date: 'Temmuz 2026',
    description:
      '126 BPM kulüp dans pisti için hazırlanan parça aranjmanı. Hipnotik vokal kesitleri, analog TB-303 asit yürüyüşü ve dans pistinde subwoofurları titreten faz hizalı vuruş dinamiği.',
    renderTool: 'Logic Pro 11 • Analog 303 Summing',
    gradient: 'from-cyan-600 via-blue-700 to-slate-950',
    accentColor: '#06B6D4',
    relatedTrackId: 'track-tech-house-lover',
    gearList: ['Roland TB-303', 'Serum Vocal Slices', 'Soundtoys Decapitator', 'Ozone 11 Maximizer'],
  },
  {
    id: 'photo-ethnic-garage',
    title: 'Ethnic Garage & Tribal UK 2-Step',
    category: 'sessions',
    date: 'Mayıs 2026',
    description:
      'Geleneksel Orta Doğu enstrümanlarının (ney, saz) modern İngiliz 2-step garaj ritimleri ve 132 BPM senkoplu ritim salınımlarıyla harmanlandığı kültürel sentez aranjman oturumu.',
    renderTool: 'Ableton Live 12 • Organic Ney Recording',
    gradient: 'from-emerald-600 via-teal-800 to-stone-950',
    accentColor: '#10B981',
    relatedTrackId: 'track-ethnic-garage',
    gearList: ['Canlı Ney & Bağlama Kaydı', 'Shadow Hills Mastering Compressor', 'Valhalla VintageVerb'],
  },
  {
    id: 'photo-ethnic-psy',
    title: 'Tribal Psytrance & Hypnotic Modulation',
    category: 'sessions',
    date: 'Nisan 2026',
    description:
      '138 BPM psikedelik trance aranjmanı. Çeyrek ton doğu dizileri, filtrelenmiş asit arpejleri ve 3D binaural derinlik hissi veren uzamsal reverb alanları.',
    renderTool: 'Modular Synth • FabFilter Pro-MB',
    gradient: 'from-fuchsia-600 via-purple-800 to-indigo-950',
    accentColor: '#D946EF',
    relatedTrackId: 'track-ethnic-psy',
    gearList: ['Arturia Pigments', 'Infected Mushroom Pusher', 'Eventide Blackhole Spatial Reverb'],
  },
  {
    id: 'photo-guitar-house',
    title: 'Sunset Deep House — Organic Stratocaster',
    category: 'sessions',
    date: 'Mart 2026',
    description:
      'Canlı Fender Stratocaster gitar akorları ve organik akustik tınıların 122 BPM gün batımı house ritimleriyle buluştuğu sıcak kulüp kaydı.',
    renderTool: 'Fender Stratocaster • Universal Audio Amp',
    gradient: 'from-rose-600 via-pink-700 to-purple-950',
    accentColor: '#F43F5E',
    relatedTrackId: 'track-guitar-house',
    gearList: ['Fender American Pro Stratocaster', 'UAD Fender 55 Tweed', 'FabFilter Pro-C 2'],
  },
  {
    id: 'photo-club-night',
    title: 'Peak Time Electronic Club Set & Live Booth',
    category: 'club',
    date: 'Şubat 2026',
    description:
      'Elektronik dans pisti performansı. Seyircinin enerjisini yönlendiren miks geçişleri, analog davul loopları ve geceyi zirveye taşıyan peak-time ses dinamikleri.',
    renderTool: 'Pioneer DJ CDJ-3000 • Allen & Heath Xone:96',
    gradient: 'from-blue-600 via-indigo-800 to-neutral-950',
    accentColor: '#3B82F6',
    relatedTrackId: 'track-tech-house-club',
    gearList: ['Allen & Heath Xone:96 Analog Mixer', 'Pioneer CDJ-3000', 'Custom Club Audio Rig'],
  },
  {
    id: 'photo-mastering-lab',
    title: 'Acoustic Room & Club Mastering Chain',
    category: 'gear',
    date: 'Ocak 2026',
    description:
      'Akustik olarak optimize edilmiş mastering kontrol odası. Subwoofer faz eşitlemesi, analog stereo genişletme ve kulüp ses sistemleri standartlarında -7 LUFS entegre ses şiddeti kalibrasyonu.',
    renderTool: 'Studio Acoustics • Genelec SAM Monitors',
    gradient: 'from-slate-700 via-zinc-800 to-black',
    accentColor: '#64748B',
    gearList: ['Genelec 8351B Smart Active Monitors', 'Universal Audio Apollo x8', 'Sonarworks Reference 4'],
  },
];

export const PhotosApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'campaign' | 'gear' | 'sessions' | 'club'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const registerQuickLook = useOverlayStore((s) => s.registerQuickLook);
  const unregisterQuickLook = useOverlayStore((s) => s.unregisterQuickLook);

  React.useEffect(() => {
    if (!lightboxPhoto) return;
    const closer = () => setLightboxPhoto(null);
    registerQuickLook(closer);
    return () => unregisterQuickLook(closer);
  }, [lightboxPhoto, registerQuickLook, unregisterQuickLook]);

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

  const matchedTrack = lightboxPhoto?.relatedTrackId
    ? ORIGINAL_TRACKS.find((t) => t.id === lightboxPhoto.relatedTrackId)
    : null;

  const isCurrentTrackPlaying = Boolean(
    matchedTrack && currentTrack?.id === matchedTrack.id && isPlaying
  );

  const handlePlayRelatedTrack = () => {
    if (!matchedTrack) return;
    if (currentTrack?.id === matchedTrack.id) {
      togglePlay();
    } else {
      playTrack(matchedTrack);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* Mobile Top Category Filter Scrollbar */}
      <div className="flex md:hidden items-center gap-1.5 p-2 bg-neutral-100/90 dark:bg-neutral-950/80 border-b border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-300 bg-black/5 dark:bg-white/5'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Tüm Kareler ({PHOTOS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('campaign')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'campaign'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-300 bg-black/5 dark:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Casper Excalibur</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('gear')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'gear'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-300 bg-black/5 dark:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Analog Synths</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('sessions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'sessions'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-300 bg-black/5 dark:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Aranjman</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('club')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'club'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-neutral-300 bg-black/5 dark:bg-white/5'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Kulüp & Sahne</span>
        </button>
      </div>

      {/* 1. Left Sidebar: Albums (Desktop only) */}
      <div className="hidden md:flex w-56 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 p-3 flex-col justify-between backdrop-blur-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-2">
            Studio & Production
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
                <span>Tüm Kareler</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'all' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('campaign')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'campaign'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Casper Excalibur</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'campaign' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === 'campaign').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('gear')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'gear'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Analog Synths & Donanım</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'gear' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === 'gear').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('sessions')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'sessions'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>DAW & Aranjman</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'sessions' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === 'sessions').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('club')}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'club'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" />
                <span>Kulüp & Sahne</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === 'club' ? 'text-white/80' : 'text-slate-400'}`}>
                {PHOTOS.filter((p) => p.category === 'club').length}
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 text-[11px] text-slate-400 dark:text-neutral-500 px-2 flex flex-col gap-0.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Hüseyin Korumtaş Studio</span>
          <span>{filteredPhotos.length} Kare • Görsel & Ses Arşivi</span>
        </div>
      </div>

      {/* 2. Main Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                    {photo.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {photo.relatedTrackId && (
                      <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center">
                        <Music className="w-2.5 h-2.5 text-white/90" />
                      </span>
                    )}
                    <Maximize2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs line-clamp-1 drop-shadow-sm">
                    {photo.title}
                  </h3>
                  <div className="text-[10px] opacity-80 mt-0.5 line-clamp-1">
                    {photo.date} • {photo.renderTool.split('•')[0]}
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
            data-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[90dvh] overflow-y-auto"
            >
              {/* Lightbox Banner / Image */}
              <div
                className={`w-full h-56 sm:h-64 bg-gradient-to-tr ${lightboxPhoto.gradient} p-6 flex flex-col justify-between text-white relative flex-shrink-0`}
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
                  <span className="text-[10px] opacity-80 backdrop-blur-md px-2 py-0.5 rounded-full bg-black/30">
                    Hüseyin Korumtaş Archive
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight drop-shadow-md">
                    {lightboxPhoto.title}
                  </h2>
                </div>
              </div>

              {/* Lightbox Details */}
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* Action Row: Play production track if available */}
                {matchedTrack && (
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        {isCurrentTrackPlaying ? (
                          <Music className="w-4 h-4 animate-bounce" />
                        ) : (
                          <Headphones className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-indigo-950 dark:text-indigo-200 truncate">
                          {matchedTrack.title}
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                          {matchedTrack.bpm} BPM • {matchedTrack.genre}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePlayRelatedTrack}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 hover:scale-105 active:scale-95"
                    >
                      {isCurrentTrackPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Duraklat</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Bu Eseri Dinle</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lightboxPhoto.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{lightboxPhoto.renderTool}</span>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-neutral-300 text-sm leading-relaxed">
                  {lightboxPhoto.description}
                </p>

                {/* Used Equipment & VSTs */}
                {lightboxPhoto.gearList && lightboxPhoto.gearList.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">
                      Kullanılan Enstrüman & Prodüksiyon Donanımları:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lightboxPhoto.gearList.map((gear, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-[10px] border border-black/5 dark:border-white/5"
                        >
                          {gear}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
