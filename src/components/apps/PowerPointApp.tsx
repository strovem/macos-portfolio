'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  Search,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  StickyNote,
  Link2,
  Download,
  Pin,
  Layers,
  Megaphone,
  Palette,
  Music2,
  Sparkles,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import {
  PRESENTATIONS,
  PresentationDeck,
  PresentationCategory,
  JsonSlideItem,
  getLocalizedText,
} from '@/data/presentations';
import { useWindowStore } from '@/stores/useWindowStore';
import { useLockStore } from '@/stores/useLockStore';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { useMissionControlStore } from '@/stores/useMissionControlStore';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { useOverlayStore } from '@/stores/useOverlayStore';
import { useTranslation } from '@/hooks/useTranslation';
import { copyPortfolioDeepLink } from '@/hooks/useUrlDeepLink';
import { playClickSound } from '@/utils/systemSounds';
import { Z_INDEX } from '@/constants/zIndex';

type FilterTab = 'all' | 'pinned' | PresentationCategory;

const VIRTUAL_WIDTH = 960;
const VIRTUAL_HEIGHT = 540;

/**
 * Scales a fixed 960x540 (16:9) virtual slide canvas cleanly into any aspect-video box
 * so thumbnails, mobile previews, desktop stages, and fullscreen views share identical proportions.
 */
