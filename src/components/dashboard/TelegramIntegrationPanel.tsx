'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { normalizeTelegramUsernameInput } from '@/lib/telegram/telegramUsername';
import { authedFetch } from '@/lib/auth/authedFetch';

type TelegramIntegrationPanelProps = {
  locale: string;
  userId: string;
  telegramConnected: boolean;
  onConnected: () => void;
};

export function TelegramIntegrationPanel({
  locale,
  userId,
  telegramConnected,
  onConnected,
}: TelegramIntegrationPanelProps) {
  const { t } = useI18n(locale);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const inputClass =
    'w-full max-w-xs rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/40';

  if (!userId.trim()) {
    return (
      <p className="mt-4 max-w-md text-sm text-white/75">{t('dashboard.telegramLoginRequired')}</p>
    );
  }

  const requestCode = async () => {
    const u = telegramUsername.trim();
    if (!u) {
      window.alert(t('dashboard.telegramUsernameRequired'));
      return;
    }
    const normalizedUser = normalizeTelegramUsernameInput(u);
    if (!normalizedUser) {
      window.alert(t('dashboard.telegramUsernameInvalid'));
      return;
    }
    const phone = phoneNumber.trim();
    if (!phone) {
      window.alert(t('dashboard.telegramPhoneRequired'));
      return;
    }

    setBusy(true);
    try {
      const res = await authedFetch('/api/telegram-user/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phoneNumber: phone,
          telegramUsername: normalizedUser,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(data.error || t('dashboard.telegramConnectError'));
        return;
      }
      setCodeSent(true);
    } catch {
      window.alert(t('dashboard.telegramConnectError'));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    const code = phoneCode.trim();
    if (!code) {
      window.alert(t('dashboard.telegramCodeRequired'));
      return;
    }
    setBusy(true);
    try {
      const res = await authedFetch('/api/telegram-user/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phoneCode: code }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(data.error || t('dashboard.telegramConnectError'));
        return;
      }
      setPhoneCode('');
      setCodeSent(false);
      onConnected();
    } catch {
      window.alert(t('dashboard.telegramConnectError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 max-w-md">
      <Card className="border-white/20 bg-white/10 text-white shadow-none backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">
            {t('dashboard.telegramLinkCardTitle')}
          </CardTitle>
          <CardDescription className="text-white/75">
            {t('dashboard.telegramLinkCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {telegramConnected ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              {t('dashboard.telegramConnected')}
            </p>
          ) : (
            <>
              <label className="text-sm font-medium text-white/90" htmlFor="tg-username">
                {t('dashboard.telegramUsernameLabel')}
              </label>
              <input
                id="tg-username"
                type="text"
                autoComplete="off"
                placeholder={t('dashboard.telegramUsernamePlaceholder')}
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className={inputClass}
              />
              <label className="text-sm font-medium text-white/90" htmlFor="tg-phone">
                {t('dashboard.telegramPhoneLabel')}
              </label>
              <input
                id="tg-phone"
                type="tel"
                autoComplete="tel"
                placeholder={t('dashboard.telegramPhonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={codeSent}
                className={inputClass}
              />
              {!codeSent ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={requestCode}
                  className="w-full max-w-xs rounded-lg border border-white bg-transparent py-2.5 px-4 text-sm font-semibold text-white shadow-none transition hover:bg-white hover:text-indigo-700 disabled:opacity-50"
                >
                  {busy ? t('common.loading') : t('dashboard.telegramSendCode')}
                </button>
              ) : (
                <>
                  <label className="text-sm font-medium text-white/90" htmlFor="tg-code">
                    {t('dashboard.telegramCodeLabel')}
                  </label>
                  <input
                    id="tg-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t('dashboard.telegramCodePlaceholder')}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={verifyCode}
                    className="w-full max-w-xs rounded-lg border border-white bg-transparent py-2.5 px-4 text-sm font-semibold text-white shadow-none transition hover:bg-white hover:text-indigo-700 disabled:opacity-50"
                  >
                    {busy ? t('common.loading') : t('dashboard.connectTelegram')}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setCodeSent(false);
                      setPhoneCode('');
                    }}
                    className="text-xs text-white/70 underline"
                  >
                    {t('dashboard.telegramChangePhone')}
                  </button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
