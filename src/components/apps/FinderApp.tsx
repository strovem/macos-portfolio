'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderGit2,
  Grid,
  List as ListIcon,
  Search,
  X,
  ExternalLink,
  Github,
  Info,
  Sparkles,
  Smartphone,
  Cpu,
  FlaskConical,
  Share2,
  Monitor,
  Star,
  ChevronRight,
  HardDrive,
  Globe,
} from 'lucide-react';
import { PROJECTS } from '@/data/projects';
import { ProjectItem } from '@/types/os';
import { useWindowStore } from '@/stores/useWindowStore';

type CategoryFilter = 'all' | 'web' | 'mobile-ai' | 'experiments' | 'opensource' | 'featured';
type ViewMode = 'grid' | 'list';

export const FinderApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(PROJECTS[0]?.id || null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const openWindow = useWindowStore((state) => state.openWindow);

  // Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((proj) => {
      // Category match
      let matchesCat = true;
      if (selectedCategory === 'featured') {
        matchesCat = !!proj.featured;
      } else if (selectedCategory === 'web') {
        matchesCat = proj.category === 'web';
      } else if (selectedCategory === 'mobile-ai') {
        matchesCat = proj.category === 'mobile' || proj.category === 'ai';
      } else if (selectedCategory === 'experiments') {
        matchesCat = proj.category === 'experiments';
      } else if (selectedCategory === 'opensource') {
        matchesCat = proj.category === 'opensource';
      }

      // Search match
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          proj.title.toLowerCase().includes(query) ||
          proj.description.toLowerCase().includes(query) ||
          proj.tags.some((t) => t.toLowerCase().includes(query));
      }

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const selectedProject = useMemo(() => {
    return PROJECTS.find((p) => p.id === selectedProjectId) || filteredProjects[0] || null;
  }, [selectedProjectId, filteredProjects]);

  // Handle opening live demo
  const handleLaunchDemo = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper for category counts
  const categoryCounts = useMemo(() => {
    return {
      all: PROJECTS.length,
      web: PROJECTS.filter((p) => p.category === 'web').length,
      'mobile-ai': PROJECTS.filter((p) => p.category === 'mobile' || p.category === 'ai').length,
      experiments: PROJECTS.filter((p) => p.category === 'experiments').length,
      opensource: PROJECTS.filter((p) => p.category === 'opensource').length,
      featured: PROJECTS.filter((p) => p.featured).length,
    };
  }, []);

  return (
    <div className="flex h-full w-full bg-white/95 dark:bg-neutral-900/95 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. macOS Finder Left Sidebar */}
      <aside className="w-52 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 p-3 flex flex-col justify-between backdrop-blur-md">
        <div className="flex flex-col gap-4">
          {/* Favorites Category */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-2">
              Portfolio
            </span>
            <div className="mt-1.5 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5" />
                  <span>All Projects</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                  {categoryCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('featured')}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === 'featured'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Featured</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'featured' ? 'bg-white/20 text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                  {categoryCounts.featured}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('web')}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === 'web'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Web Applications</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'web' ? 'bg-white/20 text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                  {categoryCounts.web}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('mobile-ai')}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === 'mobile-ai'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile & AI</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'mobile-ai' ? 'bg-white/20 text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                  {categoryCounts['mobile-ai']}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('experiments')}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === 'experiments'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Experiments</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'experiments' ? 'bg-white/20 text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                  {categoryCounts.experiments}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('opensource')}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === 'opensource'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open Source</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'opensource' ? 'bg-white/20 text-white' : 'text-slate-400 dark:text-neutral-500'}`}>
                  {categoryCounts.opensource}
                </span>
              </button>
            </div>
          </div>

          {/* Quick System Navigation */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-2">
              Locations
            </span>
            <div className="mt-1.5 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => openWindow('safari')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                <span>Web Browser ↗</span>
              </button>
              <button
                type="button"
                onClick={() => openWindow('terminal')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>CLI Terminal ↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disk Info Footer */}
        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-neutral-500 px-1">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Macintosh HD • 1.4 TB free</span>
        </div>
      </aside>

      {/* 2. Main Work Area (Toolbar + Grid/List Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Toolbar */}
        <div className="h-11 border-b border-black/5 dark:border-white/5 px-4 flex items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-900/60 backdrop-blur-md shrink-0">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-neutral-300">
            <span>Portfolio</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="capitalize text-slate-900 dark:text-white">
              {selectedCategory === 'all'
                ? 'All Projects'
                : selectedCategory === 'mobile-ai'
                ? 'Mobile & AI'
                : selectedCategory === 'opensource'
                ? 'Open Source'
                : selectedCategory}
            </span>
            <span className="text-[11px] font-normal text-slate-400 dark:text-neutral-500">
              ({filteredProjects.length} items)
            </span>
          </div>

          {/* Controls: Search, View Mode, Inspector Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tags..."
                className="w-44 focus:w-56 transition-all duration-200 h-7 pl-8 pr-7 text-xs rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007AFF]/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-slate-600 dark:text-neutral-400">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inspector Toggle */}
            <button
              type="button"
              onClick={() => setIsInspectorOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors border ${
                isInspectorOpen
                  ? 'bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/30'
                  : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-neutral-400 border-transparent hover:bg-black/10'
              }`}
              title="Toggle Project Inspector"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Area: Grid or List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredProjects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 text-slate-400">
                <Folder className="w-8 h-8 stroke-1 opacity-60" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-200">Projects Coming Soon</p>
              <p className="text-xs text-slate-400 dark:text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
                Hüseyin is currently curating select creative productions and project highlights. Check back soon or reach out directly via Messages.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProjects.map((project) => {
                const isSelected = selectedProjectId === project.id;
                return (
                  <motion.div
                    key={project.id}
                    layout
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      if (!isInspectorOpen) setIsInspectorOpen(true);
                    }}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#007AFF]/10 border-[#007AFF]/40 shadow-sm ring-1 ring-[#007AFF]/30'
                        : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-neutral-800/80 hover:shadow-md hover:border-black/10 dark:hover:border-white/15'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Icon + Featured Badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: project.color || '#007AFF' }}
                        >
                          {project.category === 'web' && <Monitor className="w-4 h-4" />}
                          {project.category === 'mobile' && <Smartphone className="w-4 h-4" />}
                          {project.category === 'ai' && <Cpu className="w-4 h-4" />}
                          {project.category === 'experiments' && <FlaskConical className="w-4 h-4" />}
                          {project.category === 'opensource' && <Share2 className="w-4 h-4" />}
                        </div>

                        {project.featured && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Tags & Action links */}
                    <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-600 dark:text-neutral-400 truncate max-w-[80px]"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{project.tags.length - 2}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {project.githubUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchDemo(project.githubUrl);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                            title="GitHub Repository"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {project.demoUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchDemo(project.demoUrl);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-[#007AFF] hover:bg-[#007AFF]/10"
                            title="Launch Live Demo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="border border-black/5 dark:border-white/5 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-black/5 dark:border-white/5 text-[10px] font-semibold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Stack Tags</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedProjectId === project.id;
                    return (
                      <tr
                        key={project.id}
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          if (!isInspectorOpen) setIsInspectorOpen(true);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#007AFF]/15 text-[#007AFF] font-medium'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-slate-700 dark:text-neutral-200'
                        }`}
                      >
                        <td className="py-2.5 px-3 flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: project.color || '#007AFF' }}
                          />
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {project.title}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] tracking-wide text-slate-500 dark:text-neutral-400">
                          {project.category}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            {project.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-600 dark:text-neutral-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 dark:text-neutral-500 text-[11px]">
                          {project.date || '2025'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {project.githubUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLaunchDemo(project.githubUrl);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {project.demoUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLaunchDemo(project.demoUrl);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-[#007AFF]"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. Project Inspector (macOS Quick Look Drawer on the Right) */}
      <AnimatePresence>
        {isInspectorOpen && selectedProject && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="shrink-0 border-l border-black/5 dark:border-white/5 bg-neutral-50/80 dark:bg-neutral-950/60 backdrop-blur-md flex flex-col h-full overflow-hidden"
          >
            {/* Inspector Header */}
            <div className="h-11 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Project Inspector
              </span>
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inspector Details */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs custom-scrollbar">
              {/* Project Hero Banner / Icon */}
              <div
                className="w-full h-24 rounded-xl flex flex-col items-center justify-center text-white relative shadow-inner overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedProject.color || '#007AFF'}, #1e293b)`,
                }}
              >
                <div className="text-2xl font-bold tracking-tight mb-1">{selectedProject.title.slice(0, 2).toUpperCase()}</div>
                <span className="text-[10px] uppercase font-semibold tracking-wider opacity-85">
                  {selectedProject.category}
                </span>
              </div>

              {/* Title & Role */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedProject.title}
                </h2>
                <div className="text-[11px] text-[#007AFF] font-medium mt-0.5">
                  {selectedProject.role || 'Lead Engineer'} • {selectedProject.date}
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block mb-1">
                  Overview
                </span>
                <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Highlights */}
              {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block mb-1.5">
                    Architecture Highlights
                  </span>
                  <ul className="flex flex-col gap-1.5 text-[11px] text-slate-600 dark:text-neutral-300">
                    {selectedProject.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#007AFF] font-bold mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack Tags */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block mb-1.5">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-700 dark:text-neutral-300 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              {selectedProject.stats && (
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-around text-center">
                  {selectedProject.stats.stars && (
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        ★ {selectedProject.stats.stars}
                      </div>
                      <div className="text-[9px] text-slate-400">Stars</div>
                    </div>
                  )}
                  {selectedProject.stats.forks && (
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {selectedProject.stats.forks}
                      </div>
                      <div className="text-[9px] text-slate-400">Forks</div>
                    </div>
                  )}
                  {selectedProject.stats.users && (
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {selectedProject.stats.users}
                      </div>
                      <div className="text-[9px] text-slate-400">Active Users</div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                {selectedProject.demoUrl && (
                  <button
                    type="button"
                    onClick={() => handleLaunchDemo(selectedProject.demoUrl)}
                    className="w-full py-2 px-3 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <span>Launch Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {selectedProject.githubUrl && (
                  <button
                    type="button"
                    onClick={() => handleLaunchDemo(selectedProject.githubUrl)}
                    className="w-full py-2 px-3 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Source Code</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
