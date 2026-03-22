'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

import { AnimatedBeam } from '@/components/ui/animated-beam';
import { BentoGrid } from '@/components/ui/bento-grid';
import { BorderBeam } from '@/components/ui/border-beam';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

/** Empatify design tokens: primary-500 / primary-600 */
const BEAM_PRIMARY_FROM = '#FF6B00';
const BEAM_PRIMARY_TO = '#E65F00';

export type TelegramIntegrationState = {
  botConfigured: boolean;
  webhookRegistered: boolean;
  webhookMatchesExpected: boolean;
  pendingUpdateCount: number;
  lastWebhookError: string | null;
  hint: string | null;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function deliveryNeedsAttention(integration: TelegramIntegrationState): boolean {
  if (!integration.botConfigured) return true;
  if (!integration.webhookRegistered) return true;
  if (!integration.webhookMatchesExpected) return true;
  if (integration.lastWebhookError) return true;
  return false;
}

function TelegramIntegrationBeamDecor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative mt-2 h-28 w-full"
      aria-hidden
    >
      <div
        ref={fromRef}
        className="absolute left-2 top-1/2 z-[1] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-[10px] font-semibold text-white/90"
      >
        App
      </div>
      <div
        ref={toRef}
        className="absolute right-2 top-1/2 z-[1] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-[10px] font-semibold text-white/90"
      >
        TG
      </div>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef}
        toRef={toRef}
        curvature={-40}
        duration={4}
        pathColor="hsl(0 0% 100% / 0.25)"
        pathWidth={2}
        pathOpacity={0.35}
        gradientStartColor={BEAM_PRIMARY_FROM}
        gradientStopColor={BEAM_PRIMARY_TO}
      />
    </div>
  );
}

type TelegramIntegrationPanelProps = {
  locale: string;
  telegramConnected: boolean;
  telegramIntegration: TelegramIntegrationState | null;
  onConnect: () => void;
};

export function TelegramIntegrationPanel({
  locale,
  telegramConnected,
  telegramIntegration,
  onConnect,
}: TelegramIntegrationPanelProps) {
  const { t } = useI18n(locale);
  const reduceMotion = usePrefersReducedMotion();
  const showBeamDecor = !reduceMotion && !telegramConnected;
  const showBorderBeam =
    Boolean(telegramIntegration) &&
    deliveryNeedsAttention(telegramIntegration!) &&
    !reduceMotion;

  const listVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07, delayChildren: 0.04 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const statusRows: Array<{ key: string; ok: boolean; text: string }> = [];
  if (telegramIntegration) {
    statusRows.push({
      key: 'bot',
      ok: telegramIntegration.botConfigured,
      text: telegramIntegration.botConfigured
        ? t('dashboard.telegramBotTokenOk')
        : t('dashboard.telegramBotTokenMissing'),
    });
    const webhookOk =
      telegramIntegration.webhookRegistered &&
      telegramIntegration.webhookMatchesExpected;
    statusRows.push({
      key: 'webhook',
      ok: webhookOk,
      text: telegramIntegration.webhookRegistered
        ? telegramIntegration.webhookMatchesExpected
          ? t('dashboard.telegramWebhookOk')
          : t('dashboard.telegramWebhookMismatch')
        : t('dashboard.telegramWebhookMissing'),
    });
    if (telegramIntegration.pendingUpdateCount > 0) {
      statusRows.push({
        key: 'pending',
        ok: true,
        text: t('dashboard.telegramPendingUpdates', {
          count: String(telegramIntegration.pendingUpdateCount),
        }),
      });
    }
    if (telegramIntegration.lastWebhookError) {
      statusRows.push({
        key: 'error',
        ok: false,
        text: `${t('dashboard.telegramLastWebhookError')}: ${telegramIntegration.lastWebhookError}`,
      });
    }
  }

  return (
    <BentoGrid className="mt-4 max-w-4xl auto-rows-min grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="relative col-span-1 overflow-hidden border-white/20 bg-white/10 text-white shadow-none backdrop-blur-md lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">
            {t('dashboard.telegramLinkCardTitle')}
          </CardTitle>
          <CardDescription className="text-white/75">
            {t('dashboard.telegramLinkCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {showBeamDecor ? <TelegramIntegrationBeamDecor /> : null}
          {telegramConnected ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              {t('dashboard.telegramConnected')}
            </p>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="w-full max-w-xs rounded-lg border border-white bg-transparent py-2.5 px-4 text-sm font-semibold text-white shadow-none transition hover:bg-white hover:text-indigo-700"
            >
              {t('dashboard.connectTelegram')}
            </button>
          )}
        </CardContent>
      </Card>

      <Card
        className="relative col-span-1 overflow-hidden border-white/20 bg-white/10 text-white shadow-none backdrop-blur-md lg:col-span-1"
        role="status"
      >
        {showBorderBeam ? (
          <BorderBeam
            size={120}
            duration={7}
            borderWidth={1}
            colorFrom={BEAM_PRIMARY_FROM}
            colorTo={BEAM_PRIMARY_TO}
          />
        ) : null}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">
            {t('dashboard.telegramDeliveryStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!telegramIntegration ? (
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              {t('dashboard.telegramIntegrationLoading')}
            </p>
          ) : reduceMotion ? (
            <ul className="space-y-2 text-sm text-white/90">
              {statusRows.map((row) => (
                <li key={row.key} className="flex items-start gap-2">
                  {row.ok ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-400"
                      aria-hidden
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0 text-[#FF6B00]"
                      aria-hidden
                    />
                  )}
                  <span
                    className={
                      row.key === 'error' ? 'text-amber-200' : undefined
                    }
                  >
                    {row.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <motion.div
              className="flex flex-col gap-2"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {statusRows.map((row) => (
                <motion.div
                  key={row.key}
                  variants={rowVariants}
                  className="flex items-start gap-2 text-sm text-white/90"
                >
                  {row.ok ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-400"
                      aria-hidden
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0 text-[#FF6B00]"
                      aria-hidden
                    />
                  )}
                  <span
                    className={
                      row.key === 'error' ? 'text-amber-200' : undefined
                    }
                  >
                    {row.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
          {telegramIntegration?.hint ? (
            <p className="mt-3 text-[11px] leading-snug text-white/75">
              {telegramIntegration.hint}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </BentoGrid>
  );
}
