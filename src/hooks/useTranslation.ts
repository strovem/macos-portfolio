'use client';

import { useSettingsStore } from '@/stores/useSettingsStore';
import { TRANSLATIONS, TranslationKey, Language } from '@/i18n/translations';

export function useTranslation() {
  const language = useSettingsStore((state) => state.language) || 'tr';
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const toggleLanguage = useSettingsStore((state) => state.toggleLanguage);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.tr;
    let text: string = dict[key] || TRANSLATIONS.en[key] || (key as string);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}
