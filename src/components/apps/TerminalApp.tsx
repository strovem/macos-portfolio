'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useWindowStore } from '@/stores/useWindowStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAudioStore } from '@/stores/useAudioStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useLockStore } from '@/stores/useLockStore';
import { useOverlayStore } from '@/stores/useOverlayStore';
import { PROJECTS } from '@/data/projects';
import { SKILL_CATEGORIES } from '@/data/skills';
import { ORIGINAL_TRACKS } from '@/data/music';
import { AppId } from '@/types/os';
import { Sparkles, Terminal as TerminalIcon } from 'lucide-react';

interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ascii';
  text?: string;
  elements?: React.ReactNode;
  promptPath?: string;
}

const ALL_COMMANDS = [
  'help',
  'neofetch',
  'bio',
  'skills',
  'projects',
  'open',
  'close',
  'lock',
  'lang',
  'notify',
  'play',
  'music',
  'pause',
  'theme',
  'contact',
  'whoami',
  'pwd',
  'ls',
  'cd',
  'cat',
  'matrix',
  'confetti',
  'party',
  'clear',
  'date',
  'echo',
  'exit',
  'sudo',
];

const VALID_APPS: AppId[] = [
  'finder',
  'safari',
  'messages',
  'notes',
  'photos',
  'terminal',
  'settings',
  'studio',
  'powerpoint',
  'tonegenerator',
  'trash',
];

// Levenshtein distance for smart typo suggestions
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function findClosestCommand(cmd: string): string | null {
  let closest: string | null = null;
  let minDistance = 3; // only suggest if distance is 1 or 2
  for (const c of ALL_COMMANDS) {
    const dist = levenshtein(cmd, c);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }
  return closest;
}

const INITIAL_OUTPUT: OutputLine[] = [
  {
    id: 'init-1',
    type: 'system',
    text: 'Last login: Mon Nov 24 19:42:00 on ttys001',
  },
  {
    id: 'init-2',
    type: 'system',
    text: 'macOS Sequoia [Darwin 24.1.0 (arm64)] — Type "help" or tap quick chips below.',
  },
];

