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
    
    const t = (key: string, params?: Record<string, string>): string | string[] | Record<string, unknown> => {
      const keys = key.split('.');
      let value: unknown = currentMessages;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return key if translation not found
        }
      }
      
      if (typeof value === 'string' && params) {
        return Object.entries(params).reduce((str, [key, val]) => {
          return str.replace(new RegExp(`{${key}}`, 'g'), val);
        }, value);
      }
      
      return value as string | string[] | Record<string, unknown>; // Return the actual value, not the key
    };

    const tCommon = (key: string) => {
      return t(`common.${key}`);
    };
    
    return { t, tCommon, locale };
  }, [locale]);
}
