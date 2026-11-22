'use client';

import React, { useState, useMemo, useContext } from 'react';
import {
  Clock,
  Download,
  Monitor,
  FileText,
  Music2,
  Layers,
  Trash2,
  PanelLeft,
  LayoutGrid,
  List,
  Columns3,
  ArrowUpDown,
  Search,
  ChevronDown,
  X,
  ExternalLink,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Sparkles,
  Disc,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TrafficLights } from '@/components/window/TrafficLights';
import { WindowContext } from '@/components/window/Window';
import { useWindowStore } from '@/stores/useWindowStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { ORIGINAL_TRACKS, MusicTrack } from '@/data/music';

type SidebarSection =
  | 'recents'
  | 'downloads'
  | 'desktop'
  | 'documents'
  | 'music'
  | 'applications'
  | 'trash';

type ViewMode = 'grid' | 'list' | 'columns';

export interface FinderFileItem {
  id: string;
  name: string;
  dateModified: string;
  size: string;
  kind: string;
  isMarkdown?: boolean;
  content?: string;
  category?: string;
  tags?: string[];
  track?: MusicTrack;
}

// Exact files from the user's screenshot with rich blueprints
const DOCUMENTS_FILES: FinderFileItem[] = [
  {
    id: 'f1',
    name: 'for_ai.md',
    dateModified: 'Feb 28, 2026, 2:05 PM',
    size: '49 KB',
    kind: 'Markdown document',
    isMarkdown: true,
    category: 'Creative Production Master',
    tags: ['AI Prompts', 'Creative Direction', 'Sound Architecture'],
    content: `# for_ai.md — Creative Production Master

Creative Producer: Hüseyin Korumtaş
Motto: "Ideas into experiences."

## Core Philosophy
Multidisciplinary production that sits at the intersection of cinematic visuals, tactile sound design, and interactive physical & web spaces.

## Production Pipelines
1. Concept & Narrative Architecture: Grounding abstract creative ideas into cohesive sensory narratives.
2. Hybrid Sound & Music Synthesis: Real-time modular synth textures, binaural room models, and punchy rhythmic foundations.
3. Spatial & Interactive Direction: Translating sound and film into spatial web applications, responsive installations, and live exhibition staging.

## Contact & Collaboration
• Email: korumtashuseyin@gmail.com
• Locations: Istanbul & Global Remote
• Disciplines: Creative Production • Audio Direction • Spatial Media`,
  },
  {
    id: 'f2',
    name: 'Giants.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '514.8 KB',
    kind: 'PDF document',
    category: 'Film & Commercial Production',
    tags: ['Visual Rhythm', 'Cinematography', 'Spatial Soundscapes'],
    content: `GIANTS — Production Blueprint & Creative Direction Deck

Executive Producer & Creative Direction: Hüseyin Korumtaş
Duration: 02:45 | Format: 4K HDR Anamorphic | Audio: 5.1 Surround & Binaural

Production Summary:
A cinematic exploration of monumental architecture and human kinetic movement. Korumtaş oversaw end-to-end creative direction, orchestrating drone cinematography, motion control rigs, and an original low-end tactile soundscape.

Key Highlights:
• Large-scale lighting rigs synchronized with dynamic sub-bass pulses.
• Custom sound design capturing structural reverberations and atmospheric sub-frequencies.
• Post-production color grading tuned for deep shadow contrast and metallic tones.`,
  },
  {
    id: 'f3',
    name: 'Gronlandic Edit.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '66.6 KB',
    kind: 'PDF document',
    category: 'Audio Arrangement & Spatial Stems',
    tags: ['122 BPM', 'Stem Mixing', 'Spatial Staging'],
    content: `Gronlandic Edit — Audio Arrangement & Production Notes

Producer & Sound Designer: Hüseyin Korumtaş
Key: F Major | Tempo: 122 BPM | Stems: 24 Multi-track Channels

Arrangement Blueprint:
• Bassline: Juno-106 analog filter sweep with subtle sidechain compression.
• Percussion: Layered organic acoustic claps and 808 transient punch.
• Spatial Room: 3D binaural convolution reverb simulating a 12-meter high glass atrium.`,
  },
  {
    id: 'f4',
    name: 'Juice.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '393.2 KB',
    kind: 'PDF document',
    category: 'Brand & Visual Treatment',
    tags: ['Tactile Bass', '118 BPM', 'Modular Waves'],
    track: ORIGINAL_TRACKS[2],
    content: `Juice — Visual Production Treatment & Sound Staging

Creative Producer: Hüseyin Korumtaş
Format: Multi-channel Video & Spatial Sound | Tempo: 118 BPM

Visual Treatment:
High-energy pacing with rhythmic match cuts synced to tactile bass drops. Built around the tactile friction of materials, vibrant citrus color palettes, and punchy modular synth sequences.

Audio Synthesis Notes:
Synthesized using analog Moog oscillators with heavy saturation on the 2nd and 3rd harmonics for maximum speaker resonance.`,
  },
  {
    id: 'f5',
    name: 'Love on Top.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '449.7 KB',
    kind: 'PDF document',
    category: 'Harmonic Production',
    tags: ['Brass Stems', 'Choral Layers', 'Dynamic Staging'],
    content: `Love on Top — Creative Arrangement & Harmony Blueprint

Creative Direction & Staging: Hüseyin Korumtaş
Instrumentation: Live Horn Section, Gospel Choral Layers, Analog Synth Bass

Production Concept:
A modern neo-soul reimagining focused on brass dynamics, polyrhythmic percussion, and expansive vocal harmonizations. Produced for live stage performance and spatial surround streaming.`,
  },
  {
    id: 'f6',
    name: 'My Heart With You.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '156.2 KB',
    kind: 'PDF document',
    category: 'Ambient Soundscape & Neo-Classical',
    tags: ['92 BPM', 'String Ensembles', 'Emotional Storytelling'],
    track: ORIGINAL_TRACKS[3],
    content: `My Heart With You — Ambient Soundscape & Orchestration Notes

Composer & Producer: Hüseyin Korumtaş
Tempo: 92 BPM | Key: D Minor | Orchestration: Felt Piano & String Quintet

Blueprint Notes:
Intimate felt piano recorded with close binaural microphones, supported by gentle cello motifs and warm analog pad washes. Designed to evoke nostalgia, emotional warmth, and quiet contemplation.`,
  },
  {
    id: 'f7',
    name: 'Quiet.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '696.9 KB',
    kind: 'PDF document',
    category: 'Minimalist Architecture & Acoustic Space',
    tags: ['Sonic Silence', '78 BPM', 'Reverb Chambers'],
    track: ORIGINAL_TRACKS[1],
    content: `Quiet — Sound Design & Minimalist Architecture Blueprint

Creative Producer: Hüseyin Korumtaş
Atmospheric Installation & Exhibition Blueprint

Sonic Concept:
An investigation into intentional silence and micro-sound textures. Utilizing long decay plate reverbs, acoustic resonance in hollow spaces, and subtle sub-bass thrums below 40Hz.

Staging:
Monolithic black panels with directional ultrasonic sound emitters focused on individual listeners.`,
  },
  {
    id: 'f8',
    name: 'Rhythm Inside x Mud Blood.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '871.5 KB',
    kind: 'PDF document',
    category: 'Hybrid Production Master',
    tags: ['124 BPM', 'Analog Synths', 'Hybrid Live Performance'],
    track: ORIGINAL_TRACKS[0],
    content: `Rhythm Inside x Mud Blood — Hybrid Production Master

Master Production & Creative Direction: Hüseyin Korumtaş
Tempo: 124 BPM | Key: A Minor | Genres: Electronic / Cinematic / Industrial

Production Breakdown:
A powerful hybrid production merging tribal rhythm patterns with heavy industrial synthesizer basslines. Designed as the flagship sonic experience for Hüseyin Korumtaş's 2026 Creative Producer Showreel.

Staging & Visuals:
Dynamic strobe lighting array triggered via MIDI clock with real-time audio reactivity.`,
  },
];

