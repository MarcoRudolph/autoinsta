'use client';

import { useState, useEffect } from 'react';
import { locales, localeLabels } from '../config/i18n';
import type { Locale } from '../config/i18n';
import { authedFetch } from '@/lib/auth/authedFetch';

interface LanguageSwitcherProps {
  onLocaleChange?: (locale: string) => void;
  userId?: string;
  /** Compact style for tight spaces (e.g. dropdown) */
  variant?: 'buttons' | 'dropdown';
  /** Tailwind classes for container */
  className?: string;
}

export default function LanguageSwitcher({
  onLocaleChange,
  userId,
  variant = 'buttons',
  className = '',
}: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<string>('en');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'en';
    const validLocale = locales.includes(savedLocale as Locale) ? savedLocale : 'en';
    setCurrentLocale(validLocale);
    onLocaleChange?.(validLocale);
  }, [onLocaleChange]);

  const switchLocale = async (newLocale: string) => {
    setCurrentLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    onLocaleChange?.(newLocale);
    setDropdownOpen(false);

    if (userId) {
      try {
        const response = await authedFetch('/api/update-user-locale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#334269]/60 text-white font-semibold backdrop-blur-md hover:bg-[#334269]/80 transition-all"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label="Select language"
        >
          {localeLabels[currentLocale as Locale] ?? '🇺🇸 EN'}
          <svg
            className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden="true"
              onClick={() => setDropdownOpen(false)}
            />
            <ul
              className="absolute left-0 top-full mt-2 py-2 bg-white dark:bg-[#232946] rounded-lg shadow-xl border border-gray-200 dark:border-[#334269]/30 z-50 min-w-[140px]"
              role="listbox"
            >
              {locales.map((locale) => (
                <li key={locale} role="option" aria-selected={currentLocale === locale}>
                  <button
                    type="button"
                    onClick={() => switchLocale(locale)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      currentLocale === locale
                        ? 'bg-[#334269] text-white font-medium'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1a1f2e]'
                    }`}
                  >
                    {localeLabels[locale]}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentLocale === locale
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-[#1a1f2e] dark:text-gray-300 dark:hover:bg-[#232946]'
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
