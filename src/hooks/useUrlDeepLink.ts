'use client';

import { useEffect, useRef } from 'react';
import { useWindowStore, FinderSection } from '@/stores/useWindowStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { AppId } from '@/types/os';
import { APPS } from '@/data/apps';
import { PRESENTATIONS } from '@/data/presentations';

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
  'powerpoint',
  'trash',
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

  const initialParsedRef = useRef(false);

  // 1. Initial mount: If user lands with query params (?app=...), handle it once cleanly
  useEffect(() => {
    if (typeof window === 'undefined' || initialParsedRef.current) return;
    initialParsedRef.current = true;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const appParam = searchParams.get('app')?.toLowerCase() as AppId | null;
      const sectionParam = searchParams.get('section')?.toLowerCase() as FinderSection | null;
      const deckParam = searchParams.get('deck')?.trim() || null;

      if (appParam && VALID_APP_IDS.includes(appParam)) {
        if (appParam === 'finder' && sectionParam && VALID_FINDER_SECTIONS.includes(sectionParam)) {
          openFinderToSection(sectionParam);
        } else if (appParam === 'powerpoint') {
          const matchingDeck = deckParam
            ? PRESENTATIONS.find((d) => d.slug === deckParam || d.id === deckParam)
            : null;
          useWindowStore.getState().setActivePresentationSlug(matchingDeck ? matchingDeck.slug : null);
          openWindow('powerpoint');
        } else {
          openWindow(appParam);
        }
        focusWindow(appParam);

        // Clean the URL query params immediately so the address bar remains clean and error-free
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch {
      // ignore
    }
  }, [openWindow, focusWindow, openFinderToSection]);
}

/**
 * Copies a direct shareable portfolio deep link to clipboard and triggers a macOS toast notification
 */
export async function copyPortfolioDeepLink(
  appId: AppId,
  _section?: FinderSection,
  deckSlug?: string
) {
  if (typeof window === 'undefined') return;

  const language = useSettingsStore.getState().language;
  const baseUrl = window.location.origin + window.location.pathname;
  const cleanUrl =
    appId === 'powerpoint'
      ? deckSlug
        ? `${baseUrl}?app=powerpoint&deck=${encodeURIComponent(deckSlug)}`
        : `${baseUrl}?app=powerpoint`
      : baseUrl;

  const appMeta = APPS.find((a) => a.id === appId);
  const appName = appMeta ? appMeta.title : appId;

  try {
    await navigator.clipboard.writeText(cleanUrl);
    useNotificationStore.getState().pushNotification({
      title: language === 'tr' ? 'Bağlantı Kopyalandı' : 'Link Copied',
      message:
        language === 'tr'
          ? `${appName} portfolyo bağlantısı panoya kopyalandı.`
          : `Portfolio link for ${appName} copied to clipboard.`,
      appId: appId,
      duration: 3500,
    });
  } catch {
    useNotificationStore.getState().pushNotification({
      title: language === 'tr' ? 'Bağlantı Hazır' : 'Link Ready',
      message: cleanUrl,
      appId: appId,
      duration: 5000,
    });
  }
}
