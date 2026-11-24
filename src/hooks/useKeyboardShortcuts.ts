'use client';

import { useEffect, useRef } from 'react';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { useAppSwitcherStore } from '@/stores/useAppSwitcherStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { useMissionControlStore } from '@/stores/useMissionControlStore';
import { useLockStore } from '@/stores/useLockStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { AppId } from '@/types/os';

export function useKeyboardShortcuts() {
  const toggleSpotlight = useSpotlightStore((s) => s.toggleSpotlight);
  const closeSpotlight = useSpotlightStore((s) => s.closeSpotlight);
  const isSpotlightOpen = useSpotlightStore((s) => s.isOpen);

  const closeContextMenu = useContextMenuStore((s) => s.closeContextMenu);
  const isContextMenuOpen = useContextMenuStore((s) => s.isOpen);

  const isSwitcherOpen = useAppSwitcherStore((s) => s.isOpen);
  const openSwitcher = useAppSwitcherStore((s) => s.openSwitcher);
  const selectNext = useAppSwitcherStore((s) => s.selectNext);
  const selectPrev = useAppSwitcherStore((s) => s.selectPrev);
  const closeSwitcher = useAppSwitcherStore((s) => s.closeSwitcher);

  const isMissionControlOpen = useMissionControlStore((s) => s.isOpen);
  const closeMissionControl = useMissionControlStore((s) => s.closeMissionControl);
  const toggleMissionControl = useMissionControlStore((s) => s.toggleMissionControl);

  const lock = useLockStore((s) => s.lock);
  const isLocked = useLockStore((s) => s.isLocked);
  const isSleeping = useLockStore((s) => s.isSleeping);

  const isCenterOpen = useNotificationStore((s) => s.isCenterOpen);
  const closeCenter = useNotificationStore((s) => s.closeCenter);

  const altKeyHeldRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If system is sleeping or locked, do not intercept desktop shortcuts
      if (isSleeping || isLocked) return;

      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          Boolean(target.closest('[contenteditable="true"]')));

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // 1. Esc Key — Close modals in priority order: Spotlight > ContextMenu > Switcher > MissionControl > NotificationCenter
      if (e.key === 'Escape') {
        if (isSpotlightOpen) {
          e.preventDefault();
          closeSpotlight();
          return;
        }
        if (isContextMenuOpen) {
          e.preventDefault();
          closeContextMenu();
          return;
        }
        if (isSwitcherOpen) {
          e.preventDefault();
          closeSwitcher();
          return;
        }
        if (isMissionControlOpen) {
          e.preventDefault();
          closeMissionControl();
          return;
        }
        if (isCenterOpen) {
          e.preventDefault();
          closeCenter();
          return;
        }
      }

      // 2. Mission Control: F3 OR Alt/Ctrl + ArrowUp (without Shift)
      if (e.key === 'F3' || (!e.shiftKey && (e.altKey || e.ctrlKey) && e.key === 'ArrowUp')) {
        e.preventDefault();
        toggleMissionControl();
        return;
      }

      // 3. Lock Screen: Alt + L OR Ctrl + Cmd + Q
      if ((e.altKey && (e.key === 'l' || e.key === 'L')) || (e.ctrlKey && e.metaKey && (e.key === 'q' || e.key === 'Q'))) {
        e.preventDefault();
        lock();
        return;
      }

      // 4. Spotlight: Cmd/Ctrl + K OR Cmd/Ctrl + Space
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K' || e.code === 'Space')) {
        e.preventDefault();
        toggleSpotlight();
        return;
      }

      // If user is actively typing in an input/textarea/contenteditable, skip remaining window shortcuts
      if (isInput) return;

      const { activeWindowId, windows, closeWindow, minimizeWindow } = useWindowStore.getState();

      // 5. Close Active Window: Alt + W (or Cmd/Ctrl + W)
      if ((e.altKey && (e.key === 'w' || e.key === 'W')) || (isCmdOrCtrl && (e.key === 'w' || e.key === 'W'))) {
        if (activeWindowId && windows[activeWindowId]?.isOpen) {
          e.preventDefault();
          closeWindow(activeWindowId);
          return;
        }
      }

      // 6. Minimize Active Window: Alt + M (or Cmd/Ctrl + M)
      if ((e.altKey && (e.key === 'm' || e.key === 'M')) || (isCmdOrCtrl && (e.key === 'm' || e.key === 'M'))) {
        if (activeWindowId && windows[activeWindowId]?.isOpen) {
          e.preventDefault();
          minimizeWindow(activeWindowId);
          return;
        }
      }

      // 6.1 Sequoia Window Tiling: Alt + ArrowLeft (Tile Left), Alt + ArrowRight (Tile Right), Alt + Shift + ArrowUp (Fill/Restore)
      if (e.altKey && activeWindowId && windows[activeWindowId]?.isOpen) {
        const { tileWindow } = useWindowStore.getState();
        if (e.shiftKey && e.key === 'ArrowUp') {
          e.preventDefault();
          const targetWin = windows[activeWindowId];
          const isTiledOrMax = targetWin.isMaximized || Boolean(targetWin.tilePosition);
          tileWindow(activeWindowId, isTiledOrMax ? 'restore' : 'full');
          return;
        }
        if (!e.shiftKey && e.key === 'ArrowLeft') {
          e.preventDefault();
          tileWindow(activeWindowId, 'left');
          return;
        }
        if (!e.shiftKey && e.key === 'ArrowRight') {
          e.preventDefault();
          tileWindow(activeWindowId, 'right');
          return;
        }
      }

      // 7. Alt + Tab: App Switcher HUD
      if (e.altKey && (e.key === 'Tab' || e.code === 'Tab')) {
        e.preventDefault();
        altKeyHeldRef.current = true;

        if (!isSwitcherOpen) {
          // Get all currently open apps
          const openAppIds = (Object.keys(windows) as AppId[]).filter(
            (id) => windows[id].isOpen
          );

          if (openAppIds.length > 0) {
            openSwitcher(openAppIds);
          }
        } else {
          // If already open, cycle next/prev
          if (e.shiftKey) {
            selectPrev();
          } else {
            selectNext();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // When Alt is released, close App Switcher and activate chosen app
      if (e.key === 'Alt') {
        altKeyHeldRef.current = false;
        if (isSwitcherOpen) {
          const chosen = closeSwitcher();
          if (chosen) {
            const { openWindow, focusWindow } = useWindowStore.getState();
            openWindow(chosen);
            focusWindow(chosen);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isSpotlightOpen,
    isContextMenuOpen,
    isSwitcherOpen,
    isMissionControlOpen,
    isCenterOpen,
    isLocked,
    isSleeping,
    toggleSpotlight,
    closeSpotlight,
    closeContextMenu,
    openSwitcher,
    selectNext,
    selectPrev,
    closeSwitcher,
    toggleMissionControl,
    closeMissionControl,
    closeCenter,
    lock,
  ]);
}
