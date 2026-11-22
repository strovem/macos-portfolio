'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { AppId, WindowState } from '@/types/os';
import { useWindowStore } from '@/stores/useWindowStore';
import { WindowHeader } from './WindowHeader';
import { AppIcon } from '@/components/dock/AppIcon';
import { AppMetadata } from '@/data/apps';
import { useIsMobile } from '@/hooks/useMediaQuery';

export interface WindowProps {
  id: AppId;
  window?: WindowState;
  title?: string;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
}

export function Window({
  id,
  window: propWindow,
  title,
  icon,
  children,
  className = '',
  headerContent,
}: WindowProps) {
  const storeWindow = useWindowStore((state) => state.windows[id]);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const updateSize = useWindowStore((state) => state.updateSize);

  const windowData = propWindow || storeWindow;

  const [isResizing, setIsResizing] = useState(false);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const dragControls = useDragControls();
  const isMobile = useIsMobile();

  // Safely clean up any active resize listeners when window unmounts
  useEffect(() => {
    return () => {
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
      }
    };
  }, []);

  const isMaximized = windowData?.isMaximized ?? false;
  const isActive = activeWindowId === id;

  // Track position using Framer Motion values for 60fps smooth dragging without state lag
  const posX = useMotionValue(windowData?.position.x ?? 100);
  const posY = useMotionValue(windowData?.position.y ?? 60);

  // Synchronize motion values when position changes in store or when maximized/mobile toggles
  useEffect(() => {
    if (!windowData) return;
    if (isMobile) {
      posX.set(0);
      posY.set(0);
    } else if (isMaximized) {
      posX.set(12);
      posY.set(32);
    } else {
      posX.set(windowData.position.x);
      posY.set(windowData.position.y);
    }
  }, [isMobile, isMaximized, windowData?.position.x, windowData?.position.y, posX, posY]);

  if (!windowData || !windowData.isOpen) {
    return null;
  }

  const handlePointerDown = () => {
    if (!isActive) {
      focusWindow(id);
    }
  };

  const handleDragEnd = () => {
    if (isMaximized || isMobile) return;

    const curX = posX.get();
    const curY = posY.get();

    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Viewport clamp bounds:
    // Window header must remain below top Menubar (y >= 32px)
    // Window must stay reasonably within horizontal boundaries
    const minX = -windowData.size.width + 120;
    const maxX = winWidth - 120;
    const minY = 32;
    const maxY = winHeight - 90;

    const clampedX = Math.round(Math.max(minX, Math.min(maxX, curX)));
    const clampedY = Math.round(Math.max(minY, Math.min(maxY, curY)));

    posX.set(clampedX);
    posY.set(clampedY);
    updatePosition(id, { x: clampedX, y: clampedY });
  };

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);
    setIsResizing(true);

    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'se-resize';
      document.body.style.userSelect = 'none';
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowData.size.width;
    const startHeight = windowData.size.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const minWidth = Math.min(windowData.defaultSize.width, 380);
      const minHeight = Math.min(windowData.defaultSize.height, 260);
      const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 40 : 1600;
      const maxHeight = typeof window !== 'undefined' ? window.innerHeight - 80 : 1000;

      const newWidth = Math.round(Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX)));
      const newHeight = Math.round(Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY)));

      updateSize(id, { width: newWidth, height: newHeight });
    };

    const cleanup = () => {
      setIsResizing(false);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeCleanupRef.current = null;
    };

    const onPointerUp = () => {
      cleanup();
    };

    if (resizeCleanupRef.current) {
      resizeCleanupRef.current();
    }

    resizeCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <motion.div
      drag={!isMaximized && !isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      style={
        isMobile
          ? {
              position: 'fixed',
              top: 32,
              left: 0,
              right: 0,
              bottom: 64,
              width: '100%',
              height: 'calc(100vh - 96px)',
              zIndex: windowData.zIndex,
              x: 0,
              y: 0,
            }
          : {
              position: 'fixed',
              left: 0,
              top: 0,
              x: posX,
              y: posY,
              width: isMaximized ? 'calc(100vw - 24px)' : windowData.size.width,
              height: isMaximized ? 'calc(100vh - 116px)' : windowData.size.height,
              zIndex: windowData.zIndex,
            }
      }
      className={`select-none pointer-events-auto ${
        isResizing ? '' : 'transition-[width,height] duration-200 ease-out'
      }`}
    >
      {/* Inner motion container providing authentic open/close/minimize scale & fade animation or iOS sheet slide-up */}
      <motion.div
        initial={
          isMobile
            ? { y: '100%', opacity: 0 }
            : { scale: 0.9, opacity: 0, y: 15 }
        }
        animate={
          isMobile
            ? { y: 0, opacity: 1 }
            : { scale: 1, opacity: 1, y: 0 }
        }
        exit={
          isMobile
            ? { y: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }
            : { scale: 0.85, opacity: 0, y: 35, transition: { duration: 0.18, ease: 'easeIn' } }
        }
        transition={
          isMobile
            ? { type: 'spring', damping: 28, stiffness: 300 }
            : { type: 'spring', stiffness: 360, damping: 26 }
        }
        className={`w-full h-full flex flex-col ${
          isMobile ? 'rounded-t-2xl rounded-b-none border-t border-x' : 'rounded-xl border'
        } overflow-hidden glass-panel backdrop-blur-2xl transition-shadow duration-200 ${
          isActive
            ? 'shadow-window dark:shadow-2xl border-black/15 dark:border-white/15'
            : 'shadow-lg opacity-[0.98] border-black/10 dark:border-white/10'
        } ${className}`}
      >
        {/* Title Bar Header with Drag Controls & Traffic Lights / Mobile Done */}
        <WindowHeader
          title={title || windowData.title}
          icon={icon || windowData.icon}
          isActive={isActive}
          isMaximized={isMaximized}
          isMobile={isMobile}
          dragControls={dragControls}
          onClose={() => closeWindow(id)}
          onMinimize={() => minimizeWindow(id)}
          onMaximize={() => maximizeWindow(id)}
          onFocus={() => focusWindow(id)}
        >
          {headerContent}
        </WindowHeader>

        {/* Window Content Body */}
        <div className="flex-1 relative overflow-auto os-interactive bg-white/70 dark:bg-[#1E1E1E]/80 text-slate-900 dark:text-neutral-100">
          {children || (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none text-slate-500 dark:text-neutral-400">
              <div className="w-14 h-14 mb-3 drop-shadow-sm">
                <AppIcon iconType={(icon || windowData.icon) as AppMetadata['iconType']} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200 mb-1">
                {title || windowData.title}
              </h3>
              <p className="text-xs max-w-xs text-slate-500 dark:text-neutral-400">
                Application window initialized. Interactivity and subviews loaded.
              </p>
            </div>
          )}
        </div>

        {/* Bottom-right Corner Resize Handle (Desktop only) */}
        {!isMaximized && !isMobile && (
          <div
            onPointerDown={handleResizePointerDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 select-none z-30 group"
            title="Resize window"
            role="separator"
            aria-label="Resize handle"
          >
            <svg
              className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-500 opacity-40 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            >
              <line x1="8" y1="2" x2="2" y2="8" />
              <line x1="9" y1="5" x2="5" y2="9" />
              <line x1="9" y1="8" x2="8" y2="9" />
            </svg>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