export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<OutputLine[]>(INITIAL_OUTPUT);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<string>('~');

  // Easter Egg States
  const [isMatrixMode, setIsMatrixMode] = useState<boolean>(false);
  const [isConfettiActive, setIsConfettiActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const sudoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (sudoTimerRef.current) clearTimeout(sudoTimerRef.current);
    };
  }, []);

  // Zustand Store Selectors
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const isAudioPlaying = useAudioStore((state) => state.isPlaying);
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const playTrack = useAudioStore((state) => state.playTrack);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const pauseAudio = useAudioStore((state) => state.pause);
  const pushNotification = useNotificationStore((state) => state.pushNotification);
  const lockSystem = useLockStore((state) => state.lock);

  // Virtual Filesystem Content Map
  const virtualFS = useMemo<
    Record<string, { directories: string[]; files: Record<string, string> }>
  >(() => {
    return {
      '~': {
        directories: ['Desktop', 'Projects', 'Music'],
        files: {
          'README.md': `# Hüseyin Korumtaş 👋
Creative Producer — "Ideas into experiences."

Bridging creative direction, sound design, original music production,
and spatial digital interfaces.

• Ideas into experiences
• Creative Production & Direction
• Sound, Tactile Media & Web Spaces

Tip: Run 'open notes' or visit Notes.app to read full creative journal.`,
          'skills.json': JSON.stringify(
            {
              role: 'Creative Producer & Audio Lead',
              domains: {
                creativeDirection: [
                  'Concept Development',
                  'Executive Production',
                  'Cross-Disciplinary Teams',
                ],
                soundDesign: [
                  'Web Audio API',
                  'Ableton Live Suite',
                  'Spatial Acoustics',
                  'Synthesis & Mixing',
                ],
                frontendEngineering: [
                  'Next.js 14 App Router',
                  'TypeScript',
                  'Tailwind CSS',
                  'Framer Motion',
                  'Zustand',
                ],
              },
            },
            null,
            2
          ),
          'contact.txt': `Hüseyin Korumtaş — Contact Details
----------------------------------
Email:     korumtashuseyin@gmail.com
LinkedIn:  linkedin.com/in/hüseyin-korumtaş-05379128a/
Instagram: @korumtashuseyin
Portfolio: https://huseyinkorumtas.com

Tip: Run 'contact' or 'open messages' to message directly.`,
        },
      },
      '~/Desktop': {
        directories: [],
        files: {
          'README.md': `[Symlink -> ~/README.md]
Creative Producer — "Ideas into experiences."`,
          'Huseyin_Intro.txt': `Hey there! Welcome to my creative space.
Feel free to send a direct message for music production, commercial jingles, or new creative projects.`,
          'CatYear_Widget.app': `[macOS Celestial Calendar & Numerology Widget]
Calculates life paths and astrological transits in real-time.`,
          'Studio_Session.app': `[Ableton / Web Audio Studio Session]
Real-time 60 FPS FFT frequency analyzer and tactile 6-pad drum machine.`,
        },
      },
      '~/Projects': {
        directories: [],
        files: {
          'projects.txt': PROJECTS.map(
            (p, idx) => `[${idx + 1}] ${p.title} (${p.category}) — ${p.tags.join(', ')}`
          ).join('\n'),
          'tech-house-lover.md': `# Tech House — I Am A Lover
126 BPM Club production featuring analog Roland TB-303 basslines and driving percussion polyrhythms.`,
          'analog-modular.md': `# Modular Soundscapes
Analog synth explorations recorded through tape saturation and stereo chorus processing.`,
          'macos-portfolio.md': `# macOS Web OS Architecture
Next.js 14 App Router, Web Audio FFT Engine, Sequoia Window Tiling, Liquid Glass physics.`,
        },
      },
      '~/Music': {
        directories: [],
        files: {
          'discography.txt': ORIGINAL_TRACKS.map(
            (t) => `• ${t.id.padEnd(20)} | ${t.title.padEnd(24)} | ${t.genre.padEnd(14)} | ${t.bpm} BPM`
          ).join('\n'),
          'now-playing.txt': currentTrack
            ? `Track:    ${currentTrack.title}
Genre:    ${currentTrack.genre}
BPM:      ${currentTrack.bpm}
Status:   ${isAudioPlaying ? 'Streaming (60 FPS FFT Active)' : 'Paused'}`
            : 'No track currently active. Run "play lover" or "play" to start audio streaming.',
        },
      },
    };
  }, [currentTrack, isAudioPlaying]);

  // Matrix digital rain animation
  useEffect(() => {
    if (!isMatrixMode) return;
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 640;
    canvas.height = canvas.parentElement?.clientHeight || 420;

    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const fontSize = 14;
    const columns = Math.max(1, Math.floor(canvas.width / fontSize));
    const drops = Array(columns).fill(1);

    const interval = setInterval(() => {
      if (document.hidden) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FF41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 33);

    const closer = () => setIsMatrixMode(false);
    useOverlayStore.getState().registerMatrixMode(closer);

    const handleExit = (e: KeyboardEvent) => {
      if (e.key === 'q' || (e.ctrlKey && e.key === 'c')) {
        setIsMatrixMode(false);
      }
    };
    window.addEventListener('keydown', handleExit);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleExit);
      useOverlayStore.getState().unregisterMatrixMode(closer);
    };
  }, [isMatrixMode]);

  // Confetti Particle Explosion
  useEffect(() => {
    if (!isConfettiActive) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 640;
    canvas.height = canvas.parentElement?.clientHeight || 420;

    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
    const particleCount = 80;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 60,
      y: canvas.height * 0.4 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    let animId: number;
    let startTime = Date.now();

    const loop = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 2800) {
        setIsConfettiActive(false);
        return;
      }
      if (document.hidden) {
        animId = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.vRot;
        if (elapsed > 1800) {
          p.opacity = Math.max(0, 1 - (elapsed - 1800) / 1000);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isConfettiActive]);

  // Auto-scroll on new output
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  // Click terminal to focus input
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      setHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), type: 'input', text: '', promptPath: currentPath },
      ]);
      return;
    }

    // Add to command history buffer
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Record the executed command prompt
    const newLines: OutputLine[] = [
      { id: Math.random().toString(), type: 'input', text: trimmed, promptPath: currentPath },
    ];

    const [cmd, ...args] = trimmed.split(/\s+/);
    const commandName = cmd.toLowerCase();

    switch (commandName) {
      case 'help':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="flex flex-col gap-1.5 my-1 text-slate-300">
              <div className="text-amber-400 font-bold mb-0.5">macOS Power-User Terminal Reference:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                <div><span className="text-emerald-400 font-bold">help</span> — Show this reference manual</div>
                <div><span className="text-emerald-400 font-bold">neofetch</span> — Print live OS system & hardware report</div>
                <div><span className="text-emerald-400 font-bold">open &lt;app&gt;</span> — Launch app (studio, finder, notes...)</div>
                <div><span className="text-emerald-400 font-bold">close &lt;app|all&gt;</span> — Terminate running windows</div>
                <div><span className="text-emerald-400 font-bold">lock</span> — Lock session and show Lock Screen</div>
                <div><span className="text-emerald-400 font-bold">lang &lt;tr|en&gt;</span> — Switch system language</div>
                <div><span className="text-emerald-400 font-bold">notify &lt;msg&gt;</span> — Push real macOS banner notification</div>
                <div><span className="text-emerald-400 font-bold">play [track]</span> — Stream track with Web Audio FFT</div>
                <div><span className="text-emerald-400 font-bold">pause</span> — Pause active audio stream</div>
                <div><span className="text-emerald-400 font-bold">pwd</span> — Print current working directory</div>
                <div><span className="text-emerald-400 font-bold">ls</span> — List directory files and folders</div>
                <div><span className="text-emerald-400 font-bold">cd &lt;dir&gt;</span> — Navigate filesystem (~, Projects, ..)</div>
                <div><span className="text-emerald-400 font-bold">cat &lt;file&gt;</span> — Print file contents</div>
                <div><span className="text-emerald-400 font-bold">skills</span> — Display technical skill tree</div>
                <div><span className="text-emerald-400 font-bold">projects</span> — Browse portfolio projects</div>
                <div><span className="text-emerald-400 font-bold">bio</span> — Creative producer vision & bio</div>
                <div><span className="text-emerald-400 font-bold">contact</span> — Get contact info or open Messages</div>
                <div><span className="text-emerald-400 font-bold">matrix</span> — Launch Matrix digital rain canvas</div>
                <div><span className="text-emerald-400 font-bold">confetti</span> — Trigger celebratory particle burst</div>
                <div><span className="text-emerald-400 font-bold">sudo hire huseyin</span> — Executive hiring protocol</div>
                <div><span className="text-emerald-400 font-bold">clear (Ctrl+L)</span> — Clear terminal output buffer</div>
              </div>
            </div>
          ),
        });
        break;

      case 'neofetch': {
        const openAppNames = Object.values(useWindowStore.getState().windows)
          .filter((w) => w.isOpen && !w.isMinimized)
          .map((w) => w.title)
          .join(', ') || 'None';

        const screenRes =
          typeof window !== 'undefined'
            ? `${window.innerWidth}x${window.innerHeight} (Retina Display)`
            : '1920x1080 (Retina Display)';

        newLines.push({
          id: Math.random().toString(),
          type: 'ascii',
          elements: (
            <div className="flex flex-col sm:flex-row gap-4 my-2 text-xs font-mono">
              <div className="text-cyan-400 select-none whitespace-pre leading-none shrink-0">
{`                    'c.
                 ,xNMM.
               .OMMMMo
               OMMM0,
     .;loddo:' loolloddol;.
   cKMMMMMMMMMMNWMMMMMMMMMM0:
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.
 XMMMMMMMMMMMMMMMMMMMMMMMX.
;MMMMMMMMMMMMMMMMMMMMMMMM:
:MMMMMMMMMMMMMMMMMMMMMMMM:
.MMMMMMMMMMMMMMMMMMMMMMMX.
 kMMMMMMMMMMMMMMMMMMMMMMWd.
 .XMMMMMMMMMMMMMMMMMMMMMM0:
  .c0WMMMMMMMMMMMMMMMMMM0;
     .:odkO0OOOO0Okdo:.`}
              </div>
              <div className="flex flex-col gap-0.5 text-slate-300">
                <div className="text-emerald-400 font-bold text-sm">huseyin@korumtas-os</div>
                <div className="text-slate-600">----------------------------------------</div>
                <div><span className="text-amber-400 font-semibold">OS:</span> macOS Sequoia 15.2 Web OS (arm64)</div>
                <div><span className="text-amber-400 font-semibold">Host:</span> MacBook Pro (16-inch, M3 Max)</div>
                <div><span className="text-amber-400 font-semibold">Kernel:</span> Darwin 24.1.0</div>
                <div><span className="text-amber-400 font-semibold">Role:</span> Hüseyin Korumtaş — Creative Producer & Audio Lead</div>
                <div><span className="text-amber-400 font-semibold">Theme:</span> {isDarkMode ? 'Dark Mode' : 'Light Mode'}</div>
                <div><span className="text-amber-400 font-semibold">Language:</span> {language.toUpperCase()} (Input Source)</div>
                <div><span className="text-amber-400 font-semibold">Resolution:</span> {screenRes}</div>
                <div><span className="text-amber-400 font-semibold">Active Windows:</span> <span className="text-cyan-300">{openAppNames}</span></div>
                <div><span className="text-amber-400 font-semibold">Now Playing:</span> <span className="text-emerald-300">{currentTrack ? `${currentTrack.title} (${currentTrack.genre})` : 'Idle / Paused'}</span></div>
                <div><span className="text-amber-400 font-semibold">Stack:</span> Next.js 14, TypeScript, Tailwind, Web Audio FFT, Zustand</div>
                <div><span className="text-amber-400 font-semibold">Memory:</span> 16,420 MiB / 65,536 MiB</div>
                <div className="flex gap-1.5 mt-2">
                  <span className="w-3.5 h-3 bg-red-500 rounded-xs" />
                  <span className="w-3.5 h-3 bg-emerald-500 rounded-xs" />
                  <span className="w-3.5 h-3 bg-amber-400 rounded-xs" />
                  <span className="w-3.5 h-3 bg-blue-500 rounded-xs" />
                  <span className="w-3.5 h-3 bg-purple-500 rounded-xs" />
                  <span className="w-3.5 h-3 bg-cyan-400 rounded-xs" />
                  <span className="w-3.5 h-3 bg-white rounded-xs" />
                </div>
              </div>
            </div>
          ),
        });
        break;
      }

      // Virtual Filesystem: pwd
      case 'pwd': {
        const fullDir = currentPath === '~' ? '/Users/huseyin' : `/Users/huseyin/${currentPath.replace('~/', '')}`;
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          text: fullDir,
        });
        break;
      }

      // Virtual Filesystem: ls
      case 'ls': {
        const cur = virtualFS[currentPath];
        if (!cur) {
          newLines.push({ id: Math.random().toString(), type: 'error', text: 'ls: directory not found.' });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            elements: (
              <div className="flex flex-wrap gap-x-5 gap-y-1 my-1 text-xs">
                {cur.directories.map((dir: string) => (
                  <span key={dir} className="text-cyan-400 font-bold flex items-center gap-1 cursor-pointer hover:underline" onClick={() => handleCommand(`cd ${dir}`)}>
                    📁 {dir}/
                  </span>
                ))}
                {Object.keys(cur.files).map((file: string) => (
                  <span key={file} className="text-slate-200 flex items-center gap-1 cursor-pointer hover:text-white hover:underline" onClick={() => handleCommand(`cat ${file}`)}>
                    📄 {file}
                  </span>
                ))}
              </div>
            ),
          });
        }
        break;
      }

      // Virtual Filesystem: cd
      case 'cd': {
        const target = args[0] ? args[0].replace(/\/$/, '') : '~';
        if (target === '~' || target === '/' || target === '/Users/huseyin') {
          setCurrentPath('~');
        } else if (target === '..') {
          setCurrentPath('~');
        } else if (target === 'Desktop' || target === '~/Desktop') {
          setCurrentPath('~/Desktop');
        } else if (target === 'Projects' || target === '~/Projects') {
          setCurrentPath('~/Projects');
        } else if (target === 'Music' || target === '~/Music') {
          setCurrentPath('~/Music');
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `cd: no such file or directory: ${target}`,
          });
        }
        break;
      }

      // Virtual Filesystem: cat
      case 'cat': {
        const targetFile = args[0];
        if (!targetFile) {
          newLines.push({ id: Math.random().toString(), type: 'error', text: 'usage: cat <file>' });
        } else {
          const cur = virtualFS[currentPath];
          if (cur?.directories?.includes(targetFile)) {
            newLines.push({ id: Math.random().toString(), type: 'error', text: `cat: ${targetFile}: Is a directory` });
          } else if (cur?.files?.[targetFile]) {
            newLines.push({
              id: Math.random().toString(),
              type: 'output',
              elements: (
                <div className="my-1.5 p-2 rounded bg-black/40 border border-white/5 text-slate-200 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                  {cur.files[targetFile]}
                </div>
              ),
            });
          } else {
            newLines.push({
              id: Math.random().toString(),
              type: 'error',
              text: `cat: ${targetFile}: No such file or directory`,
            });
          }
        }
        break;
      }

      // OS Control: open <app>
      case 'open': {
        const targetApp = args[0]?.toLowerCase() as AppId;
        if (!targetApp) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `Usage: open <app>\nAvailable apps: ${VALID_APPS.join(', ')}`,
          });
        } else if (VALID_APPS.includes(targetApp)) {
          openWindow(targetApp);
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: `✓ Launched ${targetApp.charAt(0).toUpperCase() + targetApp.slice(1)}.app [PID: ${Math.floor(Math.random() * 8000) + 1000}]`,
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `open: Application "${targetApp}" not found. Valid targets: ${VALID_APPS.join(', ')}`,
          });
        }
        break;
      }

      // OS Control: close <app|all>
      case 'close': {
        const target = args[0]?.toLowerCase();
        if (!target) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: 'Usage: close <app|all> (e.g. close studio, close all)',
          });
        } else if (target === 'all') {
          Object.values(useWindowStore.getState().windows).forEach((w) => {
            if (w.isOpen && w.id !== 'terminal') {
              closeWindow(w.id);
            }
          });
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: '✓ Closed all open application windows (Terminal kept active).',
          });
        } else if (VALID_APPS.includes(target as AppId)) {
          closeWindow(target as AppId);
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: `✓ Closed ${target}.app.`,
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `close: No matching application "${target}".`,
          });
        }
        break;
      }

      // OS Control: lock
      case 'lock': {
        lockSystem();
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          text: '✓ System locked. Presenting macOS Lock Screen...',
        });
        break;
      }

      // OS Control: lang <tr|en>
      case 'lang': {
        const targetLang = args[0]?.toLowerCase();
        if (targetLang === 'tr' || targetLang === 'en') {
          setLanguage(targetLang);
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: `✓ System language switched to ${targetLang === 'tr' ? 'Turkish (TR)' : 'English (EN)'}.`,
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: `Current language: ${language.toUpperCase()}. Usage: lang <tr|en>`,
          });
        }
        break;
      }

      // OS Control: notify <msg>
      case 'notify': {
        const msg = args.join(' ').trim();
        if (!msg) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: 'Usage: notify <message> (e.g. notify New mix ready in Studio!)',
          });
        } else {
          pushNotification({
            title: 'Terminal Notification',
            message: msg,
            appId: 'terminal',
          });
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: '✓ Dispatched macOS notification banner.',
          });
        }
        break;
      }

      // Audio Control: music (catalog alias) & play [track]
      case 'music': {
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1.5 p-2.5 rounded-lg bg-black/40 border border-white/10 text-slate-300">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-amber-400 font-bold">
                  Studio Discography ({ORIGINAL_TRACKS.length} Original Productions):
                </span>
                <button
                  type="button"
                  onClick={() => openWindow('studio')}
                  className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/35 border border-indigo-400/30 cursor-pointer"
                >
                  Open Studio DAW ↗
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                {ORIGINAL_TRACKS.map((t) => (
                  <div key={t.id} className="text-slate-300">
                    <span
                      className="text-cyan-400 font-bold cursor-pointer hover:underline"
                      onClick={() => handleCommand(`play ${t.id}`)}
                    >
                      play {t.id}
                    </span>{' '}
                    — {t.title} <span className="text-emerald-400">({t.bpm} BPM)</span>
                  </div>
                ))}
              </div>
            </div>
          ),
        });
        break;
      }

      // Audio Control: play [track]
      case 'play': {
        const query = args.join(' ').toLowerCase().trim();
        if (!query) {
          if (currentTrack && !isAudioPlaying) {
            togglePlay();
            newLines.push({
              id: Math.random().toString(),
              type: 'output',
              text: `▶ Resumed streaming: ${currentTrack.title} (Web Audio FFT Active).`,
            });
          } else {
            newLines.push({
              id: Math.random().toString(),
              type: 'output',
              elements: (
                <div className="my-1.5 p-2 rounded bg-black/40 border border-white/5 text-slate-300">
                  <div className="text-amber-400 font-bold mb-1">Available Audio Tracks:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {ORIGINAL_TRACKS.map((t) => (
                      <div key={t.id} className="text-slate-300">
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => handleCommand(`play ${t.id}`)}>play {t.id}</span> — {t.title} <span className="text-emerald-400">({t.bpm} BPM)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            });
          }
        } else {
          const matched = ORIGINAL_TRACKS.find(
            (t) =>
              t.id.toLowerCase().includes(query) ||
              t.title.toLowerCase().includes(query) ||
              t.genre.toLowerCase().includes(query)
          );

          if (matched) {
            playTrack(matched);
            newLines.push({
              id: Math.random().toString(),
              type: 'output',
              elements: (
                <div className="my-2 p-3 rounded-xl bg-black/50 border border-emerald-500/30 text-slate-200">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Now Streaming via Web Audio: {matched.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Genre: {matched.genre} • BPM: {matched.bpm} • Duration: {matched.duration}
                  </div>
                  <div className="font-mono text-cyan-400 text-xs mt-2 select-none tracking-wider leading-none">
                     ▂▃▅▆▇█▇▆▅▃▂ ▂▃▅▆▇█▇▆▅▃▂ ▂▃▅▆▇█▇▆▅▃▂ [60 FPS REAL-TIME FFT]
                  </div>
                </div>
              ),
            });
          } else {
            newLines.push({
              id: Math.random().toString(),
              type: 'error',
              text: `play: Track "${query}" not found. Type "play" to see catalog.`,
            });
          }
        }
        break;
      }

      // Audio Control: pause
      case 'pause': {
        pauseAudio();
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          text: '⏸ Audio stream paused.',
        });
        break;
      }

      // Easter Egg: matrix
      case 'matrix': {
        setIsMatrixMode(true);
        return;
      }

      // Easter Egg: confetti / party
      case 'confetti':
      case 'party': {
        setIsConfettiActive(true);
        pushNotification({
          title: '🎉 Party Celebration Mode',
          message: 'Hüseyin Korumtaş OS Celebration Mode Activated!',
          appId: 'terminal',
        });
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="text-amber-300 font-bold text-xs my-1">
              🎉 Confetti explosion fired! Keep creating unforgettable experiences.
            </div>
          ),
        });
        break;
      }

      // Easter Egg: sudo hire huseyin
      case 'sudo': {
        const fullArgs = args.join(' ').toLowerCase();
        if (fullArgs.includes('hire huseyin') || fullArgs.includes('hire hüseyin')) {
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            elements: (
              <div className="my-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-emerald-200">
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>[PRODUCER VIP PROTOCOL ACTIVATED]</span>
                </div>
                <div className="text-xs text-white mt-1.5 leading-relaxed">
                  &ldquo;Exceptional decision. Bringing visionary creative direction, original sound design, and multidisciplinary production precision to your project.&rdquo;
                </div>
                <div className="text-[11px] text-amber-300 mt-2 font-mono">
                  Connecting to direct messaging channel in 1 second...
                </div>
              </div>
            ),
          });

          // Delay opening Messages.app for dramatic effect
          if (sudoTimerRef.current) clearTimeout(sudoTimerRef.current);
          sudoTimerRef.current = setTimeout(() => {
            openWindow('messages');
            sudoTimerRef.current = null;
          }, 1000);
        } else if (fullArgs.includes('rm -rf')) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: '⚠️ Nice try! System Integrity Protection (SIP) prevented destruction of the portfolio universe. 🦆',
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `sudo: ${args[0] || 'command'}: permission denied. Try "sudo hire huseyin".`,
          });
        }
        break;
      }

      // Developer Bio
      case 'bio':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1.5 p-2.5 rounded-lg bg-black/30 border border-white/5 text-slate-200">
              <div className="text-cyan-400 font-bold text-sm">Hüseyin Korumtaş</div>
              <div className="text-amber-400 text-xs font-semibold mb-1">Creative Producer • &ldquo;Ideas into experiences.&rdquo;</div>
              <div className="text-xs leading-relaxed text-slate-300">
                Transforming bold concepts into resonant, unforgettable experiences.
                Bridging creative direction, sound, multidisciplinary media, and spatial digital design.
              </div>
              <div className="mt-2 text-emerald-400 text-xs">
                Tip: Run <span className="underline cursor-pointer" onClick={() => openWindow('notes')}>open notes</span> to read full vision and philosophy.
              </div>
            </div>
          ),
        });
        break;

      // Technical Skills Tree
      case 'skills':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1 text-slate-200 flex flex-col gap-2">
              <div className="text-amber-400 font-bold">Technical Skills Tree:</div>
              {SKILL_CATEGORIES.map((cat) => (
                <div key={cat.name} className="flex flex-col gap-0.5">
                  <div className="text-cyan-300 font-semibold text-xs">▸ {cat.name}</div>
                  <div className="pl-4 text-xs text-slate-300 flex flex-wrap gap-x-4">
                    {cat.skills.map((s) => (
                      <span key={s.name}>
                        {s.name} <span className="text-emerald-400">({s.level}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ),
        });
        break;

      // Portfolio Projects
      case 'projects':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1 text-slate-200 flex flex-col gap-1.5">
              <div className="text-amber-400 font-bold">Portfolio Projects:</div>
              {PROJECTS.map((proj, idx) => (
                <div key={proj.id} className="text-xs flex items-center justify-between border-b border-white/5 pb-1">
                  <div>
                    <span className="text-cyan-400 font-bold">[{idx + 1}] {proj.title}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({proj.category})</span>
                  </div>
                  <div className="text-emerald-400 text-[11px]">
                    {proj.tags.slice(0, 3).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ),
        });
        break;

      // Theme Switcher
      case 'theme': {
        const choice = args[0]?.toLowerCase();
        if (choice === 'dark') {
          if (!isDarkMode) toggleDarkMode();
          newLines.push({ id: Math.random().toString(), type: 'output', text: 'System appearance set to Dark Mode.' });
        } else if (choice === 'light') {
          if (isDarkMode) toggleDarkMode();
          newLines.push({ id: Math.random().toString(), type: 'output', text: 'System appearance set to Light Mode.' });
        } else {
          toggleDarkMode();
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: `Toggled system appearance to ${!isDarkMode ? 'Dark' : 'Light'} Mode.`,
          });
        }
        break;
      }

      // Contact Information
      case 'contact':
        openWindow('messages');
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1 text-slate-200 flex flex-col gap-1">
              <div className="text-emerald-400 font-bold">Contact Hüseyin Korumtaş:</div>
              <div>• Email: <a href="mailto:korumtashuseyin@gmail.com" className="text-cyan-400 underline">korumtashuseyin@gmail.com</a></div>
              <div>• LinkedIn: <a href="https://www.linkedin.com/in/h%C3%BCseyin-korumta%C5%9F-05379128a/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">linkedin.com/in/hüseyin-korumtaş</a></div>
              <div>• Instagram: <a href="https://www.instagram.com/korumtashuseyin/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">@korumtashuseyin</a></div>
              <div className="text-amber-300 text-xs mt-1">✓ Launched Messages.app for direct message composition.</div>
            </div>
          ),
        });
        break;

      // Whoami
      case 'whoami':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1 text-slate-300 flex flex-col gap-0.5 text-xs">
              <div><strong className="text-cyan-400">User:</strong> visitor (UID 1000, GID 1000)</div>
              <div><strong className="text-cyan-400">Host:</strong> Hüseyin Korumtaş Creative Studio Workstation</div>
              <div><strong className="text-cyan-400">Terminal:</strong> /dev/ttys001 (xterm-256color)</div>
              <div><strong className="text-cyan-400">Session:</strong> Authenticated Guest in macOS Web OS Playground</div>
            </div>
          ),
        });
        break;

      case 'date':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          text: new Date().toString(),
        });
        break;

      case 'echo':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          text: args.join(' '),
        });
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'exit':
        closeWindow('terminal');
        return;

      default: {
        const closest = findClosestCommand(commandName);
        if (closest) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `zsh: command not found: ${commandName}. Did you mean: "${closest}"?`,
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `zsh: command not found: ${commandName}. Type "help" for a list of available commands.`,
          });
        }
        break;
      }
    }

    setHistory((prev) => [...prev, ...newLines]);
  };

  // Keyboard navigation & Tab completion & Ctrl+L clear
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl + L -> Clear screen
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
      return;
    }

    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex =
        historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const trimmed = inputVal.trimStart();
      const parts = trimmed.split(/\s+/);

      if (parts.length === 1 && parts[0]) {
        // Complete root command
        const prefix = parts[0].toLowerCase();
        const matches = ALL_COMMANDS.filter((c) => c.startsWith(prefix));
        if (matches.length === 1) {
          setInputVal(matches[0] + ' ');
        }
      } else if (parts.length === 2) {
        const subCmd = parts[0].toLowerCase();
        const prefix = parts[1].toLowerCase();

        if (subCmd === 'open' || subCmd === 'close') {
          const matches = VALID_APPS.filter((a) => a.startsWith(prefix));
          if (matches.length === 1) {
            setInputVal(`${subCmd} ${matches[0]}`);
          }
        } else if (subCmd === 'cd') {
          const cur = virtualFS[currentPath];
          const dirs = cur?.directories || [];
          const matches = dirs.filter((d: string) => d.toLowerCase().startsWith(prefix));
          if (matches.length === 1) {
            setInputVal(`cd ${matches[0]}`);
          }
        } else if (subCmd === 'cat') {
          const cur = virtualFS[currentPath];
          const files = Object.keys(cur?.files || {});
          const matches = files.filter((f) => f.toLowerCase().startsWith(prefix));
          if (matches.length === 1) {
            setInputVal(`cat ${matches[0]}`);
          }
        } else if (subCmd === 'play') {
          const matches = ORIGINAL_TRACKS.filter((t) => t.id.toLowerCase().startsWith(prefix));
          if (matches.length === 1) {
            setInputVal(`play ${matches[0].id}`);
          }
        }
      }
    }
  };

  const quickChips = ['neofetch', 'projects', 'music', 'matrix', 'confetti', 'help'];

  return (
    <div
      onClick={handleTerminalClick}
      className="relative h-full w-full bg-[#18181b] text-neutral-200 font-mono text-xs p-3.5 flex flex-col select-text cursor-text overflow-hidden"
    >
      {/* Matrix Mode Full Canvas Overlay */}
      {isMatrixMode && (
        <div
          onClick={() => setIsMatrixMode(false)}
          className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center cursor-pointer"
        >
          <canvas ref={matrixCanvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-3 px-3.5 py-1.5 rounded-full bg-black/80 border border-emerald-500/50 text-emerald-400 text-[11px] font-mono tracking-wider shadow-lg animate-pulse z-40 select-none">
            [ MATRIX DIGITAL RAIN — PRESS ESC, Q, OR CLICK TO EXIT ]
          </div>
        </div>
      )}

      {/* Confetti Explosion Canvas Overlay */}
      {isConfettiActive && (
        <canvas
          ref={confettiCanvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full z-20"
        />
      )}

      {/* Scrollable output container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col gap-1.5 custom-scrollbar pr-1">
        {history.map((line) => {
          if (line.type === 'input') {
            return (
              <div key={line.id} className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold shrink-0">
                  huseyin@korumtas-os {line.promptPath || currentPath} %
                </span>
                <span className="text-white">{line.text}</span>
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 pl-2">
                {line.text}
              </div>
            );
          }
          if (line.type === 'system') {
            return (
              <div key={line.id} className="text-neutral-400 text-[11px]">
                {line.text}
              </div>
            );
          }
          if (line.elements) {
            return <div key={line.id}>{line.elements}</div>;
          }
          return (
            <div key={line.id} className="text-slate-300 pl-2 whitespace-pre-wrap">
              {line.text}
            </div>
          );
        })}

        {/* Current Active Input Prompt */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-cyan-400 font-semibold shrink-0">
            huseyin@korumtas-os {currentPath} %
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent text-white outline-none border-none p-0 focus:ring-0 text-xs"
          />
        </div>
      </div>

      {/* Mobile-Friendly Quick Action Command Pills */}
      <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <TerminalIcon className="w-3 h-3 text-cyan-400" />
          <span>Quick:</span>
        </span>
        {quickChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCommand(chip);
            }}
            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all font-mono whitespace-nowrap cursor-pointer shadow-xs"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
