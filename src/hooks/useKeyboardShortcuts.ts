'use client';

import { useEffect, useRef } from 'react';
import { useSpotlightStore } from '@/stores/useSpotlightStore';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { useAppSwitcherStore } from '@/stores/useAppSwitcherStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { AppId } from '@/types/os';

export function useKeyboardShortcuts() {
  const { toggleSpotlight, closeSpotlight, isOpen: isSpotlightOpen } = useSpotlightStore();
  const { closeContextMenu, isOpen: isContextMenuOpen } = useContextMenuStore();
  const {
    isOpen: isSwitcherOpen,
    openSwitcher,
    selectNext,
    selectPrev,
    closeSwitcher,
  } = useAppSwitcherStore();

  const {
    activeWindowId,
    windows,
    closeWindow,
    minimizeWindow,
    openWindow,
    focusWindow,
  } = useWindowStore();

  const altKeyHeldRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          Boolean(target.closest('[contenteditable="true"]')));

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // 1. Esc Key — Close Spotlight or Context Menu
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
      }

      // 2. Spotlight: Cmd/Ctrl + K OR Cmd/Ctrl + Space
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K' || e.code === 'Space')) {
        e.preventDefault();
        toggleSpotlight();
        return;
      }

      // If user is actively typing in an input/textarea/contenteditable, skip remaining window shortcuts
      if (isInput) return;

      // 3. Close Active Window: Alt + W (or Cmd/Ctrl + W)
      if ((e.altKey && (e.key === 'w' || e.key === 'W')) || (isCmdOrCtrl && (e.key === 'w' || e.key === 'W'))) {
        if (activeWindowId && windows[activeWindowId]?.isOpen) {
          e.preventDefault();
          closeWindow(activeWindowId);
          return;
        }
      }

      // 4. Minimize Active Window: Alt + M (or Cmd/Ctrl + M)
      if ((e.altKey && (e.key === 'm' || e.key === 'M')) || (isCmdOrCtrl && (e.key === 'm' || e.key === 'M'))) {
        if (activeWindowId && windows[activeWindowId]?.isOpen) {
          e.preventDefault();
          minimizeWindow(activeWindowId);
          return;
        }
      }

      // 5. Alt + Tab: App Switcher HUD
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
    activeWindowId,
    windows,
    toggleSpotlight,
    closeSpotlight,
    closeContextMenu,
    openSwitcher,
    selectNext,
    selectPrev,
    closeSwitcher,
    closeWindow,
    minimizeWindow,
    openWindow,
    focusWindow,
  ]);
}
