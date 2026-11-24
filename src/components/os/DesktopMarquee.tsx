'use client';

import React, { useEffect, useRef } from 'react';

interface DesktopMarqueeProps {
  onSelectionChange?: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export const DesktopMarquee: React.FC<DesktopMarqueeProps> = ({
  disabled = false,
  onSelectionChange,
}) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    // Disabled on mobile viewports (<768px)
    if (window.innerWidth < 768) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Only primary mouse button (left-click)
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;

      // Ignore if clicking on interactive OS chrome
      if (
        target.closest('[data-window]') ||
        target.closest('[data-dock]') ||
        target.closest('[data-desktop-item]') ||
        target.closest('[data-context-menu]') ||
        target.closest('[data-modal]') ||
        target.closest('header') ||
        target.closest('button') ||
        target.closest('input')
      ) {
        return;
      }

      // Clear any previous selection on single click on empty desktop
      document.querySelectorAll('[data-desktop-item="true"]').forEach((el) => {
        el.removeAttribute('data-selected');
        el.classList.remove('ring-2', 'ring-[#007AFF]', 'ring-offset-2', 'ring-offset-transparent', 'shadow-xl');
      });
      onSelectionChange?.([]);

      isDraggingRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };

      if (marqueeRef.current) {
        marqueeRef.current.style.display = 'none';
        marqueeRef.current.style.left = `${e.clientX}px`;
        marqueeRef.current.style.top = `${e.clientY}px`;
        marqueeRef.current.style.width = '0px';
        marqueeRef.current.style.height = '0px';
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !marqueeRef.current) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const deltaX = currentX - startPosRef.current.x;
      const deltaY = currentY - startPosRef.current.y;
      const distance = Math.hypot(deltaX, deltaY);

      // Only show marquee if dragged more than 5px to avoid click jitter
      if (distance < 5) return;

      const left = Math.min(startPosRef.current.x, currentX);
      const top = Math.min(startPosRef.current.y, currentY);
      const width = Math.abs(deltaX);
      const height = Math.abs(deltaY);

      marqueeRef.current.style.display = 'block';
      marqueeRef.current.style.left = `${left}px`;
      marqueeRef.current.style.top = `${top}px`;
      marqueeRef.current.style.width = `${width}px`;
      marqueeRef.current.style.height = `${height}px`;

      // Check collision with desktop items
      const marqueeRect = { left, top, right: left + width, bottom: top + height };
      const desktopItems = document.querySelectorAll<HTMLElement>('[data-desktop-item="true"]');
      const newlySelectedIds: string[] = [];

      desktopItems.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const isIntersecting = !(
          marqueeRect.left > itemRect.right ||
          marqueeRect.right < itemRect.left ||
          marqueeRect.top > itemRect.bottom ||
          marqueeRect.bottom < itemRect.top
        );

        const itemId = item.getAttribute('data-item-id') || item.id;

        if (isIntersecting) {
          item.setAttribute('data-selected', 'true');
          item.classList.add('ring-2', 'ring-[#007AFF]', 'ring-offset-2', 'ring-offset-transparent', 'shadow-xl');
          if (itemId) newlySelectedIds.push(itemId);
        } else {
          item.removeAttribute('data-selected');
          item.classList.remove('ring-2', 'ring-[#007AFF]', 'ring-offset-2', 'ring-offset-transparent', 'shadow-xl');
        }
      });

      onSelectionChange?.(newlySelectedIds);
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (marqueeRef.current) {
        marqueeRef.current.style.display = 'none';
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [disabled, onSelectionChange]);

  if (disabled) return null;

  return (
    <div
      ref={marqueeRef}
      style={{
        display: 'none',
        position: 'fixed',
        border: '1px solid rgba(0, 122, 255, 0.8)',
        backgroundColor: 'rgba(0, 122, 255, 0.16)',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 40,
        boxShadow: '0 0 12px rgba(0, 122, 255, 0.25)',
      }}
    />
  );
};
