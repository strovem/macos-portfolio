'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Check,
  Copy,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight,
  Code2,
  Terminal,
  Heart,
} from 'lucide-react';
import { SKILL_CATEGORIES } from '@/data/skills';
import { EXPERIENCE } from '@/data/experience';
import { useWindowStore } from '@/stores/useWindowStore';

interface NoteItem {
  id: string;
  title: string;
  category: string;
  date: string;
  snippet: string;
  icon: React.ReactNode;
}

const NOTES: NoteItem[] = [
  {
    id: 'bio',
    title: '👋 Introduction & Bio',
    category: 'Personal',
    date: 'Nov 22, 2026',
    snippet: 'Hüseyin Korumtaş — Creative Producer. Ideas into experiences...',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'skills',
    title: '🛠 Creative Production & Skills',
    category: 'Competencies',
    date: 'Nov 20, 2026',
    snippet: 'Creative Direction, Multidisciplinary Production, Sound & Digital Media...',
    icon: <Code2 className="w-4 h-4 text-blue-500" />,
  },
  {
    id: 'philosophy',
    title: '💡 Vision & Production Philosophy',
    category: 'Thinking',
    date: 'Nov 18, 2026',
    snippet: 'Ideas into experiences: bringing concepts into real, tangible life...',
    icon: <Heart className="w-4 h-4 text-rose-500" />,
  },
];

export const NotesApp: React.FC = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>('bio');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const openWindow = useWindowStore((state) => state.openWindow);

  const filteredNotes = NOTES.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNote = NOTES.find((n) => n.id === selectedNoteId) || NOTES[0];

  const handleCopyNote = () => {
    let textToCopy = `${selectedNote.title}\n\n`;
    if (selectedNote.id === 'bio') {
      textToCopy += `Hüseyin Korumtaş — Creative Producer\n"Ideas into experiences."\nEmail: korumtashuseyin@gmail.com\nLinkedIn: https://www.linkedin.com/in/h%C3%BCseyin-korumta%C5%9F-05379128a/\nInstagram: https://www.instagram.com/korumtashuseyin/`;
    } else if (selectedNote.id === 'skills') {
      textToCopy += SKILL_CATEGORIES.map(
        (c) => `${c.name}:\n` + c.skills.map((s) => `  - ${s.name} (${s.level}%)`).join('\n')
      ).join('\n\n');
    } else {
      textToCopy += `Ideas into experiences. Merging creative vision, multidisciplinary media, and flawless execution.`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 select-none overflow-hidden font-sans">
      {/* 1. Left Notes List Panel */}
      <div className="w-64 shrink-0 bg-neutral-100/70 dark:bg-neutral-950/40 border-r border-black/5 dark:border-white/5 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* Notes Search Header */}
          <div className="p-3 border-b border-black/5 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full h-7 pl-8 pr-3 text-xs rounded-lg bg-black/5 dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Notes List */}
          <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            {filteredNotes.map((note) => {
              const isSelected = selectedNote.id === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full p-2.5 rounded-lg text-left transition-colors flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-amber-500/20 dark:bg-amber-500/25 border border-amber-500/30'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {note.icon}
                      <span className="truncate">{note.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-neutral-400">
                    <span>{note.date}</span>
                    <span>•</span>
                    <span className="truncate">{note.snippet}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note Count */}
        <div className="p-3 border-t border-black/5 dark:border-white/5 text-[11px] text-center text-slate-400 dark:text-neutral-500">
          {NOTES.length} Notes • iCloud Synced
        </div>
      </div>

      {/* 2. Right Note Viewer & Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-amber-50/20 dark:bg-neutral-900">
        {/* Note Action Toolbar */}
        <div className="h-11 px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last edited {selectedNote.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyNote}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-700 dark:text-neutral-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Note</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Note Body Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {/* Note 1: Introduction & Bio */}
          {selectedNote.id === 'bio' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Creative Producer
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Hüseyin Korumtaş
                </h1>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-1 italic">
                  &ldquo;Ideas into experiences.&rdquo;
                </p>
              </div>

              {/* Bio Highlights Card */}
              <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 flex flex-col gap-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                  Quick Snapshot
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Role</span>
                    <strong className="text-slate-800 dark:text-white">Creative Producer</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Motto</span>
                    <strong className="text-slate-800 dark:text-white">Ideas into experiences</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <strong className="text-slate-800 dark:text-white truncate block">korumtashuseyin@gmail.com</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Specialty</span>
                    <strong className="text-slate-800 dark:text-white">Creative Direction & Audio</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status</span>
                    <strong className="text-emerald-500">Available for Collaborations</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Channels</span>
                    <strong className="text-amber-500">LinkedIn • Instagram</strong>
                  </div>
                </div>
              </div>

              {/* Detailed Narrative */}
              <div className="prose dark:prose-invert text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-neutral-300 flex flex-col gap-4">
                <p>
                  I am a Creative Producer dedicated to transforming visionary concepts into resonant, unforgettable experiences. Rather than settling for conventional formats, I bridge imaginative storytelling, multidisciplinary media, and spatial interaction into unified creative productions.
                </p>
                <p>
                  From sound design and audio engineering to interactive digital spaces, I lead productions from early conceptual ideation through every phase of execution. My core driver is simple: <em>&ldquo;Ideas into experiences.&rdquo;</em>
                </p>
                <p>
                  Whether crafting experiential brand identities, sonic environments, or immersive web installations, I combine artistic intuition with rigorous production craft to make ideas touchable and memorable.
                </p>
              </div>

              {/* Call to Actions & Direct Links */}
              <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openWindow('messages')}
                  className="px-4 py-2 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Direct Message</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="https://www.linkedin.com/in/h%C3%BCseyin-korumta%C5%9F-05379128a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs flex items-center gap-2 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/korumtashuseyin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs flex items-center gap-2 transition-colors"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Note 2: Skills Matrix */}
          {selectedNote.id === 'skills' && (
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  Technical Matrix
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Engineering & Design Stack
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Evaluated across production deployments, performance profiling, and open-source authorship.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {SKILL_CATEGORIES.map((category) => (
                  <div
                    key={category.name}
                    className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5"
                  >
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200 mb-3 flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {category.skills.length} Core Areas
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {skill.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#007AFF]">
                              {skill.level}%
                            </span>
                          </div>

                          {/* Level Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>

                          {skill.highlight && (
                            <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                              {skill.highlight}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note 3: Creative Production Philosophy */}
          {selectedNote.id === 'philosophy' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  Mindset & Vision
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Ideas into Experiences
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  The principles governing how I direct creative productions and bring ideas to life.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-rose-500 font-bold text-base">01. Emotion First</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Memories beat mechanics
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Great experiences are felt before they are understood. Whether through sonic texture, visual rhythm, or spatial design, evocative emotion is the true measure of creative work.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-blue-500 font-bold text-base">02. Ideas Into Experiences</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Execution is the bridge
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    An idea in a slide deck is just a wish. True production is the rigorous craft of pulling an abstract thought into the physical and digital world where people can touch and experience it.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-emerald-500 font-bold text-base">03. Sonic & Spatial Depth</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    The invisible layer
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Sound, timing, and tactile feedback transform ordinary media into unforgettable moments. We treat audio and spatial immersion as core storytelling tools, never afterthoughts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-amber-500 font-bold text-base">04. Joyful Craft</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Playfulness breeds originality
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    The most groundbreaking creative work stems from a spirit of play, relentless curiosity, and fearlessness in testing unconventional formats.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
