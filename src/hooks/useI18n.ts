import { useMemo } from 'react';

// Import JSON files
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';

const messages = {
  en: {
    ...enMessages,
    // Fallback translations for any missing keys
    common: {
      save: "Save",
      cancel: "Cancel",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      close: "Close"
    }
  },
  de: {
    ...deMessages,
    // Fallback translations for any missing keys
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      add: "Hinzufügen",
      edit: "Bearbeiten",
      delete: "Löschen",
      loading: "Lädt...",
      error: "Fehler",
      success: "Erfolg",
      confirm: "Bestätigen",
      close: "Schließen"
    }
  }
};

export function useI18n(locale: string = 'en') {
  return useMemo(() => {
    const currentMessages = messages[locale as keyof typeof messages] || messages.en;
    
    const resolveValue = (key: string): unknown => {
      const keys = key.split('.');
      let value: unknown = currentMessages;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      return value;
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
      const value = resolveValue(key);
      
      if (typeof value === 'string') {
        if (!params) {
          return value;
        }

        return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
          return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
        }, value);
      }
      
      console.warn(`Translation key does not resolve to a string: ${key}`);
      return key;
    };

    const tList = (key: string): string[] => {
      const value = resolveValue(key);

      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        return value;
      }

      console.warn(`Translation key does not resolve to a string array: ${key}`);
      return [];
    };

    const tCommon = (key: string): string => {
      return t(`common.${key}`);
    };
    
    return { t, tList, tCommon, locale };
  }, [locale]);
}
