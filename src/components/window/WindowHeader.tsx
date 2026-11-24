'use client';

import React from 'react';
import { DragControls } from 'framer-motion';
import { TrafficLights } from './TrafficLights';
import { AppIcon } from '@/components/dock/AppIcon';
import { AppMetadata } from '@/data/apps';
import { TilePosition } from '@/types/os';

export interface WindowHeaderProps {
  title: string;
  icon?: string;
  isActive?: boolean;
  isMaximized?: boolean;
  isMobile?: boolean;
  tilePosition?: TilePosition;
  dragControls?: DragControls;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onTile?: (tile: 'left' | 'right' | 'full' | 'center' | 'restore') => void;
  onFocus?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function WindowHeader({
  title,
  icon,
  isActive = true,
  isMaximized = false,
  isMobile = false,
  tilePosition,
  dragControls,
  onClose,
  onMinimize,
  onMaximize,
  onTile,
  onFocus,
  className = '',
  children,
}: WindowHeaderProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    // Don't start drag if clicking on interactive controls (traffic lights or custom buttons)
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) {
      return;
    }
    onFocus?.();
    dragControls?.start(e);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={(e) => {
        if (isMobile) return;
        // Only toggle maximize if double clicked on the header bar itself, not buttons
        if (!(e.target as HTMLElement).closest('button, a, input')) {
          onMaximize?.();
        }
      }}
      className={`relative h-10 px-3.5 flex items-center justify-between select-none cursor-default border-b border-black/5 dark:border-white/5 transition-colors ${
        isActive
          ? 'bg-neutral-100/70 dark:bg-neutral-800/70'
          : 'bg-neutral-100/40 dark:bg-neutral-800/40'
      } ${className}`}
    >
      {/* Left: Traffic Lights */}
      <div className="flex items-center min-w-[60px] z-10">
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMaximized={isMaximized}
          isActive={isActive}
          onTile={onTile}
          tilePosition={tilePosition}
        />
      </div>

      {/* Center: Window Title and optional icon */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isMobile ? 'px-20' : 'px-20'}`}>
        <div className="flex items-center gap-1.5 truncate max-w-full">
          {icon && (
            <div className="w-4 h-4 shrink-0">
              <AppIcon iconType={icon as AppMetadata['iconType']} />
            </div>
          )}
          <span
            className={`text-xs font-semibold tracking-tight truncate transition-colors ${
              isActive
                ? 'text-slate-800 dark:text-neutral-100'
                : 'text-slate-400 dark:text-neutral-500'
            }`}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Right: Close/Done button on mobile or custom controls */}
      <div className="flex items-center justify-end gap-2 min-w-[60px] z-10">
        {children}
        {isMobile && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Close window"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 hover:bg-black/20 dark:hover:bg-white/25 active:scale-95 transition-all text-xs font-medium text-slate-800 dark:text-neutral-100 cursor-pointer pointer-events-auto"
          >
            <span>✕</span>
            <span>Done</span>
          </button>
        )}
      </div>
    </div>
  );
}
