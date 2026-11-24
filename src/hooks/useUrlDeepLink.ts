'use client';

import { useEffect, useRef } from 'react';
import { useWindowStore, FinderSection } from '@/stores/useWindowStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { AppId } from '@/types/os';
import { APPS } from '@/data/apps';

const VALID_APP_IDS: AppId[] = [
  'finder',
  'safari',
  'terminal',
  'notes',
  'messages',
  'photos',
  'settings',
  'tonegenerator',
  'studio',
  'trash',
  'instagram',
];

const VALID_FINDER_SECTIONS: FinderSection[] = [
  'recents',
  'downloads',
  'desktop',
  'documents',
  'music',
  'applications',
  'trash',
];

export function useUrlDeepLink() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const openFinderToSection = useWindowStore((s) => s.openFinderToSection);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const windows = useWindowStore((s) => s.windows);
  const finderSection = useWindowStore((s) => s.finderSection);

  const initialParsedRef = useRef(false);

  // 1. Initial mount: Parse query params and open targeted app/section
  useEffect(() => {
    if (typeof window === 'undefined' || initialParsedRef.current) return;
    initialParsedRef.current = true;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const appParam = searchParams.get('app')?.toLowerCase() as AppId | null;
      const sectionParam = searchParams.get('section')?.toLowerCase() as FinderSection | null;

      if (appParam && VALID_APP_IDS.includes(appParam)) {
        if (appParam === 'finder' && sectionParam && VALID_FINDER_SECTIONS.includes(sectionParam)) {
          openFinderToSection(sectionParam);
        } else {
          openWindow(appParam);
        }
        focusWindow(appParam);
      }
    } catch {
      // ignore
    }
  }, [openWindow, focusWindow, openFinderToSection]);

  // 2. Synchronize active window state with browser URL using replaceState (does not pollute history)
  useEffect(() => {
    if (typeof window === 'undefined' || !initialParsedRef.current) return;

    try {
      const activeWin = activeWindowId ? windows[activeWindowId] : null;
      const isTargetActive = Boolean(activeWin && activeWin.isOpen && !activeWin.isMinimized);

      const url = new URL(window.location.href);

      if (isTargetActive && activeWindowId) {
        url.searchParams.set('app', activeWindowId);
        if (activeWindowId === 'finder' && finderSection) {
          url.searchParams.set('section', finderSection);
        } else {
          url.searchParams.delete('section');
        }
      } else {
        url.searchParams.delete('app');
        url.searchParams.delete('section');
      }

      window.history.replaceState(null, '', url.pathname + url.search);
    } catch {
      // ignore
    }
  }, [activeWindowId, windows, finderSection]);
}

/**
 * Copies a direct shareable portfolio deep link to clipboard and triggers a macOS toast notification
 */
export async function copyPortfolioDeepLink(appId: AppId, section?: FinderSection) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('app', appId);
  if (appId === 'finder' && section) {
    url.searchParams.set('section', section);
  }

  const appMeta = APPS.find((a) => a.id === appId);
  const appName = appMeta ? appMeta.title : appId;

  try {
    await navigator.clipboard.writeText(url.toString());
    useNotificationStore.getState().pushNotification({
      title: 'Bağlantı Kopyalandı 🔗',
      message: `${appName}${section ? ` (${section})` : ''} için doğrudan link panoya kopyalandı.`,
      appId: appId,
      duration: 3500,
    });
  } catch {
    useNotificationStore.getState().pushNotification({
      title: 'Bağlantı Hazır',
      message: url.toString(),
      appId: appId,
      duration: 5000,
    });
  }
}
