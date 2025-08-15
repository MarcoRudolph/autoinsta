'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface LocaleProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export default function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