const RECENTS_FILES: FinderFileItem[] = [
  DOCUMENTS_FILES[0],
  DOCUMENTS_FILES[1],
  DOCUMENTS_FILES[7],
];

const DOWNLOADS_FILES: FinderFileItem[] = [
  {
    id: 'd1',
    name: 'Creative_Production_Brief_2026.pdf',
    dateModified: 'Nov 12, 2026, 11:20 AM',
    size: '1.2 MB',
    kind: 'PDF document',
    content: `Creative Production Brief 2026 — Hüseyin Korumtaş.\nTurning ideas into experiences with high-fidelity multidisciplinary media.`,
  },
  {
    id: 'd2',
    name: 'Spatial_Audio_Stems_Pack.zip',
    dateModified: 'Nov 10, 2026, 4:15 PM',
    size: '48.4 MB',
    kind: 'ZIP archive',
    content: `Multi-channel binaural audio recordings, sub-bass synthesizers, and environmental ambiences.`,
  },
];

const DESKTOP_FILES: FinderFileItem[] = [
  {
    id: 'dt1',
    name: 'README.md',
    dateModified: 'Nov 22, 2026, 6:00 PM',
    size: '12 KB',
    kind: 'Markdown document',
    isMarkdown: true,
    content: `# Hüseyin Korumtaş — Creative Producer\n\nIdeas into experiences.`,
  },
  {
    id: 'dt2',
    name: 'Messages.app',
    dateModified: 'Nov 22, 2026, 1:00 PM',
    size: '4.8 MB',
    kind: 'Application',
  },
  {
    id: 'dt3',
    name: 'Sound Studio.app',
    dateModified: 'Nov 22, 2026, 1:00 PM',
    size: '8.2 MB',
    kind: 'Application',
  },
];

