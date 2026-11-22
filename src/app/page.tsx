'use client';

import { useState } from 'react';
import { Wallpaper } from '@/components/desktop/Wallpaper';
import { FloatingBubbles } from '@/components/desktop/FloatingBubbles';
import { Menubar } from '@/components/menubar/Menubar';
import { Dock } from '@/components/dock/Dock';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { AppId } from '@/types/os';

export default function Home() {
  const brightness = useSettingsStore((state) => state.brightness);
  const [activeAppName, setActiveAppName] = useState<string>('Finder');
  const [openAppIds, setOpenAppIds] = useState<AppId[]>(['finder']);

  const handleAppClick = (appId: AppId) => {
    // Format app title for menubar display
    const title = appId.charAt(0).toUpperCase() + appId.slice(1);
    setActiveAppName(title);

    // Track active/open apps
    if (!openAppIds.includes(appId)) {
      setOpenAppIds((prev) => [...prev, appId]);
    }
  };

  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      {/* Dynamic Wallpaper Canvas */}
      <Wallpaper />

      {/* Floating Ambient Glass Bubbles */}
      <FloatingBubbles />

      {/* Screen Brightness Overlay */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-[45] transition-opacity duration-150"
          style={{
            backgroundColor: 'black',
            opacity: ((100 - brightness) / 100) * 0.75,
          }}
        />
      )}

      {/* Menubar (top-0 fixed z-50) */}
      <Menubar activeAppName={activeAppName} />

      {/* Desktop Canvas Root */}
      <div className="absolute inset-0 pt-7 flex flex-col justify-between pointer-events-none z-10">
        {/* Placeholder for Desktop Area */}
        <div className="flex-1 relative pointer-events-auto flex items-center justify-center">
          <div className="text-center p-6 glass-panel rounded-2xl shadow-window max-w-md mx-4">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white mb-2">macOS Web OS Portfolio</h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              Desktop canvas initialized. Core scaffolding, Menubar, and spring-magnified Dock loaded successfully.
            </p>
          </div>
        </div>
      </div>

      {/* Spring-Magnified macOS Dock (bottom-3 fixed z-40) */}
      <Dock openAppIds={openAppIds} onAppClick={handleAppClick} />
    </main>
  );
}
