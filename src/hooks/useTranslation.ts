'use client';

import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TRANSLATIONS, TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  const language = useSettingsStore((state) => state.language) || 'tr';
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const toggleLanguage = useSettingsStore((state) => state.toggleLanguage);

  // Stable reference: only recreated when language changes.
  // Without useCallback, t() is a new function on every render which
  // causes any useEffect([..., t]) that depends on it to re-run infinitely.
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.tr;
      let text: string = dict[key] || TRANSLATIONS.en[key] || (key as string);

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return text;
    },
    [language]
  );

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}