const MUSIC_FILES: FinderFileItem[] = ORIGINAL_TRACKS.map((t) => ({
  id: t.id,
  name: t.src ? t.src.replace('/music/', '') : `${t.title}.wav`,
  dateModified: 'Nov 22, 2026, 8:15 PM',
  size: t.durationSeconds > 200 ? '42.1 MB' : t.durationSeconds > 100 ? '6.6 MB' : '2.6 MB',
  kind: t.src?.endsWith('.mp3') ? 'MP3 audio' : 'WAV audio',
  category: t.genre,
  tags: [`${t.bpm} BPM`, t.genre, t.year],
  content: `${t.title} — Beste & Yapım: Hüseyin Korumtaş\nAlbüm: ${t.album} (${t.year}) | Tempo: ${t.bpm} BPM | Tür: ${t.genre}\n\n${t.description}`,
  track: t,
}));

const APPLICATIONS_FILES: FinderFileItem[] = [
  {
    id: 'app1',
    name: 'Safari.app',
    dateModified: 'Nov 22, 2026',
    size: '32 MB',
    kind: 'Application',
  },
  {
    id: 'app2',
    name: 'Messages.app',
    dateModified: 'Nov 22, 2026',
    size: '18 MB',
    kind: 'Application',
  },
  {
    id: 'app3',
    name: 'Notes.app',
    dateModified: 'Nov 22, 2026',
    size: '14 MB',
    kind: 'Application',
  },
  {
    id: 'app4',
    name: 'Terminal.app',
    dateModified: 'Nov 22, 2026',
    size: '8 MB',
    kind: 'Application',
  },
  {
    id: 'app5',
    name: 'Settings.app',
    dateModified: 'Nov 22, 2026',
    size: '12 MB',
    kind: 'Application',
  },
];

const TRASH_FILES: FinderFileItem[] = [
  {
    id: 't1',
    name: 'Old_Draft_Notes.txt',
    dateModified: 'Oct 15, 2026, 2:30 PM',
    size: '4 KB',
    kind: 'Plain text',
  },
];

// Red folded document icon matching the screenshot
const RedDocIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4 text-[#EF4444] shrink-0"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="14" y2="17" />
  </svg>
);

