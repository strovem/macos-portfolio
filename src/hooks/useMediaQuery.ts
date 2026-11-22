'use client';

import { useState, useEffect } from 'react';

/**
 * Hydration-safe hook that returns true if the media query matches.
 * Defaults to false on initial render/SSR to prevent hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older Safari/WebKit environments
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Detects mobile viewports (< 768px).
 * Hydration-safe: returns false on server, updates on client mount.
 */
export function useIsMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint}px)`);
}

/**
 * Detects touch-capable devices (pointer: coarse or touch points).
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(hasTouch);
  }, []);

  return isTouch;
}
