'use client';

import { Wallpaper } from '@/components/desktop/Wallpaper';
import { FloatingBubbles } from '@/components/desktop/FloatingBubbles';

export default function Home() {
  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      {/* Dynamic Wallpaper Canvas */}
      <Wallpaper />

      {/* Floating Ambient Glass Bubbles */}
      <FloatingBubbles />

      {/* Desktop Canvas Root */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-10">
        {/* Placeholder for MenuBar */}
        <header className="h-7 w-full glass-panel border-b border-black/5 flex items-center px-4 pointer-events-auto">
          <span className="text-xs font-semibold tracking-wide"> Portfolio OS</span>
        </header>

        {/* Placeholder for Desktop Area */}
        <div className="flex-1 relative pointer-events-auto flex items-center justify-center">
          <div className="text-center p-6 glass-panel rounded-2xl shadow-window max-w-md mx-4">
            <h1 className="text-lg font-bold text-slate-800 mb-2">macOS Web OS Portfolio</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Desktop canvas initialized. Core scaffolding and OS interfaces loaded successfully.
            </p>
          </div>
        </div>

        {/* Placeholder for Dock */}
        <footer className="h-16 w-full flex items-center justify-center pb-2 pointer-events-auto">
          <div className="glass-panel px-4 py-2 rounded-2xl shadow-dock flex items-center space-x-3">
            <span className="text-xs text-slate-600 font-medium">Dock Initialized</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
