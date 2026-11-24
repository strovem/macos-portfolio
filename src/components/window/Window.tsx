'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { AppId, WindowState, TilePosition } from '@/types/os';
import { useWindowStore } from '@/stores/useWindowStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { WindowHeader } from './WindowHeader';
import { AppIcon } from '@/components/dock/AppIcon';
import { AppMetadata } from '@/data/apps';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { playDropSnapSound } from '@/utils/soundEffects';

export interface WindowContextType {
  id: AppId;
  isActive: boolean;
  isMaximized: boolean;
  isMobile: boolean;
  tilePosition?: TilePosition;
  dragControls: ReturnType<typeof useDragControls>;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onTile?: (tile: 'left' | 'right' | 'full' | 'center' | 'restore') => void;
  onFocus: () => void;
}

export const WindowContext = React.createContext<WindowContextType | null>(null);

export interface WindowProps {
  id: AppId;
  window?: WindowState;
  title?: string;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  hideHeader?: boolean;
}

export function Window({
  id,
  window: propWindow,
  title,
  icon,
  children,
  className = '',
  headerContent,
  hideHeader = false,
}: WindowProps) {
  const storeWindow = useWindowStore((state) => state.windows[id]);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const updateSize = useWindowStore((state) => state.updateSize);
  const tileWindow = useWindowStore((state) => state.tileWindow);
  const unsnapWindow = useWindowStore((state) => state.unsnapWindow);
  const setSnapPreviewZone = useWindowStore((state) => state.setSnapPreviewZone);
  const stageWindowIds = useWindowStore((state) => state.stageWindowIds);
  const isDesktopPeeked = useWindowStore((state) => state.isDesktopPeeked);
  const setDesktopPeeked = useWindowStore((state) => state.setDesktopPeeked);
  const stageManagerEnabled = useSettingsStore((state) => state.stageManagerEnabled);

  const windowData = propWindow || storeWindow;

  const [isResizing, setIsResizing] = useState(false);
  const [isWideDesktop, setIsWideDesktop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const dragControls = useDragControls();
  const isMobile = useIsMobile();

  const isWindowInStage = !stageManagerEnabled || isMobile || stageWindowIds.includes(id);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsWideDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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
      const leftOffset = stageManagerEnabled && isWideDesktop ? 172 : 12;
      posX.set(leftOffset);
      posY.set(32);
    } else {
      posX.set(windowData.position.x);
      posY.set(windowData.position.y);
    }
  }, [isMobile, isMaximized, stageManagerEnabled, isWideDesktop, windowData?.position.x, windowData?.position.y, posX, posY]);

  if (!windowData || !windowData.isOpen) {
    return null;
  }

  const handlePointerDown = () => {
    if (!isActive) {
      focusWindow(id);
    }
  };

  const handleDragStart = () => {
    if (isMobile) return;
    if (windowData.tilePosition || windowData.isMaximized) {
      unsnapWindow(id);
    }
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
    if (isMobile) return;
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isStageActive = stageManagerEnabled && winWidth >= 1024;
    const leftSnapEdge = isStageActive ? 184 : 16;
    const { x, y } = info.point;

    let zone: 'left' | 'right' | 'top' | null = null;
    if (x <= leftSnapEdge) {
      zone = 'left';
    } else if (x >= winWidth - 16) {
      zone = 'right';
    } else if (y <= 38 + 12) {
      zone = 'top';
    }

    setSnapPreviewZone(zone);
  };

  const handleDragEnd = () => {
    if (isMobile) return;

    const snapZone = useWindowStore.getState().snapPreviewZone;
    setSnapPreviewZone(null);

    if (snapZone) {
      playDropSnapSound();
      tileWindow(id, snapZone === 'top' ? 'full' : snapZone);
      return;
    }

    const curX = posX.get();
    const curY = posY.get();

    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isStageActive = stageManagerEnabled && winWidth >= 1024;

    // Viewport clamp bounds:
    // Window header must remain below top Menubar (y >= 32px)
    // In Stage Manager mode, keep window clear of the 164px left strip
    const minX = isStageActive ? 172 : -windowData.size.width + 120;
    const maxX = winWidth - 120;
    const minY = 32;
    const maxY = winHeight - 90;

    const clampedX = Math.round(Math.max(minX, Math.min(maxX, curX)));
    const clampedY = Math.round(Math.max(minY, Math.min(maxY, curY)));

    posX.set(clampedX);
    posY.set(clampedY);
    updatePosition(id, { x: clampedX, y: clampedY });
  };

  type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>, dir: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);
    setIsResizing(true);

    const cursorMap: Record<ResizeDirection, string> = {
      n: 'n-resize',
      s: 's-resize',
      e: 'e-resize',
      w: 'w-resize',
      ne: 'ne-resize',
      nw: 'nw-resize',
      se: 'se-resize',
      sw: 'sw-resize',
    };

    if (typeof document !== 'undefined') {
      document.body.style.cursor = cursorMap[dir];
      document.body.style.userSelect = 'none';
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowData.size.width;
    const startHeight = windowData.size.height;
    const startPosX = posX.get();
    const startPosY = posY.get();

    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1600;
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
    const isStageActive = stageManagerEnabled && winWidth >= 1024;
    const minPosX = isStageActive ? 172 : 0;

    const minWidth = 360;
    const minHeight = 240;
    const maxWidth = isStageActive ? Math.max(minWidth, winWidth - 184) : Math.max(minWidth, winWidth - 24);
    const maxHeight = Math.max(minHeight, winHeight - 60);

    let latestWidth = startWidth;
    let latestHeight = startHeight;
    let latestPosX = startPosX;
    let latestPosY = startPosY;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      // Horizontal resize
      if (dir === 'e' || dir === 'ne' || dir === 'se') {
        const rightLimitWidth = Math.min(maxWidth, winWidth - startPosX - 12);
        newWidth = Math.round(Math.max(minWidth, Math.min(Math.max(minWidth, rightLimitWidth), startWidth + deltaX)));
      } else if (dir === 'w' || dir === 'nw' || dir === 'sw') {
        const potentialWidth = startWidth - deltaX;
        const potentialPosX = startPosX + deltaX;
        if (potentialPosX < minPosX) {
          newPosX = minPosX;
          newWidth = Math.round(Math.max(minWidth, Math.min(maxWidth, startPosX + startWidth - minPosX)));
        } else if (potentialWidth >= minWidth && potentialWidth <= maxWidth) {
          newWidth = Math.round(potentialWidth);
          newPosX = Math.round(potentialPosX);
        } else if (potentialWidth < minWidth) {
          newWidth = minWidth;
          newPosX = Math.round(startPosX + (startWidth - minWidth));
        } else {
          newWidth = maxWidth;
          newPosX = Math.round(startPosX + (startWidth - maxWidth));
        }
      }

      // Vertical resize (clamp top to Menubar height >= 28px)
      if (dir === 's' || dir === 'se' || dir === 'sw') {
        newHeight = Math.round(Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY)));
      } else if (dir === 'n' || dir === 'ne' || dir === 'nw') {
        const potentialHeight = startHeight - deltaY;
        const potentialPosY = startPosY + deltaY;
        if (potentialHeight >= minHeight && potentialPosY >= 28) {
          newHeight = Math.round(potentialHeight);
          newPosY = Math.round(potentialPosY);
        } else if (potentialPosY < 28) {
          const allowedDeltaY = 28 - startPosY;
          newHeight = Math.round(Math.max(minHeight, Math.min(maxHeight, startHeight - allowedDeltaY)));
          newPosY = 28;
        } else if (potentialHeight < minHeight) {
          newHeight = minHeight;
          newPosY = Math.round(startPosY + (startHeight - minHeight));
        } else {
          newHeight = maxHeight;
          newPosY = Math.round(startPosY + (startHeight - maxHeight));
        }
      }

      latestWidth = newWidth;
      latestHeight = newHeight;
      latestPosX = newPosX;
      latestPosY = newPosY;

      posX.set(newPosX);
      posY.set(newPosY);
      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`;
        containerRef.current.style.height = `${newHeight}px`;
      }
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
      if (latestPosX !== startPosX || latestPosY !== startPosY) {
        updatePosition(id, { x: latestPosX, y: latestPosY });
      }
      if (latestWidth !== startWidth || latestHeight !== startHeight) {
        updateSize(id, { width: latestWidth, height: latestHeight });
      }
      cleanup();
    };

    if (resizeCleanupRef.current) {
      resizeCleanupRef.current();
    }

    resizeCleanupRef.current = cleanup;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const maximizedWidth = stageManagerEnabled && isWideDesktop ? 'calc(100vw - 184px)' : 'calc(100vw - 24px)';

  return (
    <motion.div
      ref={containerRef}
      drag={!isMaximized && !isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      style={
        isMobile
          ? {
              position: 'fixed',
              top: 28,
              left: 0,
              right: 0,
              bottom: 'calc(54px + env(safe-area-inset-bottom, 0px))',
              width: '100%',
              height: 'calc(100dvh - 82px - env(safe-area-inset-bottom, 0px))',
              touchAction: 'pan-y',
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
              width: isMaximized ? maximizedWidth : windowData.size.width,
              height: isMaximized ? 'calc(100vh - 116px)' : windowData.size.height,
              zIndex: windowData.zIndex,
            }
      }
      className={`select-none ${!isWindowInStage ? 'pointer-events-none' : 'pointer-events-auto'} ${
        isResizing ? '' : 'transition-[width,height] duration-200 ease-out'
      }`}
      data-window="true"
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
            : isWindowInStage
            ? isDesktopPeeked
              ? { x: 220, scale: 0.96, opacity: 0.38, y: 0 }
              : { x: 0, scale: 1, opacity: 1, y: 0 }
            : { x: -260, scale: 0.75, opacity: 0, y: 0 }
        }
        exit={
          isMobile
            ? { y: '100%', opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }
            : { scale: 0.85, opacity: 0, y: 35, transition: { duration: 0.18, ease: 'easeIn' } }
        }
        transition={
          isMobile
            ? { type: 'spring', damping: 28, stiffness: 300 }
            : { type: 'spring', stiffness: 360, damping: 28 }
        }
        onClick={() => {
          if (stageManagerEnabled && isDesktopPeeked) {
            setDesktopPeeked(false);
          }
        }}
        className={`w-full h-full flex flex-col ${
          isMobile ? 'rounded-t-2xl rounded-b-none border-t border-x' : 'rounded-xl border'
        } overflow-hidden glass-panel backdrop-blur-2xl transition-all duration-200 ${
          isActive
            ? 'shadow-2xl ring-1 ring-white/30 dark:ring-white/15 border-black/20 dark:border-white/20'
            : 'shadow-md opacity-[0.96] border-black/10 dark:border-white/10'
        } ${className}`}
      >
        {/* Title Bar Header with Drag Controls & Traffic Lights / Mobile Done */}
        {!hideHeader && (
          <WindowHeader
            title={title || windowData.title}
            icon={icon || windowData.icon}
            isActive={isActive}
            isMaximized={isMaximized}
            isMobile={isMobile}
            tilePosition={windowData.tilePosition}
            dragControls={dragControls}
            onClose={() => closeWindow(id)}
            onMinimize={() => minimizeWindow(id)}
            onMaximize={() => maximizeWindow(id)}
            onTile={(tile) => tileWindow(id, tile)}
            onFocus={() => focusWindow(id)}
          >
            {headerContent}
          </WindowHeader>
        )}

        {/* Window Content Body */}
        <WindowContext.Provider
          value={{
            id,
            isActive,
            isMaximized,
            isMobile,
            tilePosition: windowData.tilePosition,
            dragControls,
            onClose: () => closeWindow(id),
            onMinimize: () => minimizeWindow(id),
            onMaximize: () => maximizeWindow(id),
            onTile: (tile) => tileWindow(id, tile),
            onFocus: () => focusWindow(id),
          }}
        >
          <div className="flex-1 relative overflow-hidden os-interactive bg-white/70 dark:bg-[#1E1E1E]/80 text-slate-900 dark:text-neutral-100 flex flex-col">
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
        </WindowContext.Provider>

        {/* 8-Way Window Resize Handles (Desktop only) */}
        {!isMaximized && !isMobile && (
          <>
            {/* Edge Handles */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'n')}
              className="absolute top-0 left-3 right-3 h-1.5 cursor-n-resize z-40"
            />
            <div
              onPointerDown={(e) => handleResizeStart(e, 's')}
              className="absolute bottom-0 left-3 right-3 h-1.5 cursor-s-resize z-40"
            />
            <div
              onPointerDown={(e) => handleResizeStart(e, 'w')}
              className="absolute top-3 bottom-3 left-0 w-1.5 cursor-w-resize z-40"
            />
            <div
              onPointerDown={(e) => handleResizeStart(e, 'e')}
              className="absolute top-3 bottom-3 right-0 w-1.5 cursor-e-resize z-40"
            />

            {/* Corner Handles */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'nw')}
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-40"
            />
            <div
              onPointerDown={(e) => handleResizeStart(e, 'ne')}
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-40"
            />
            <div
              onPointerDown={(e) => handleResizeStart(e, 'sw')}
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-40"
            />
            <div
              onPointerDown={(e) => handleResizeStart(e, 'se')}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-40 flex items-end justify-end p-0.5 select-none group"
              title="Resize window"
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
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
