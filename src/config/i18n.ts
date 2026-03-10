export const locales = ['en', 'de', 'fr', 'es', 'it', 'pt'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

/** Display labels for the language picker (flag + code) */
export const localeLabels: Record<Locale, string> = {
  en: '🇺🇸 EN',
  de: '🇩🇪 DE',
  fr: '🇫🇷 FR',
  es: '🇪🇸 ES',
  it: '🇮🇹 IT',
  pt: '🇵🇹 PT',
};
