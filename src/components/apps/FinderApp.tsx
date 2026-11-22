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
} from 'lucide-react';
import { TrafficLights } from '@/components/window/TrafficLights';
import { WindowContext } from '@/components/window/Window';
import { useWindowStore } from '@/stores/useWindowStore';

type SidebarSection =
  | 'recents'
  | 'downloads'
  | 'desktop'
  | 'documents'
  | 'music'
  | 'applications'
  | 'trash';

type ViewMode = 'grid' | 'list' | 'columns';

interface FinderFileItem {
  id: string;
  name: string;
  dateModified: string;
  size: string;
  kind: string;
  isMarkdown?: boolean;
  content?: string;
}

// Exact files from the user's screenshot
const DOCUMENTS_FILES: FinderFileItem[] = [
  {
    id: 'f1',
    name: 'for_ai.md',
    dateModified: 'Feb 28, 2026, 2:05 PM',
    size: '49 KB',
    kind: 'Markdown document',
    isMarkdown: true,
    content: `# for_ai.md\n\nCreative Producer: Hüseyin Korumtaş\nMotto: "Ideas into experiences."\n\nPrompt instructions, multidisciplinary creative production blueprints, and sound design layers.`,
  },
  {
    id: 'f2',
    name: 'Giants.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '514.8 KB',
    kind: 'PDF document',
    content: `GIANTS — Production Blueprint & Creative Direction Deck.\nExperience architecture, visual rhythm, and sound design layers.`,
  },
  {
    id: 'f3',
    name: 'Gronlandic Edit.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '66.6 KB',
    kind: 'PDF document',
    content: `Gronlandic Edit — Audio Arrangement & Production Notes.\nKey: F Major | Tempo: 122 BPM | Spatial stems configuration.`,
  },
  {
    id: 'f4',
    name: 'Juice.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '393.2 KB',
    kind: 'PDF document',
    content: `Juice — Visual Production Treatment.\nCinematography, color grading, tactile sound synthesis.`,
  },
  {
    id: 'f5',
    name: 'Love on Top.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '449.7 KB',
    kind: 'PDF document',
    content: `Love on Top — Creative Arrangement & Harmony Blueprint.`,
  },
  {
    id: 'f6',
    name: 'My Heart With You.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '156.2 KB',
    kind: 'PDF document',
    content: `My Heart With You — Ambient Soundscape & Orchestration Notes.`,
  },
  {
    id: 'f7',
    name: 'Quiet.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '696.9 KB',
    kind: 'PDF document',
    content: `Quiet — Sound Design & Minimalist Architecture Blueprint.\nSonic silence, reverberant halls, tactile acoustic properties.`,
  },
  {
    id: 'f8',
    name: 'Rhythm Inside x Mud Blood.pdf',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '871.5 KB',
    kind: 'PDF document',
    content: `Rhythm Inside x Mud Blood — Hybrid Production Master.\nMultidisciplinary audio-visual performance and staging notes.`,
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

const MUSIC_FILES: FinderFileItem[] = [
  {
    id: 'm1',
    name: 'Rhythm Inside x Mud Blood.wav',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '42.1 MB',
    kind: 'WAV audio',
  },
  {
    id: 'm2',
    name: 'Quiet_Ambient_Session.wav',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '34.8 MB',
    kind: 'WAV audio',
  },
  {
    id: 'm3',
    name: 'Juice_Master_Mix.wav',
    dateModified: 'Oct 28, 2026, 9:53 AM',
    size: '28.3 MB',
    kind: 'WAV audio',
  },
];

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
                  return (
                    <tr
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      onDoubleClick={() => setPreviewFile(file)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-[#E8F0FE] dark:bg-[#007AFF]/25 text-[#0066CC] dark:text-[#38BDF8] rounded-md'
                          : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      <td className="py-1.5 pr-4 flex items-center gap-2.5">
                        <RedDocIcon />
                        <span className="font-normal text-xs text-slate-900 dark:text-neutral-100 truncate">
                          {file.name}
                        </span>
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
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    onDoubleClick={() => setPreviewFile(file)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8F0FE] dark:bg-[#007AFF]/20 border-[#007AFF]/40 ring-1 ring-[#007AFF]/30'
                        : 'border-transparent hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="w-12 h-14 mb-2 flex items-center justify-center">
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
                        <RedDocIcon />
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
                        <div className="w-16 h-20 text-[#EF4444] flex items-center justify-center">
                          <RedDocIcon />
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
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-10 px-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-neutral-100/70 dark:bg-neutral-800/70">
              <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                {previewFile.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 text-xs text-slate-700 dark:text-neutral-300 flex flex-col gap-4 max-h-96 overflow-y-auto">
              <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                <RedDocIcon />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {previewFile.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {previewFile.kind} • {previewFile.size} • {previewFile.dateModified}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {previewFile.content ||
                  `Document details and production blueprint for ${previewFile.name}. Prepared by Hüseyin Korumtaş.`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
