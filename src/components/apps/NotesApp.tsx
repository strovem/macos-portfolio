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
    snippet: 'Senior Software & Design Engineer crafting tactile web experiences...',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'skills',
    title: '🛠 Technical Skills Matrix',
    category: 'Engineering',
    date: 'Nov 20, 2026',
    snippet: 'Proficiencies across Frontend Engineering, Architecture, Motion & Cloud...',
    icon: <Code2 className="w-4 h-4 text-blue-500" />,
  },
  {
    id: 'experience',
    title: '💼 Work History & Leadership',
    category: 'Career',
    date: 'Nov 18, 2026',
    snippet: 'Track record leading frontend systems, collaborative canvases, and teams...',
    icon: <Briefcase className="w-4 h-4 text-emerald-500" />,
  },
  {
    id: 'education',
    title: '🎓 Education & Certifications',
    category: 'Credentials',
    date: 'Nov 15, 2026',
    snippet: 'UC Berkeley CS & HCI, Awwwards Site of the Day, Global Hackathon Winner...',
    icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
  },
  {
    id: 'philosophy',
    title: '🦆 Engineering Philosophy & Craft',
    category: 'Thinking',
    date: 'Nov 10, 2026',
    snippet: 'Tactile interaction, sub-pixel perfection, joyful software & zero bloat...',
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
      textToCopy += `Chris Gu — Lead Frontend & Design Engineer\nSan Francisco, CA\nSpecializing in high-performance web applications, spatial window systems, and tactile motion design.`;
    } else if (selectedNote.id === 'skills') {
      textToCopy += SKILL_CATEGORIES.map(
        (c) => `${c.name}:\n` + c.skills.map((s) => `  - ${s.name} (${s.level}%)`).join('\n')
      ).join('\n\n');
    } else if (selectedNote.id === 'experience') {
      textToCopy += EXPERIENCE.map((e) => `${e.role} at ${e.company} (${e.period})\n${e.description}`).join('\n\n');
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
                  Profile & Overview
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Chris Gu (GucDuck)
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>San Francisco, California • Open for High-Impact Roles</span>
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
                    <strong className="text-slate-800 dark:text-white">Lead Design Engineer</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Core Stack</span>
                    <strong className="text-slate-800 dark:text-white">React, Next.js, TS</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Experience</span>
                    <strong className="text-slate-800 dark:text-white">6+ Years Crafting UI</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Specialty</span>
                    <strong className="text-slate-800 dark:text-white">Spatial & Web OS</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status</span>
                    <strong className="text-emerald-500">Available Q1 2026</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Philosophy</span>
                    <strong className="text-amber-500">Tactile & Playful</strong>
                  </div>
                </div>
              </div>

              {/* Detailed Narrative */}
              <div className="prose dark:prose-invert text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-neutral-300 flex flex-col gap-4">
                <p>
                  I am a product-focused frontend engineer and design technologist dedicated to building web applications that feel alive. Rather than treating web software as static rectangular boxes, I approach interfaces as physical, reactive environments with mass, friction, spring dynamics, and spatial depth.
                </p>
                <p>
                  Over the past 6+ years, I’ve led development on multi-tenant infinite whiteboards, high-frequency biometric analytics engines, and enterprise design systems. I bridge the gap between design vision in Figma and rigorous engineering in TypeScript, ensuring sub-16ms frame budgets and zero accessibility regressions.
                </p>
                <p>
                  When I am not tuning spring damping curves or building custom WebGL shaders, you can find me trail running the high mountain passes around Mont Blanc or assembling tactile mechanical keyboards.
                </p>
              </div>

              {/* Call to Actions */}
              <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openWindow('messages')}
                  className="px-4 py-2 rounded-lg bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Chat in Messages</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openWindow('finder')}
                  className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs flex items-center gap-2 transition-colors"
                >
                  <span>Explore Projects in Finder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
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

          {/* Note 3: Work History & Leadership */}
          {selectedNote.id === 'experience' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  Career Milestones
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Work History & Impact
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  6+ years driving architectural quality and shipping product experiences.
                </p>
              </div>

              <div className="relative pl-6 border-l-2 border-black/10 dark:border-white/10 flex flex-col gap-8">
                {EXPERIENCE.filter((e) => e.type === 'work').map((exp) => (
                  <div key={exp.id} className="relative">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#007AFF] border-2 border-white dark:border-neutral-900 ring-2 ring-[#007AFF]/20" />

                    <div>
                      <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {exp.role}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono text-slate-600 dark:text-neutral-400">
                          {exp.period}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#007AFF] mt-0.5">
                        {exp.company} • {exp.location}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed">
                        {exp.description}
                      </p>

                      <ul className="mt-2.5 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-neutral-300">
                        {exp.achievements.map((ach, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {exp.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-600 dark:text-neutral-400 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note 4: Education & Certifications */}
          {selectedNote.id === 'education' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                  Accreditation & Honors
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Education & Awards
                </h1>
              </div>

              <div className="flex flex-col gap-4">
                {EXPERIENCE.filter((e) => e.type === 'education' || e.type === 'award').map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {item.type === 'award' ? (
                          <Award className="w-4 h-4 text-amber-500" />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-purple-500" />
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.role}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{item.period}</span>
                    </div>

                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {item.company} • {item.location}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>

                    <ul className="flex flex-col gap-1 text-xs text-slate-600 dark:text-neutral-300">
                      {item.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-purple-500 font-bold">•</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note 5: Engineering Philosophy */}
          {selectedNote.id === 'philosophy' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  Mindset & Craft
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Engineering Philosophy
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  The principles governing how I build digital experiences and lead technical teams.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-rose-500 font-bold text-base">01. Tactile Skeuomorphism</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Interfaces should have weight
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Software shouldn’t feel like flat, cold glass. Adding spring damping, responsive shadows, and subtle audio cues makes interaction intuitive, delightful, and memorable.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-blue-500 font-bold text-base">02. 60 FPS As A Contract</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Performance is user empathy
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    A beautiful animation that stutters or drops frames ruins trust. We offload intensive math to Web Workers, utilize GPU compositing layers, and avoid layout thrash at all costs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-emerald-500 font-bold text-base">03. Strict Type Safety</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Speed through certainty
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    TypeScript isn't bureaucracy—it is our safety net and cognitive offloader. Thorough types and automated contracts allow fearless refactoring and continuous shipping.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                  <div className="text-amber-500 font-bold text-base">04. Joyful Software</div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                    Never forget the duck 🦆
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Software built without enthusiasm feels like a tax form. We embed easter eggs, playful stickers, and delightful micro-interactions that make people smile while getting work done.
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