function ScaledSlideFrame({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(w / VIRTUAL_WIDTH);
      }
    };

    updateScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateScale);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video overflow-hidden select-none ${className}`}
    >
      <div
        style={{
          width: VIRTUAL_WIDTH,
          height: VIRTUAL_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute top-0 left-0 overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Renders a structured JSON slide at 960x540 native virtual resolution.
 */
function JsonSlideCanvas({
  slide,
  deck,
  slideIndex,
  totalSlides,
  language,
}: {
  slide: JsonSlideItem;
  deck: PresentationDeck;
  slideIndex: number;
  totalSlides: number;
  language: 'tr' | 'en';
}) {
  const title = getLocalizedText(slide.title, language);
  const subtitle = getLocalizedText(slide.subtitle, language);
  const metricLabel = getLocalizedText(slide.metricLabel, language);
  const deckTitle = getLocalizedText(deck.title, language);
  const bullets = (slide.bullets || []).map((b) => getLocalizedText(b, language));

  const backgroundStyle =
    slide.bgGradient ||
    (slide.layout === 'cover' || slide.layout === 'quote'
      ? deck.coverGradient || 'linear-gradient(135deg, #16161c 0%, #2b1d1b 100%)'
      : 'linear-gradient(135deg, #0E1015 0%, #171A23 55%, #12151D 100%)');

  return (
    <div
      className="w-full h-full relative flex flex-col justify-between p-12 text-white overflow-hidden"
      style={{ background: backgroundStyle }}
    >
      {/* Subtle geometric ambient glow */}
      <div
        aria-hidden="true"
        className="absolute -top-28 -right-24 w-[420px] h-[420px] rounded-full blur-[110px] opacity-30 pointer-events-none"
        style={{ background: deck.accentColor }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Slide Bar */}
      <div className="relative z-10 flex items-center justify-between text-xs tracking-wide text-white/60">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: deck.accentColor }}
          />
          <span className="font-medium text-white/75">{deckTitle}</span>
        </div>
        <span className="font-mono tabular-nums text-white/50">
          {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </span>
      </div>

      {/* Main Slide Body by Layout */}
      <div className="relative z-10 flex-1 flex items-center my-4">
        {slide.layout === 'cover' && (
          <div className="max-w-3xl">
            {slide.metric && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-white/90 mb-6">
                <span>{slide.metric}</span>
                {metricLabel && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-white/75">{metricLabel}</span>
                  </>
                )}
              </div>
            )}
            <h1 className="text-[48px] font-bold leading-[1.08] tracking-tight text-white mb-5">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[20px] leading-relaxed text-white/80 font-normal max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {slide.layout === 'split' && (
          <div className="grid grid-cols-12 gap-10 w-full items-center">
            <div className="col-span-7 flex flex-col gap-4">
              <h2 className="text-[36px] font-bold leading-[1.15] tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[17px] leading-relaxed text-white/75">{subtitle}</p>
              )}
              {bullets.length > 0 && (
                <ul className="mt-2 space-y-2.5">
                  {bullets.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-white/85">
                      <span
                        className="mt-2 w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: deck.accentColor }}
                      />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-span-5">
              {slide.imageUrl ? (
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] bg-black/30">
                  <img
                    src={slide.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-8 flex flex-col justify-center items-start shadow-2xl min-h-[240px]">
                  <div
                    className="text-[56px] font-extrabold tracking-tight leading-none mb-3 tabular-nums"
                    style={{ color: deck.accentColor === '#D24726' ? '#FF8A65' : deck.accentColor }}
                  >
                    {slide.metric || '100%'}
                  </div>
                  {metricLabel && (
                    <div className="text-[16px] font-medium text-white/80 leading-snug">
                      {metricLabel}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {slide.layout === 'bullets' && (
          <div className="w-full flex flex-col gap-5">
            <div>
              <h2 className="text-[36px] font-bold leading-tight tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[17px] text-white/70 mt-1.5">{subtitle}</p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3.5 mt-1">
              {bullets.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.05] border border-white/10"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 tabular-nums"
                    style={{ backgroundColor: deck.accentColor }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[17px] text-white/90 font-medium leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.layout === 'showcase' && (
          <div className="grid grid-cols-12 gap-8 w-full items-center">
            <div className="col-span-5 rounded-2xl bg-black/30 border border-white/15 p-8 flex flex-col justify-center min-h-[260px]">
              <div className="text-[64px] font-black tracking-tight leading-none text-white tabular-nums">
                {slide.metric || '—'}
              </div>
              {metricLabel && (
                <div className="text-[16px] text-white/75 font-medium mt-3 leading-snug">
                  {metricLabel}
                </div>
              )}
            </div>
            <div className="col-span-7 flex flex-col gap-3.5">
              <h2 className="text-[34px] font-bold leading-tight tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[16px] text-white/75 leading-relaxed">{subtitle}</p>
              )}
              {bullets.length > 0 && (
                <div className="space-y-2.5 mt-2">
                  {bullets.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 rounded-lg bg-white/[0.07] border border-white/10 text-[15px] text-white/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {slide.layout === 'quote' && (
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
            <div
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: deck.accentColor }}
            />
            <blockquote className="text-[32px] font-semibold leading-[1.3] tracking-tight text-white">
              “{title}”
            </blockquote>
            {subtitle && (
              <cite className="not-italic text-[16px] font-medium text-white/75">
                {subtitle}
              </cite>
            )}
          </div>
        )}
      </div>

      {/* Bottom Slide Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/45 border-t border-white/10 pt-3">
        <span>Hüseyin Korumtaş • Creative Studio</span>
        <span>{deck.date}</span>
      </div>
    </div>
  );
}

/**
 * Renders an image slide or fallback placeholder cleanly inside a 16:9 container.
 */
function ImageSlideCanvas({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-neutral-900 text-neutral-300 flex flex-col items-center justify-center p-6 text-center gap-2">
        <ImageIcon className="w-8 h-8 text-neutral-500" />
        <p className="text-xs font-medium">{title || imageUrl}</p>
        <p className="text-[11px] text-neutral-500 font-mono">{imageUrl}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <img
        src={imageUrl}
        alt={title || 'Slide'}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain select-none"
        draggable={false}
      />
    </div>
  );
}

/**
 * Renders gallery card 16:9 cover thumbnail.
 */
function DeckCoverPreview({
  deck,
  language,
}: {
  deck: PresentationDeck;
  language: 'tr' | 'en';
}) {
  if (deck.coverImage) {
    return (
      <img
        src={deck.coverImage}
        alt={getLocalizedText(deck.title, language)}
        className="w-full h-full object-cover"
        draggable={false}
      />
    );
  }

  if (deck.sourceType === 'slides' && deck.slides[0]) {
    return (
      <ScaledSlideFrame>
        <JsonSlideCanvas
          slide={deck.slides[0]}
          deck={deck}
          slideIndex={0}
          totalSlides={deck.slides.length}
          language={language}
        />
      </ScaledSlideFrame>
    );
  }

  if (deck.sourceType === 'images' && deck.slides[0]) {
    return (
      <ImageSlideCanvas
        imageUrl={deck.slides[0].imageUrl}
        title={getLocalizedText(deck.slides[0].title, language)}
      />
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-4 text-white text-center"
      style={{
        background:
          deck.coverGradient || 'linear-gradient(135deg, #271510 0%, #D24726 100%)',
      }}
    >
      {deck.sourceType === 'pdf' ? (
        <FileText className="w-8 h-8 mb-2 opacity-90" />
      ) : (
        <Globe className="w-8 h-8 mb-2 opacity-90" />
      )}
      <span className="text-xs font-semibold line-clamp-2 max-w-[85%]">
        {getLocalizedText(deck.title, language)}
      </span>
    </div>
  );
}

export function PowerPointApp() {
  const { t, language } = useTranslation();

  const activePresentationSlug = useWindowStore((s) => s.activePresentationSlug);
  const setActivePresentationSlug = useWindowStore((s) => s.setActivePresentationSlug);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);

  const isLocked = useLockStore((s) => s.isLocked);
  const isSleeping = useLockStore((s) => s.isSleeping);
  const isSpotlightOpen = useSpotlightStore((s) => s.isOpen);
  const isMissionControlOpen = useMissionControlStore((s) => s.isOpen);
  const isContextMenuOpen = useContextMenuStore((s) => s.isOpen);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartXRef = useRef<number | null>(null);
  const fsHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeDeck = useMemo(
    () =>
      activePresentationSlug
        ? PRESENTATIONS.find(
            (d) => d.slug === activePresentationSlug || d.id === activePresentationSlug
          ) || null
        : null,
    [activePresentationSlug]
  );

  // Reset slide index and fullscreen when switching decks
  useEffect(() => {
    setSlideIndex(0);
    setIsFullscreen(false);
  }, [activePresentationSlug]);

  const totalSlides = useMemo(() => {
    if (!activeDeck) return 0;
    if (activeDeck.sourceType === 'slides' || activeDeck.sourceType === 'images') {
      return activeDeck.slides.length;
    }
    return 0;
  }, [activeDeck]);

  const isSlideDeck = Boolean(
    activeDeck && (activeDeck.sourceType === 'slides' || activeDeck.sourceType === 'images')
  );

  const goToSlide = useCallback(
    (nextIdx: number) => {
      if (totalSlides <= 0) return;
      const clamped = Math.max(0, Math.min(totalSlides - 1, nextIdx));
      if (clamped !== slideIndex) {
        playClickSound();
        setSlideIndex(clamped);
      }
    },
    [totalSlides, slideIndex]
  );

  const goToNext = useCallback(() => {
    if (slideIndex < totalSlides - 1) {
      playClickSound();
      setSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1));
    }
  }, [slideIndex, totalSlides]);

  const goToPrev = useCallback(() => {
    if (slideIndex > 0) {
      playClickSound();
      setSlideIndex((prev) => Math.max(0, prev - 1));
    }
  }, [slideIndex]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const thumbEl = thumbnailRefs.current[slideIndex];
    if (thumbEl) {
      thumbEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [slideIndex, activeDeck]);

  // Register Fullscreen Escape closer with global Esc priority waterfall
  useEffect(() => {
    if (!isFullscreen) return;
    const closer = () => {
      setIsFullscreen(false);
    };
    useOverlayStore.getState().registerQuickLook(closer);
    return () => {
      useOverlayStore.getState().unregisterQuickLook(closer);
    };
  }, [isFullscreen]);

  // Fullscreen idle control bar auto-hide
  const resetFullscreenIdleTimer = useCallback(() => {
    setShowFullscreenControls(true);
    if (fsHideTimerRef.current) clearTimeout(fsHideTimerRef.current);
    fsHideTimerRef.current = setTimeout(() => {
      setShowFullscreenControls(false);
    }, 2200);
  }, []);

  useEffect(() => {
    if (!isFullscreen) {
      if (fsHideTimerRef.current) clearTimeout(fsHideTimerRef.current);
      setShowFullscreenControls(true);
      return;
    }
    resetFullscreenIdleTimer();
    return () => {
      if (fsHideTimerRef.current) clearTimeout(fsHideTimerRef.current);
    };
  }, [isFullscreen, resetFullscreenIdleTimer]);

  // Keyboard shortcuts when PowerPoint is active window & input is not focused
  useEffect(() => {
    if (!activeDeck) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeWindowId !== 'powerpoint') return;
      if (isLocked || isSleeping || isSpotlightOpen || isMissionControlOpen || isContextMenuOpen) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          Boolean(target.closest('[contenteditable="true"]')))
      ) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        playClickSound();
        setIsFullscreen((prev) => !prev);
        return;
      }

      if (!isSlideDeck) return;

      if (e.key === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeDeck,
    activeWindowId,
    isLocked,
    isSleeping,
    isSpotlightOpen,
    isMissionControlOpen,
    isContextMenuOpen,
    isSlideDeck,
    goToNext,
    goToPrev,
  ]);

  const categoryLabels: Record<PresentationCategory, string> = useMemo(
    () => ({
      campaign: t('pptCatCampaign'),
      brand: t('pptCatBrand'),
      audio: t('pptCatAudio'),
      creative: t('pptCatCreative'),
    }),
    [t]
  );

  const filteredDecks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PRESENTATIONS.filter((deck) => {
      if (filterTab === 'pinned' && !deck.pinned) return false;
      if (
        filterTab !== 'all' &&
        filterTab !== 'pinned' &&
        deck.category !== filterTab
      ) {
        return false;
      }
      if (!q) return true;
      const titleStr = `${getLocalizedText(deck.title, 'tr')} ${getLocalizedText(deck.title, 'en')}`.toLowerCase();
      const subStr = `${getLocalizedText(deck.subtitle, 'tr')} ${getLocalizedText(deck.subtitle, 'en')}`.toLowerCase();
      return titleStr.includes(q) || subStr.includes(q) || deck.category.includes(q);
    });
  }, [filterTab, searchQuery]);

  const currentNotes = useMemo(() => {
    if (!activeDeck) return '';
    if (activeDeck.sourceType === 'slides') {
      return getLocalizedText(activeDeck.slides[slideIndex]?.notes, language);
    }
    if (activeDeck.sourceType === 'images') {
      return getLocalizedText(activeDeck.slides[slideIndex]?.notes, language);
    }
    return '';
  }, [activeDeck, slideIndex, language]);

  const renderActiveSlideContent = () => {
    if (!activeDeck) return null;
    if (activeDeck.sourceType === 'slides') {
      const slide = activeDeck.slides[slideIndex] || activeDeck.slides[0];
      if (!slide) return null;
      return (
        <ScaledSlideFrame>
          <JsonSlideCanvas
            slide={slide}
            deck={activeDeck}
            slideIndex={slideIndex}
            totalSlides={activeDeck.slides.length}
            language={language}
          />
        </ScaledSlideFrame>
      );
    }
    if (activeDeck.sourceType === 'images') {
      const slide = activeDeck.slides[slideIndex] || activeDeck.slides[0];
      if (!slide) return null;
      return (
        <div className="w-full aspect-video overflow-hidden">
          <ImageSlideCanvas
            imageUrl={slide.imageUrl}
            title={getLocalizedText(slide.title, language)}
          />
        </div>
      );
    }
    return null;
  };

  const handleStageTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleStageTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || !isSlideDeck) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) goToNext();
      else goToPrev();
    }
  };

  const sidebarItems: { id: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: t('pptAllDecks'),
      icon: <Layers className="w-3.5 h-3.5" />,
      count: PRESENTATIONS.length,
    },
    {
      id: 'pinned',
      label: t('pptPinned'),
      icon: <Pin className="w-3.5 h-3.5" />,
      count: PRESENTATIONS.filter((d) => d.pinned).length,
    },
    {
      id: 'campaign',
      label: t('pptCatCampaign'),
      icon: <Megaphone className="w-3.5 h-3.5" />,
      count: PRESENTATIONS.filter((d) => d.category === 'campaign').length,
    },
    {
      id: 'brand',
      label: t('pptCatBrand'),
      icon: <Sparkles className="w-3.5 h-3.5" />,
      count: PRESENTATIONS.filter((d) => d.category === 'brand').length,
    },
    {
      id: 'audio',
      label: t('pptCatAudio'),
      icon: <Music2 className="w-3.5 h-3.5" />,
      count: PRESENTATIONS.filter((d) => d.category === 'audio').length,
    },
    {
      id: 'creative',
      label: t('pptCatCreative'),
      icon: <Palette className="w-3.5 h-3.5" />,
      count: PRESENTATIONS.filter((d) => d.category === 'creative').length,
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {!activeDeck ? (
          /* ================= VIEW A: PRESENTATION GALLERY ================= */
          <motion.div
            key="ppt-gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="flex flex-col md:flex-row h-full w-full overflow-hidden"
          >
            {/* Left Sidebar (Desktop >=768px) */}
            <aside className="hidden md:flex w-52 shrink-0 flex-col justify-between bg-neutral-100/75 dark:bg-neutral-950/50 border-r border-black/5 dark:border-white/5 backdrop-blur-md p-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-2.5 py-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FF7D54] to-[#B83114] text-white flex items-center justify-center shadow-xs">
                    <Presentation className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                    PowerPoint
                  </span>
                </div>

                {sidebarItems.map((item) => {
                  const isActive = filterTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setFilterTab(item.id);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#D24726] text-white shadow-xs'
                          : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'text-slate-400 dark:text-neutral-500'
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 px-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                <span>{t('pptTotalDecks')}</span>
                <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-neutral-200">
                  {PRESENTATIONS.length}
                </span>
              </div>
            </aside>

            {/* Mobile Filter Strip (<768px) */}
            <div className="flex md:hidden items-center gap-1.5 px-3 py-2 bg-neutral-100/80 dark:bg-neutral-950/60 border-b border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar shrink-0">
              {sidebarItems.map((item) => {
                const isActive = filterTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setFilterTab(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#D24726] text-white'
                        : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-neutral-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Gallery Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Search & Info Header */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {sidebarItems.find((i) => i.id === filterTab)?.label}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {t('pptGallerySubtitle')}
                  </p>
                </div>

                <div className="relative flex items-center w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('pptSearchPlaceholder')}
                    className="w-full h-8 pl-8 pr-7 text-base sm:text-xs rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D24726]/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Deck Cards Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {filteredDecks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-neutral-500">
                    <Presentation className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-xs font-medium">
                      {searchQuery ? t('pptNoResults') : t('pptNoDecksInCategory')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredDecks.map((deck) => {
                      const title = getLocalizedText(deck.title, language);
                      const subtitle = getLocalizedText(deck.subtitle, language);
                      const badgeText =
                        deck.sourceType === 'slides' || deck.sourceType === 'images'
                          ? t('pptSlidesCount', { count: deck.slides.length })
                          : deck.sourceType === 'pdf'
                          ? 'PDF'
                          : 'Embed';

                      return (
                        <button
                          key={deck.id}
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setActivePresentationSlug(deck.slug);
                          }}
                          className="group text-left rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-800/50 hover:border-[#D24726]/60 dark:hover:border-[#FF7D54]/60 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D24726]"
                        >
                          {/* 16:9 Cover Preview */}
                          <div className="relative w-full aspect-video overflow-hidden bg-neutral-900">
                            <DeckCoverPreview deck={deck} language={language} />

                            {/* Top-left Pinned indicator */}
                            {deck.pinned && (
                              <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/55 backdrop-blur-md border border-white/15 flex items-center justify-center text-amber-300 shadow-sm">
                                <Pin className="w-3 h-3" />
                              </span>
                            )}

                            {/* Top-right Slide Count Badge */}
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white tabular-nums shadow-sm">
                              {badgeText}
                            </span>

                            {/* Hover Glass CTA Pill */}
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <span className="px-3.5 py-1.5 rounded-full bg-[#D24726]/95 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 border border-white/25 backdrop-blur-md transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
                                <Play className="w-3 h-3 fill-current" />
                                <span>{t('pptOpenDeck')}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                            <div>
                              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#D24726] dark:group-hover:text-[#FF8A65] transition-colors">
                                {title}
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                                {subtitle}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
                              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-600 dark:text-neutral-300 font-medium">
                                {categoryLabels[deck.category]}
                              </span>
                              <span className="font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
                                {deck.date}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= VIEW B: WORKSPACE & SLIDESHOW ================= */
          <motion.div
            key={`ppt-deck-${activeDeck.slug}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col h-full w-full overflow-hidden"
          >
            {/* Top Workspace Toolbar */}
            <div className="h-11 px-3 sm:px-4 border-b border-black/5 dark:border-white/10 bg-neutral-100/75 dark:bg-neutral-950/60 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
              {/* Left: Back to Gallery + Title */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActivePresentationSlug(null);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('pptBackToGallery')}</span>
                </button>
                <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {getLocalizedText(activeDeck.title, language)}
                </span>
              </div>

              {/* Center: Slide Navigation (Desktop) */}
              {isSlideDeck && (
                <div className="hidden md:flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-black/5 dark:border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={goToPrev}
                    disabled={slideIndex <= 0}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
                    title={t('pptPrevSlide')}
                    aria-label={t('pptPrevSlide')}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono tabular-nums px-1.5 text-slate-700 dark:text-neutral-200">
                    {slideIndex + 1} / {totalSlides}
                  </span>
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={slideIndex >= totalSlides - 1}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
                    title={t('pptNextSlide')}
                    aria-label={t('pptNextSlide')}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Right: Notes, Copy Link, Download, Start Show */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isSlideDeck && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setShowNotes((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      showNotes
                        ? 'bg-[#D24726]/15 text-[#D24726] dark:text-[#FF8A65] border border-[#D24726]/30'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    title={t('pptNotes')}
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{t('pptNotes')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    copyPortfolioDeepLink('powerpoint', undefined, activeDeck.slug);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title={t('pptCopyLink')}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t('pptCopyLink')}</span>
                </button>

                {activeDeck.downloadUrl && (
                  <a
                    href={activeDeck.downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title={t('pptDownload')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{t('pptDownload')}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsFullscreen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#D24726] hover:bg-[#B8381A] text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                  title={t('pptStartShow')}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">{t('pptStartShow')}</span>
                </button>
              </div>
            </div>

            {/* Workspace Split Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Thumbnail Rail (Desktop >=768px, slides/images only) */}
              {isSlideDeck && (
                <aside className="hidden md:flex w-44 lg:w-48 shrink-0 flex-col gap-2.5 p-3 bg-neutral-100/60 dark:bg-neutral-950/50 border-r border-black/5 dark:border-white/5 overflow-y-auto">
                  {activeDeck.sourceType === 'slides' &&
                    activeDeck.slides.map((slide, idx) => {
                      const isActive = idx === slideIndex;
                      return (
                        <button
                          key={idx}
                          ref={(el) => {
                            thumbnailRefs.current[idx] = el;
                          }}
                          type="button"
                          onClick={() => goToSlide(idx)}
                          className="group flex items-start gap-2 text-left cursor-pointer focus:outline-none"
                        >
                          <span
                            className={`text-[10px] font-mono tabular-nums w-4 pt-1 text-right shrink-0 ${
                              isActive
                                ? 'text-[#D24726] dark:text-[#FF8A65] font-bold'
                                : 'text-slate-400 dark:text-neutral-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div
                            className={`flex-1 rounded-lg overflow-hidden border transition-all ${
                              isActive
                                ? 'border-[#D24726] ring-2 ring-[#D24726]/70 shadow-md scale-[1.01]'
                                : 'border-black/10 dark:border-white/10 opacity-80 group-hover:opacity-100'
                            }`}
                          >
                            <ScaledSlideFrame>
                              <JsonSlideCanvas
                                slide={slide}
                                deck={activeDeck}
                                slideIndex={idx}
                                totalSlides={activeDeck.slides.length}
                                language={language}
                              />
                            </ScaledSlideFrame>
                          </div>
                        </button>
                      );
                    })}

                  {activeDeck.sourceType === 'images' &&
                    activeDeck.slides.map((slide, idx) => {
                      const isActive = idx === slideIndex;
                      return (
                        <button
                          key={idx}
                          ref={(el) => {
                            thumbnailRefs.current[idx] = el;
                          }}
                          type="button"
                          onClick={() => goToSlide(idx)}
                          className="group flex items-start gap-2 text-left cursor-pointer focus:outline-none"
                        >
                          <span
                            className={`text-[10px] font-mono tabular-nums w-4 pt-1 text-right shrink-0 ${
                              isActive
                                ? 'text-[#D24726] dark:text-[#FF8A65] font-bold'
                                : 'text-slate-400 dark:text-neutral-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div
                            className={`flex-1 aspect-video rounded-lg overflow-hidden border transition-all ${
                              isActive
                                ? 'border-[#D24726] ring-2 ring-[#D24726]/70 shadow-md scale-[1.01]'
                                : 'border-black/10 dark:border-white/10 opacity-80 group-hover:opacity-100'
                            }`}
                          >
                            <ImageSlideCanvas
                              imageUrl={slide.imageUrl}
                              title={getLocalizedText(slide.title, language)}
                            />
                          </div>
                        </button>
                      );
                    })}
                </aside>
              )}

              {/* Main Stage Column */}
              <div className="flex-1 flex flex-col overflow-hidden bg-neutral-200/60 dark:bg-[#121216]">
                {activeDeck.sourceType === 'slides' || activeDeck.sourceType === 'images' ? (
                  <>
                    {/* Centered 16:9 Stage */}
                    <div
                      className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden relative"
                      onTouchStart={handleStageTouchStart}
                      onTouchEnd={handleStageTouchEnd}
                    >
                      <div className="w-full max-w-[920px] flex items-center justify-center max-h-full">
                        <div className="w-full aspect-video max-h-full rounded-xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 relative bg-neutral-950">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${activeDeck.slug}-${slideIndex}`}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.16, ease: 'easeOut' }}
                              className="w-full h-full"
                            >
                              {renderActiveSlideContent()}
                            </motion.div>
                          </AnimatePresence>

                          {/* Click Left / Right Stage Zones */}
                          <button
                            type="button"
                            onClick={goToPrev}
                            disabled={slideIndex <= 0}
                            aria-label={t('pptPrevSlide')}
                            className="hidden sm:block absolute inset-y-0 left-0 w-[28%] cursor-w-resize disabled:cursor-default focus:outline-none z-20"
                          />
                          <button
                            type="button"
                            onClick={goToNext}
                            disabled={slideIndex >= totalSlides - 1}
                            aria-label={t('pptNextSlide')}
                            className="hidden sm:block absolute inset-y-0 right-0 w-[72%] cursor-e-resize disabled:cursor-default focus:outline-none z-20"
                          />

                          {/* Fullscreen Quick Corner Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setIsFullscreen(true);
                            }}
                            title={t('pptStartShow')}
                            aria-label={t('pptStartShow')}
                            className="hidden sm:flex absolute bottom-3 right-3 z-30 w-8 h-8 rounded-lg bg-black/55 hover:bg-[#D24726] text-white/85 hover:text-white items-center justify-center backdrop-blur-md border border-white/15 opacity-0 hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtle Desktop Keyboard Hint */}
                      <div className="hidden md:flex items-center gap-2 mt-3 text-[10px] font-mono text-slate-500 dark:text-neutral-500">
                        <span>{t('pptKeyboardHint')}</span>
                      </div>
                    </div>

                    {/* Mobile Bottom Slide Controls (<768px) */}
                    <div className="flex md:hidden items-center justify-between px-3 py-2 bg-white/80 dark:bg-neutral-900/90 border-t border-black/5 dark:border-white/10 shrink-0">
                      <button
                        type="button"
                        onClick={goToPrev}
                        disabled={slideIndex <= 0}
                        className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 cursor-pointer"
                        aria-label={t('pptPrevSlide')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] px-2 no-scrollbar">
                        {Array.from({ length: totalSlides }).map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => goToSlide(idx)}
                            aria-label={`Slide ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                              idx === slideIndex
                                ? 'w-5 bg-[#D24726]'
                                : 'w-1.5 bg-slate-300 dark:bg-neutral-600'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={goToNext}
                        disabled={slideIndex >= totalSlides - 1}
                        className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 cursor-pointer"
                        aria-label={t('pptNextSlide')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Collapsible Speaker Notes Drawer */}
                    <AnimatePresence>
                      {showNotes && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-neutral-900/95 backdrop-blur-md overflow-hidden shrink-0"
                        >
                          <div className="p-3.5 max-h-32 overflow-y-auto">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D24726] dark:text-[#FF8A65]">
                                {t('pptSpeakerNotesTitle')} • #{slideIndex + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowNotes(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                                aria-label="Close notes"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-neutral-300">
                              {currentNotes || t('pptNoNotes')}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* PDF / Embed Mode */
                  <div className="flex-1 flex flex-col p-3 sm:p-4 gap-2 overflow-hidden">
                    <div className="flex-1 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950 shadow-xl">
                      <iframe
                        src={activeDeck.embedUrl}
                        title={getLocalizedText(activeDeck.title, language)}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-neutral-400 shrink-0">
                      <span className="truncate">{t('pptEmbedFallback')}</span>
                      <a
                        href={activeDeck.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#D24726] dark:text-[#FF8A65] font-medium hover:underline shrink-0 ml-2"
                      >
                        <span>{t('pptOpenExternal')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FULLSCREEN PRESENTATION OVERLAY ================= */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isFullscreen && activeDeck && (
              <motion.div
                key="ppt-fullscreen-overlay"
                data-modal="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onMouseMove={resetFullscreenIdleTimer}
                onTouchStart={resetFullscreenIdleTimer}
                style={{ zIndex: Z_INDEX.PRESENTATION_FULLSCREEN }}
                className={`fixed inset-0 bg-[#050507] flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden ${
                  showFullscreenControls ? 'cursor-default' : 'cursor-none'
                }`}
              >
                {activeDeck.sourceType === 'slides' || activeDeck.sourceType === 'images' ? (
                  <div
                    className="w-full max-w-[1440px] max-h-full aspect-video rounded-xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] relative"
                    onTouchStart={handleStageTouchStart}
                    onTouchEnd={handleStageTouchEnd}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`fs-${activeDeck.slug}-${slideIndex}`}
                        initial={{ opacity: 0, scale: 0.992 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.005 }}
                        transition={{ duration: 0.18 }}
                        className="w-full h-full"
                      >
                        {renderActiveSlideContent()}
                      </motion.div>
                    </AnimatePresence>

                    {/* Click zones inside fullscreen slide */}
                    <button
                      type="button"
                      onClick={goToPrev}
                      disabled={slideIndex <= 0}
                      aria-label={t('pptPrevSlide')}
                      className="absolute inset-y-0 left-0 w-[28%] cursor-w-resize disabled:cursor-default focus:outline-none z-20"
                    />
                    <button
                      type="button"
                      onClick={goToNext}
                      disabled={slideIndex >= totalSlides - 1}
                      aria-label={t('pptNextSlide')}
                      className="absolute inset-y-0 right-0 w-[72%] cursor-e-resize disabled:cursor-default focus:outline-none z-20"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl overflow-hidden border border-white/15 bg-black">
                    <iframe
                      src={activeDeck.embedUrl}
                      title={getLocalizedText(activeDeck.title, language)}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Auto-hiding Floating Liquid Glass Bottom Control Pill */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: showFullscreenControls ? 1 : 0,
                    y: showFullscreenControls ? 0 : 14,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`fixed bottom-6 left-1/2 -translate-x-1/2 liquid-glass px-3 py-1.5 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 text-white ${
                    showFullscreenControls ? 'pointer-events-auto' : 'pointer-events-none'
                  }`}
                >
                  {isSlideDeck && (
                    <>
                      <button
                        type="button"
                        onClick={goToPrev}
                        disabled={slideIndex <= 0}
                        className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
                        aria-label={t('pptPrevSlide')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono tabular-nums px-2 text-white/90">
                        {slideIndex + 1} / {totalSlides}
                      </span>
                      <button
                        type="button"
                        onClick={goToNext}
                        disabled={slideIndex >= totalSlides - 1}
                        className="p-1.5 rounded-full hover:bg-white/15 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
                        aria-label={t('pptNextSlide')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/20 mx-0.5" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsFullscreen(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 hover:bg-[#D24726] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>{t('pptExitFullscreen')}</span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
