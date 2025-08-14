'use client';

import { useState, useEffect } from 'react';
import { locales } from '../config/i18n';

interface LanguageSwitcherProps {
  onLocaleChange?: (locale: string) => void;
}

export default function LanguageSwitcher({ onLocaleChange }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en';
    setCurrentLocale(savedLocale);
    onLocaleChange?.(savedLocale);
  }, [onLocaleChange]);

  const switchLocale = (newLocale: string) => {
    setCurrentLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    onLocaleChange?.(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentLocale === locale
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {locale === 'en' ? '🇺🇸 EN' : '🇩🇪 DE'}
        </button>
      ))}
    </div>
  );
}