export const FinderApp: React.FC = () => {
  const windowContext = useContext(WindowContext);
  const openWindow = useWindowStore((state) => state.openWindow);

  const {
    currentTrack,
    isPlaying: isAudioPlaying,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
  } = useAudioStore();

  const [activeSection, setActiveSection] = useState<SidebarSection>('documents');
  const [selectedFileId, setSelectedFileId] = useState<string>('f1');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [previewFile, setPreviewFile] = useState<FinderFileItem | null>(null);

  // Retrieve files for the active section
  const sectionFiles = useMemo(() => {
    switch (activeSection) {
      case 'recents':
        return RECENTS_FILES;
      case 'downloads':
        return DOWNLOADS_FILES;
      case 'desktop':
        return DESKTOP_FILES;
      case 'documents':
        return DOCUMENTS_FILES;
      case 'music':
        return MUSIC_FILES;
      case 'applications':
        return APPLICATIONS_FILES;
      case 'trash':
        return TRASH_FILES;
      default:
        return DOCUMENTS_FILES;
    }
  }, [activeSection]);

  // Filter & sort files
  const displayedFiles = useMemo(() => {
    let result = sectionFiles;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.kind.toLowerCase().includes(q) ||
          f.size.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
  }, [sectionFiles, searchQuery, sortAsc]);

  // Capitalized section title
  const currentTitle = useMemo(() => {
    switch (activeSection) {
      case 'recents':
        return 'Recents';
      case 'downloads':
        return 'Downloads';
      case 'desktop':
        return 'Desktop';
      case 'documents':
        return 'Documents';
      case 'music':
        return 'Music';
      case 'applications':
        return 'Applications';
      case 'trash':
        return 'Trash';
    }
  }, [activeSection]);

  // Drag handler for window top bar
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, a, tr')) {
      return;
    }
    windowContext?.onFocus?.();
    windowContext?.dragControls?.start(e);
  };

  return (
    <div className="flex h-full w-full bg-[#FAFAFA] dark:bg-[#181818] text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Left Sidebar */}
      {isSidebarOpen && (
        <aside className="w-48 shrink-0 bg-[#F4F4F5]/80 dark:bg-[#202020]/80 border-r border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between backdrop-blur-xl">
          <div>
            {/* Top Bar of Sidebar: Traffic Lights & Sidebar Toggle */}
            <div
              onPointerDown={handleDragPointerDown}
              className="h-12 px-3.5 flex items-center justify-between cursor-default"
            >
              <TrafficLights
                onClose={windowContext?.onClose}
                onMinimize={windowContext?.onMinimize}
                onMaximize={windowContext?.onMaximize}
                isMaximized={windowContext?.isMaximized}
                isActive={windowContext?.isActive}
              />

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Hide Sidebar"
              >
                <PanelLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="px-2 py-1 flex flex-col gap-3">
              {/* Recents */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('recents');
                    setSelectedFileId('');
                  }}
                  className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs font-normal transition-colors ${
                    activeSection === 'recents'
                      ? 'bg-[#E4E4E7] dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recents</span>
                </button>
              </div>

              {/* Favorites */}
              <div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 px-2 mb-1">
                  Favorites
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('downloads');
                      setSelectedFileId('');
                    }}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
                      activeSection === 'downloads'
                        ? 'bg-[#E4E4E7] dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Downloads</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('desktop');
                      setSelectedFileId('');
                    }}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
                      activeSection === 'desktop'
                        ? 'bg-[#E4E4E7] dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span>Desktop</span>
                  </button>

                  {/* Documents (Exact match to active pill in screenshot) */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('documents');
                      setSelectedFileId('f1');
                    }}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
                      activeSection === 'documents'
                        ? 'bg-[#E2E8F0] dark:bg-[#007AFF]/20 text-[#0066CC] dark:text-[#38BDF8] font-medium'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <FileText
                      className={`w-3.5 h-3.5 ${
                        activeSection === 'documents'
                          ? 'text-[#0066CC] dark:text-[#38BDF8]'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>Documents</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('music');
                      setSelectedFileId('');
                    }}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
                      activeSection === 'music'
                        ? 'bg-[#E4E4E7] dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Music2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Music</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('applications');
                      setSelectedFileId('');
                    }}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
                      activeSection === 'applications'
                        ? 'bg-[#E4E4E7] dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Applications</span>
                  </button>
                </div>
              </div>

              {/* Locations */}
              <div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 px-2 mb-1">
                  Locations
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('trash');
                      setSelectedFileId('');
                    }}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors ${
                      activeSection === 'trash'
                        ? 'bg-[#E4E4E7] dark:bg-white/15 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Trash</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 text-[10px] text-slate-400 font-mono text-center opacity-70">
            Macintosh HD
          </div>
        </aside>
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-[#1E1E1E]">
        {/* Top Header / Toolbar */}
        <div
          onPointerDown={handleDragPointerDown}
          className="h-13 px-6 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-md shrink-0 cursor-default"
        >
          {/* Left: Folder Title & Optional Toggle if Sidebar is closed */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <div className="flex items-center gap-2 mr-2">
                <TrafficLights
                  onClose={windowContext?.onClose}
                  onMinimize={windowContext?.onMinimize}
                  onMaximize={windowContext?.onMaximize}
                  isMaximized={windowContext?.isMaximized}
                  isActive={windowContext?.isActive}
                />
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Show Sidebar"
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <h1 className="text-lg font-bold text-slate-850 dark:text-white tracking-tight">
              {currentTitle}
            </h1>
          </div>

          {/* Right Toolbar Controls: View Switcher, Sort, Search */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher Pill */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-black/[0.04] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Icons"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('columns')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'columns'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Columns"
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Pill */}
            <button
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-black/[0.04] dark:border-white/[0.06] text-slate-600 dark:text-neutral-300 text-xs font-medium hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors"
              title="Sort items"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-600 dark:text-neutral-300" />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {/* Search Button / Input */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-40 h-8 pl-8 pr-7 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-slate-800 dark:text-white border border-black/5 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center text-slate-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors"
                  title="Search files"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Table / Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          {/* Informative Music Studio Banner when in Music section */}
          {activeSection === 'music' && (
            <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-purple-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs">
              <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-sm mt-0.5 shrink-0">
                <Music2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Hüseyin Korumtaş — Orijinal Besteler & Ses Tasarımları</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono">
                    4 Parça
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                  Tüm besteler Web Audio osilatör mimarisi ile gerçek zamanlı sentezlenir. Dinlemek için satırdaki oynat butonuna basabilir veya çift tıklayarak stüdyo oynatıcısını açabilirsiniz.
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                  💡 Kendi <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">.mp3</code> veya <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">.wav</code> parçalarınızı projedeki <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">public/music/</code> klasörüne ekleyerek anında sitenizde dinletebilirsiniz.
                </p>
              </div>
            </div>
          )}

          {viewMode === 'list' ? (
            /* EXACT LIST VIEW FROM SCREENSHOT */
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[11px] font-normal text-slate-400 dark:text-neutral-500 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <th className="py-2 pr-4 font-normal">Name</th>
                  <th className="py-2 px-3 border-l border-neutral-200/70 dark:border-neutral-700/60 font-normal w-48">
                    Date Modified
                  </th>
                  <th className="py-2 px-3 border-l border-neutral-200/70 dark:border-neutral-700/60 font-normal w-28">
                    Size
                  </th>
                  <th className="py-2 pl-3 border-l border-neutral-200/70 dark:border-neutral-700/60 font-normal w-40">
                    Kind
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  const isThisTrackPlaying =
                    isAudioPlaying && file.track && currentTrack?.id === file.track.id;

                  return (
                    <tr
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      onDoubleClick={() => {
                        setPreviewFile(file);
                        if (file.track && !isThisTrackPlaying) {
                          playTrack(file.track);
                        }
                      }}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-[#E8F0FE] dark:bg-[#007AFF]/25 text-[#0066CC] dark:text-[#38BDF8] rounded-md'
                          : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      <td className="py-1.5 pr-4 flex items-center gap-2.5">
                        {file.track ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isThisTrackPlaying) {
                                togglePlay();
                              } else {
                                playTrack(file.track!);
                              }
                            }}
                            title={isThisTrackPlaying ? 'Pause' : 'Play Track'}
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                              isThisTrackPlaying
                                ? 'bg-[#007AFF] text-white shadow-xs'
                                : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-[#007AFF] hover:text-white'
                            }`}
                          >
                            {isThisTrackPlaying ? (
                              <Pause className="w-3 h-3 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            )}
                          </button>
                        ) : (
                          <RedDocIcon />
                        )}
                        <span className="font-normal text-xs text-slate-900 dark:text-neutral-100 truncate">
                          {file.name}
                        </span>

                        {isThisTrackPlaying && (
                          <div className="flex items-end gap-0.5 h-2.5 ml-1">
                            <span
                              className="w-0.5 h-2 bg-[#007AFF] rounded-full animate-bounce"
                              style={{ animationDuration: '0.6s' }}
                            />
                            <span
                              className="w-0.5 h-2.5 bg-[#007AFF] rounded-full animate-bounce"
                              style={{ animationDuration: '0.4s', animationDelay: '0.15s' }}
                            />
                            <span
                              className="w-0.5 h-1.5 bg-[#007AFF] rounded-full animate-bounce"
                              style={{ animationDuration: '0.7s', animationDelay: '0.3s' }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-[11px] text-slate-500 dark:text-neutral-400 font-normal">
                        {file.dateModified}
                      </td>
                      <td className="py-1.5 px-3 text-[11px] text-slate-500 dark:text-neutral-400 font-normal">
                        {file.size}
                      </td>
                      <td className="py-1.5 pl-3 text-[11px] text-slate-500 dark:text-neutral-400 font-normal">
                        {file.kind}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 py-4">
              {displayedFiles.map((file) => {
                const isSelected = selectedFileId === file.id;
                const isThisTrackPlaying =
                  isAudioPlaying && file.track && currentTrack?.id === file.track.id;

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    onDoubleClick={() => {
                      setPreviewFile(file);
                      if (file.track && !isThisTrackPlaying) {
                        playTrack(file.track);
                      }
                    }}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#E8F0FE] dark:bg-[#007AFF]/20 border-[#007AFF]/40 ring-1 ring-[#007AFF]/30'
                        : 'border-transparent hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="w-12 h-14 mb-2 flex items-center justify-center relative">
                      {file.track ? (
                        <div
                          className={`w-11 h-11 rounded-full bg-gradient-to-tr ${
                            file.track.coverGradient
                          } flex items-center justify-center text-white shadow-md ${
                            isThisTrackPlaying ? 'ring-2 ring-[#007AFF]' : ''
                          }`}
                        >
                          {isThisTrackPlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Music2 className="w-4 h-4" />
                          )}
                        </div>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-10 h-10 text-[#EF4444]"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="8" y1="13" x2="16" y2="13" />
                          <line x1="8" y1="17" x2="14" y2="17" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-slate-800 dark:text-white font-medium line-clamp-2 break-all">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{file.size}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COLUMNS VIEW */
            <div className="flex h-full border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <div className="w-64 border-r border-black/[0.06] dark:border-white/[0.06] overflow-y-auto p-2">
                {displayedFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-[#007AFF] text-white'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {file.track ? (
                          <Music2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : (
                          <RedDocIcon />
                        )}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{file.size}</span>
                    </button>
                  );
                })}
              </div>

              {/* Column Inspector Preview */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                {selectedFileId ? (
                  (() => {
                    const activeFile = displayedFiles.find((f) => f.id === selectedFileId);
                    if (!activeFile) return null;
                    return (
                      <div className="max-w-xs flex flex-col items-center gap-3">
                        <div className="w-16 h-20 flex items-center justify-center">
                          {activeFile.track ? (
                            <div
                              className={`w-14 h-14 rounded-full bg-gradient-to-tr ${activeFile.track.coverGradient} flex items-center justify-center text-white shadow-md`}
                            >
                              <Music2 className="w-6 h-6" />
                            </div>
                          ) : (
                            <RedDocIcon />
                          )}
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          {activeFile.name}
                        </h2>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>Kind: {activeFile.kind}</p>
                          <p>Size: {activeFile.size}</p>
                          <p>Modified: {activeFile.dateModified}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewFile(activeFile)}
                          className="mt-2 px-4 py-1.5 rounded-lg bg-[#007AFF] text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                          Quick Look
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400">Select an item to view preview</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-7 px-6 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 dark:text-neutral-500 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <span>{displayedFiles.length} items</span>
          <span>1.4 TB available</span>
        </div>
      </div>

      {/* Quick Look Preview Modal on Double-click */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar of Quick Look */}
            <div className="h-10 px-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-neutral-100/70 dark:bg-neutral-800/70">
              <div className="flex items-center gap-2 min-w-0">
                {previewFile.track && previewFile.kind.includes('audio') ? (
                  <Music2 className="w-3.5 h-3.5 text-indigo-500" />
                ) : (
                  <RedDocIcon />
                )}
                <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                  {previewFile.name} — Quick Look
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {previewFile.track && previewFile.kind.includes('audio') ? (
              /* INTERACTIVE MUSIC TRACK PLAYER VIEW */
              <div className="p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Rotating Vinyl Record Artwork */}
                  <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                    <motion.div
                      animate={
                        isAudioPlaying && currentTrack?.id === previewFile.track.id
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className={`w-32 h-32 rounded-full bg-gradient-to-tr ${previewFile.track.coverGradient} shadow-xl p-1.5 flex items-center justify-center`}
                    >
                      <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center bg-black/40">
                        <div className="w-11 h-11 rounded-full bg-neutral-900 border-2 border-white/40 flex items-center justify-center shadow-inner">
                          <Disc className="w-5 h-5 text-white/80" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Metadata and Controls */}
                  <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">
                        {previewFile.track.genre}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {previewFile.track.bpm} BPM
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {previewFile.track.year}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {previewFile.track.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {previewFile.track.artist} · <span className="italic">{previewFile.track.album}</span>
                    </p>

                    {/* Animated Equalizer Waveform */}
                    <div className="flex items-center gap-1 h-5 my-1.5">
                      {[4, 12, 18, 10, 22, 14, 8, 20, 16, 12, 6, 18, 14, 22, 10, 6].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-[#007AFF]"
                          animate={
                            isAudioPlaying && currentTrack?.id === previewFile.track!.id
                              ? { height: ['20%', `${Math.min(100, h * 5)}%`, '20%'] }
                              : { height: '25%' }
                          }
                          transition={{
                            duration: 0.35,
                            repeat:
                              isAudioPlaying && currentTrack?.id === previewFile.track!.id
                                ? Infinity
                                : 0,
                            delay: i * 0.04,
                          }}
                          style={{ minHeight: '3px' }}
                        />
                      ))}
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={prevTrack}
                        title="Previous Track"
                        className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                      >
                        <SkipBack className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isAudioPlaying && currentTrack?.id === previewFile.track!.id) {
                            togglePlay();
                          } else {
                            playTrack(previewFile.track!);
                          }
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        {isAudioPlaying && currentTrack?.id === previewFile.track.id ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-white" />
                            <span>Durdur</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            <span>Çal & Dinle</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={nextTrack}
                        title="Next Track"
                        className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
                      >
                        <SkipForward className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description & Production Notes */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Beste & Ses Tasarımı Notları
                  </h4>
                  <p>{previewFile.track.description}</p>
                </div>

                {/* Info Note on Adding Personal Songs */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300">
                  <span className="font-bold">📁 Kendi Şarkılarınızı Ekleyin: </span>
                  Kendi şarkılarınızı <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 font-mono">public/music/</code> klasörüne ekleyerek anında sitenizde dinletebilirsiniz. Dosya olmadığı durumlarda bile dahili Web Audio sentezleyicisi canlı çalar!
                </div>
              </div>
            ) : (
              /* CREATIVE PRODUCER BLUEPRINT VIEW */
              <div className="p-6 text-xs text-slate-700 dark:text-neutral-300 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <RedDocIcon />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                        {previewFile.category || 'Production Document'}
                      </span>
                      {previewFile.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[9px] text-slate-500 dark:text-neutral-400 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {previewFile.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {previewFile.kind} • {previewFile.size} • {previewFile.dateModified}
                    </p>
                  </div>
                </div>

                {/* Embedded audio player if document is linked to music */}
                {previewFile.track && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-500 text-white">
                        <Music2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {previewFile.track.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                          {previewFile.track.genre} • {previewFile.track.bpm} BPM
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAudioPlaying && currentTrack?.id === previewFile.track!.id) {
                          togglePlay();
                        } else {
                          playTrack(previewFile.track!);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#007AFF] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-blue-600 transition-colors"
                    >
                      {isAudioPlaying && currentTrack?.id === previewFile.track.id ? (
                        <>
                          <Pause className="w-3 h-3 fill-white" />
                          <span>Durdur</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white ml-0.5" />
                          <span>Stem Dinle</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                  {previewFile.content ||
                    `Document details and production blueprint for ${previewFile.name}. Prepared by Hüseyin Korumtaş.`}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
