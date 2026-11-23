'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '@/stores/useWindowStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { PROJECTS } from '@/data/projects';
import { SKILL_CATEGORIES } from '@/data/skills';
import { ORIGINAL_TRACKS } from '@/data/music';
import { useAudioStore } from '@/stores/useAudioStore';
import { AppId } from '@/types/os';

interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ascii';
  text?: string;
  elements?: React.ReactNode;
}

const INITIAL_OUTPUT: OutputLine[] = [
  {
    id: 'init-1',
    type: 'system',
    text: 'Last login: Sun Nov 22 15:32:00 on ttys001',
  },
  {
    id: 'init-2',
    type: 'system',
    text: 'macOS Web OS Sonoma [Darwin 24.1.0 (arm64)] - Type "help" to view commands.',
  },
];

export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<OutputLine[]>(INITIAL_OUTPUT);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isMatrixMode, setIsMatrixMode] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

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

    const handleExit = () => setIsMatrixMode(false);
    window.addEventListener('keydown', handleExit);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleExit);
    };
  }, [isMatrixMode]);

  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);

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
        { id: Math.random().toString(), type: 'input', text: '' },
      ]);
      return;
    }

    // Add to command history buffer
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Record the executed command prompt
    const newLines: OutputLine[] = [
      { id: Math.random().toString(), type: 'input', text: trimmed },
    ];

    const [cmd, ...args] = trimmed.split(' ');
    const commandName = cmd.toLowerCase();

    switch (commandName) {
      case 'help':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="flex flex-col gap-1 my-1 text-slate-300">
              <div className="text-amber-400 font-bold mb-1">Available System Commands:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <div><span className="text-emerald-400 font-bold">help</span> — Show this command reference</div>
                <div><span className="text-emerald-400 font-bold">bio</span> — Print developer bio & summary</div>
                <div><span className="text-emerald-400 font-bold">skills</span> — Display technical skill tree</div>
                <div><span className="text-emerald-400 font-bold">projects</span> — List all portfolio projects</div>
                <div><span className="text-emerald-400 font-bold">open &lt;app&gt;</span> — Launch app (finder, notes, etc.)</div>
                <div><span className="text-emerald-400 font-bold">theme &lt;dark|light&gt;</span> — Toggle system appearance</div>
                <div><span className="text-emerald-400 font-bold">contact</span> — Get contact info or open Messages</div>
                <div><span className="text-emerald-400 font-bold">whoami</span> — Display session & visitor profile</div>
                <div><span className="text-emerald-400 font-bold">neofetch</span> — Print macOS Sonoma system banner</div>
                <div><span className="text-emerald-400 font-bold">play &lt;track&gt;</span> — Stream original track live</div>
                <div><span className="text-emerald-400 font-bold">matrix</span> — Launch Matrix digital rain effect</div>
                <div><span className="text-emerald-400 font-bold">clear</span> — Clear terminal output buffer</div>
                <div><span className="text-emerald-400 font-bold">date</span> — Display current date & time</div>
                <div><span className="text-emerald-400 font-bold">echo &lt;text&gt;</span> — Print argument text</div>
              </div>
            </div>
          ),
        });
        break;

      case 'bio':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1.5 p-2 rounded bg-black/30 border border-white/5 text-slate-200">
              <div className="text-cyan-400 font-bold text-sm">Hüseyin Korumtaş</div>
              <div className="text-amber-400 text-xs font-semibold mb-1">Creative Producer • &ldquo;Ideas into experiences.&rdquo;</div>
              <div className="text-xs leading-relaxed">
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

      case 'projects':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1 text-slate-200 flex flex-col gap-1.5">
              <div className="text-amber-400 font-bold">Portfolio Projects:</div>
              {PROJECTS.length === 0 ? (
                <div className="text-xs text-slate-400 italic">
                  Projects are currently being curated. Run <span className="text-cyan-300">open finder</span> to view the project directory.
                </div>
              ) : (
                PROJECTS.map((proj, idx) => (
                  <div key={proj.id} className="text-xs flex items-center justify-between border-b border-white/5 pb-1">
                    <div>
                      <span className="text-cyan-400 font-bold">[{idx + 1}] {proj.title}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({proj.category})</span>
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      {proj.tags.slice(0, 3).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          ),
        });
        break;

      case 'open':
        const targetApp = args[0]?.toLowerCase() as AppId;
        const validApps: AppId[] = ['finder', 'safari', 'messages', 'notes', 'photos', 'terminal', 'settings', 'trash'];

        if (!targetApp) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: 'Usage: open <app> (e.g. open finder, open notes, open messages, open safari)',
          });
        } else if (validApps.includes(targetApp)) {
          openWindow(targetApp);
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            text: `Launching ${targetApp.charAt(0).toUpperCase() + targetApp.slice(1)}.app... [PID: ${Math.floor(Math.random() * 8000) + 1000}]`,
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: `open: Application "${targetApp}" not found. Valid targets: ${validApps.join(', ')}`,
          });
        }
        break;

      case 'theme':
        const themeChoice = args[0]?.toLowerCase();
        if (themeChoice === 'dark') {
          if (!isDarkMode) toggleDarkMode();
          newLines.push({ id: Math.random().toString(), type: 'output', text: 'System appearance set to Dark Mode.' });
        } else if (themeChoice === 'light') {
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
              <div>• Instagram: <a href="https://www.instagram.com/korumtashuseyin/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">instagram.com/korumtashuseyin</a></div>
              <div className="text-amber-300 text-xs mt-1">✓ Launched Messages.app for direct message composition.</div>
            </div>
          ),
        });
        break;

      case 'whoami':
        newLines.push({
          id: Math.random().toString(),
          type: 'output',
          elements: (
            <div className="my-1 text-slate-300 flex flex-col gap-0.5 text-xs">
              <div><strong className="text-cyan-400">User:</strong> visitor (UID 1000, GID 1000)</div>
              <div><strong className="text-cyan-400">Terminal:</strong> /dev/ttys001 (xterm-256color)</div>
              <div><strong className="text-cyan-400">Session:</strong> Authenticated Guest in macOS Web OS Playground</div>
              <div><strong className="text-cyan-400">IP:</strong> 127.0.0.1 (Local Virtual Bridge)</div>
              <div><strong className="text-cyan-400">Location:</strong> Earth • Low Latency CDN Mesh</div>
            </div>
          ),
        });
        break;

      case 'neofetch':
        newLines.push({
          id: Math.random().toString(),
          type: 'ascii',
          elements: (
            <div className="flex gap-4 my-2 text-xs font-mono">
              <div className="text-cyan-400 select-none hidden sm:block whitespace-pre leading-none">
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
                <div className="text-emerald-400 font-bold">visitor@macbook-pro</div>
                <div className="text-slate-500">----------------------</div>
                <div><span className="text-amber-400 font-semibold">OS:</span> macOS Web OS Sonoma (v15.2 arm64)</div>
                <div><span className="text-amber-400 font-semibold">Host:</span> MacBook Pro (16-inch, Nov 2026)</div>
                <div><span className="text-amber-400 font-semibold">Kernel:</span> Darwin 24.1.0</div>
                <div><span className="text-amber-400 font-semibold">Uptime:</span> 4 days, 12 hours, 32 mins</div>
                <div><span className="text-amber-400 font-semibold">Shell:</span> zsh 5.9 (x86_64-apple-darwin24.0)</div>
                <div><span className="text-amber-400 font-semibold">CPU:</span> Apple M3 Max (16 cores)</div>
                <div><span className="text-amber-400 font-semibold">GPU:</span> Apple M3 Max (40 cores)</div>
                <div><span className="text-amber-400 font-semibold">Memory:</span> 16420MiB / 65536MiB</div>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span className="w-3 h-3 bg-yellow-500 rounded-sm" />
                  <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span className="w-3 h-3 bg-purple-500 rounded-sm" />
                  <span className="w-3 h-3 bg-cyan-500 rounded-sm" />
                </div>
              </div>
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

      case 'play':
        const trackQuery = args.join(' ').toLowerCase().trim();
        if (!trackQuery) {
          newLines.push({
            id: Math.random().toString(),
            type: 'output',
            elements: (
              <div className="my-1.5 p-2 rounded bg-black/40 border border-white/5 text-slate-300">
                <div className="text-amber-400 font-bold mb-1">Available Audio Tracks:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  {ORIGINAL_TRACKS.map((t) => (
                    <div key={t.id} className="text-slate-300">
                      <span className="text-cyan-400 font-bold">play {t.id}</span> — {t.title} <span className="text-emerald-400">({t.bpm} BPM)</span>
                    </div>
                  ))}
                </div>
                <div className="text-neutral-400 text-[11px] mt-2 italic">
                  Example: <code className="text-emerald-400">play hoodtrap</code> or <code className="text-emerald-400">play lover</code>
                </div>
              </div>
            ),
          });
        } else {
          const matched = ORIGINAL_TRACKS.find(
            (t) =>
              t.id.toLowerCase().includes(trackQuery) ||
              t.title.toLowerCase().includes(trackQuery) ||
              t.genre.toLowerCase().includes(trackQuery)
          );

          if (matched) {
            useAudioStore.getState().playTrack(matched);
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
                     ▂▃▅▆▇█▇▆▅▃▂ ▂▃▅▆▇█▇▆▅▃▂ ▂▃▅▆▇█▇▆▅▃▂ [LIVE AUDIO SPECTRUM]
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1 italic">
                    Audio is streaming live through the desktop player and Menubar.
                  </div>
                </div>
              ),
            });
          } else {
            newLines.push({
              id: Math.random().toString(),
              type: 'error',
              text: `play: Track matching "${trackQuery}" not found. Type "play" with no arguments to list all tracks.`,
            });
          }
        }
        break;

      case 'matrix':
        setIsMatrixMode(true);
        return;

      case 'clear':
        setHistory([]);
        return;

      case 'sudo':
        if (args.join(' ').includes('rm -rf')) {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: '⚠️ Nice try! System Integrity Protection (SIP) prevented destruction of the portfolio universe. 🦆',
          });
        } else {
          newLines.push({
            id: Math.random().toString(),
            type: 'error',
            text: 'sudo: visitor is not in the sudoers file. This incident will be reported to the ducks.',
          });
        }
        break;

      case 'exit':
        closeWindow('terminal');
        return;

      default:
        newLines.push({
          id: Math.random().toString(),
          type: 'error',
          text: `zsh: command not found: ${commandName}. Type "help" to see available commands.`,
        });
        break;
    }

    setHistory((prev) => [...prev, ...newLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className="relative h-full w-full bg-[#18181b] text-neutral-200 font-mono text-xs p-4 flex flex-col select-text cursor-text overflow-hidden"
    >
      {/* Matrix Mode Full Canvas Overlay */}
      {isMatrixMode && (
        <div
          onClick={() => setIsMatrixMode(false)}
          className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center cursor-pointer"
        >
          <canvas ref={matrixCanvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-3 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/50 text-emerald-400 text-[11px] font-mono tracking-wider shadow-lg animate-pulse z-40 select-none">
            [ MATRIX RAIN ACTIVATED — PRESS ANY KEY OR CLICK TO EXIT ]
          </div>
        </div>
      )}

      {/* Scrollable output container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col gap-1.5 custom-scrollbar pr-1">
        {history.map((line) => {
          if (line.type === 'input') {
            return (
              <div key={line.id} className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold shrink-0">visitor@macbook-pro ~ %</span>
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
          <span className="text-cyan-400 font-semibold shrink-0">visitor@macbook-pro ~ %</span>
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
    </div>
  );
};
