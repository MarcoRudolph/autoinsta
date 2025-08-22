'use client';

import { useState, useEffect } from 'react';
import { locales } from '../config/i18n';

interface LanguageSwitcherProps {
  onLocaleChange?: (locale: string) => void;
  userId?: string; // Add userId prop for database updates
}

export default function LanguageSwitcher({ onLocaleChange, userId }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en';
    setCurrentLocale(savedLocale);
    onLocaleChange?.(savedLocale);
  }, [onLocaleChange]);

  const switchLocale = async (newLocale: string) => {
    setCurrentLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    onLocaleChange?.(newLocale);

    // Update locale in database if userId is provided
    if (userId) {
      try {
        const response = await fetch('/api/update-user-locale', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ locale: newLocale, userId }),
        });

        if (!response.ok) {
          console.error('Failed to update user locale in database');
        }
      } catch (error) {
        console.error('Error updating user locale:', error);
      }
    }
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
