"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import AuthForm from '@/components/auth/AuthForm';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { locales } from '@/config/i18n';
import type { Locale } from '@/config/i18n';
import { useI18n } from '@/hooks/useI18n';

export default function LandingPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') || 'en';
    if (locales.includes(saved as Locale)) setCurrentLocale(saved);
  }, []);

  useEffect(() => {
    console.info('[LandingPage] mounted', {
      pathname: typeof window !== 'undefined' ? window.location.pathname : null,
      search: typeof window !== 'undefined' ? window.location.search : null,
      referrer: typeof document !== 'undefined' ? document.referrer || '(none)' : null,
    });
  }, []);
  const { t, tList } = useI18n(currentLocale);

  useEffect(() => {
    let mounted = true;
    
    // Only import and create Supabase client on the client side
    const checkSession = async () => {
      try {
        const hasHashWithToken =
          typeof window !== 'undefined' &&
          window.location.hash.includes('access_token');
        console.info('[LandingPage] checkSession start', {
          pathname: typeof window !== 'undefined' ? window.location.pathname : null,
          search: typeof window !== 'undefined' ? window.location.search : null,
          hasHashWithToken,
          hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        });
        const { createClient } = await import('@/lib/auth/supabaseClient.client');
        const supabase = createClient();
        let { data, error: sessionError } = await supabase.auth.getSession();
        if (!data.session && hasHashWithToken) {
          console.info('[LandingPage] Hash with token detected, recovering session from URL...');
          try {
            const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              const { data: setData, error: setError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (setError) {
                console.warn('[LandingPage] setSession from hash failed:', setError.message);
              } else if (setData.session) {
                data = { session: setData.session };
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                console.info('[LandingPage] Session recovered from hash');
              }
            } else {
              console.warn('[LandingPage] Hash missing access_token or refresh_token', { hasAccessToken: Boolean(accessToken), hasRefreshToken: Boolean(refreshToken) });
              await new Promise((r) => setTimeout(r, 800));
              const retry = await supabase.auth.getSession();
              data = retry.data;
              sessionError = retry.error;
              if (data.session && typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }
          } catch (hashErr) {
            console.error('[LandingPage] Hash recovery error', {
              message: hashErr instanceof Error ? hashErr.message : String(hashErr),
              stack: hashErr instanceof Error ? hashErr.stack : undefined,
            });
            await new Promise((r) => setTimeout(r, 800));
            const retry = await supabase.auth.getSession();
            data = retry.data;
            sessionError = retry.error;
          }
        }
        console.info('[LandingPage] checkSession result', {
          hasSession: Boolean(data.session),
          userId: data.session?.user?.id ?? null,
          expiresAt: data.session?.expires_at ?? null,
          sessionError: sessionError?.message ?? null,
          mounted,
        });
        if (data.session && mounted) {
          console.info('[LandingPage] Session found, redirecting to /dashboard');
          router.replace('/dashboard');
        } else if (mounted) {
          console.info('[LandingPage] No session, showing landing page');
        }
      } catch (error) {
        const isConfigError =
          error instanceof Error &&
          error.message.includes('Missing NEXT_PUBLIC Supabase config');
        if (isConfigError && mounted) {
          setConfigError(true);
        }
        console.error('[LandingPage] checkSession error', {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : undefined,
          stack: error instanceof Error ? error.stack : undefined,
          isConfigError,
        });
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();
    
    return () => { mounted = false; };
  }, [router]);

  if (configError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-slate-900">
        <p className="text-center text-lg">
          Configuration error. Please contact support.
        </p>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4
          bg-[url('/images/chatbot-mobile.png')] md:bg-[url('/images/chatbot.png')]
          bg-center bg-cover bg-no-repeat
          before:absolute before:inset-0 before:bg-[rgba(21,25,42,0.4)] before:content-[''] before:z-0"
      >
        {/* Pricing Button */}
        <div className="absolute top-4 right-4 z-30 pointer-events-auto">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="px-4 py-2 rounded-full bg-[#334269]/60 text-white font-semibold backdrop-blur-md hover:bg-[#334269]/80"
              >
                {t('landing.pricing.button')}
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#232946] border-2 border-[#f3aacb]/20 shadow-2xl max-w-md [&>button]:text-white [&>button]:hover:text-gray-200 [&>button]:bg-[#334269] [&>button]:hover:bg-[#334269]/80 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-all [&>button]:duration-200">
              <DialogTitle className="text-center mb-6 text-2xl font-bold text-[#334269] dark:text-white">
                {t('landing.pricing.dialogTitle')}
              </DialogTitle>
              <div className="space-y-6">
                {/* Free Plan */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#2a2f4c] dark:to-[#232946] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#334269]/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#334269] dark:text-white">{t('landing.pricing.freePlan')}</h3>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      {t('landing.pricing.free')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {t('landing.pricing.freeDescription')}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {t('landing.pricing.freeFeature1')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {t('landing.pricing.freeFeature2')}
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-[#f3aacb] to-[#e6a3c4] rounded-xl p-6 shadow-lg border-2 border-[#f3aacb] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#334269] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {t('landing.pricing.popular')}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#334269]">{t('landing.pricing.proPlan')}</h3>
                    <span className="text-lg font-bold text-[#334269]">{t('landing.pricing.proPrice')}</span>
                  </div>
                  <p className="text-sm text-[#334269]/80 mb-4">
                    {t('landing.pricing.proDescription')}
                  </p>
                  <ul className="space-y-2 text-sm text-[#334269]/80">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      {t('landing.pricing.proFeature1')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      {t('landing.pricing.proFeature2')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      {t('landing.pricing.proFeature3')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      {t('landing.pricing.proFeature4')}
                    </li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Language Switcher */}
        <div className="absolute top-4 left-4 z-30 pointer-events-auto">
          <LanguageSwitcher
            variant="dropdown"
            onLocaleChange={setCurrentLocale}
          />
        </div>
        {/* rudolpho-chat Card + Catchy Lines Block */}
        <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-12 z-20">
          <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl px-8 py-4 max-w-md w-full flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#334269] tracking-tight drop-shadow-sm">rudolpho-chat</h1>
          </div>
          <div className="flex flex-col items-center gap-2 md:gap-4 select-none pointer-events-none text-center">
            <span className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-[#f3aacb] via-[#e6ebfc] to-[#a3bffa] bg-clip-text text-transparent animate-pulse text-center">
              {t('landing.hero.tagline1')}
            </span>
            <span className="text-lg md:text-2xl font-semibold text-white drop-shadow-md bg-gradient-to-r from-[#a3bffa] via-[#f3aacb] to-[#e6ebfc] bg-clip-text text-transparent animate-fade-in text-center">
              {t('landing.hero.tagline2')}
            </span>
            <span className="text-lg md:text-xl font-medium text-white drop-shadow-md bg-gradient-to-r from-[#e6ebfc] via-[#f3aacb] to-[#a3bffa] bg-clip-text text-transparent animate-fade-in delay-200 mb-4 text-center">
              {t('landing.hero.tagline3')}
            </span>
            <div className="pointer-events-auto">
              <Dialog key="auth-form-dialog">
                <DialogTrigger asChild>
                  <button
                    className="inline-block bg-[#f3aacb] text-[#334269] font-bold px-10 py-4 rounded-full text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {t('landing.hero.cta')}
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>{t('landing.hero.loginTitle')}</DialogTitle>
                  <AuthForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>

        </div>
      </section>

      {/* How To Section */}
      <section
        id="how-to-section"
        className="relative py-16 md:py-28 min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#15192a] via-[#232946] to-[#334269]"
      >
        <div className="relative z-10 max-w-2xl w-full mx-auto px-4">
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-8 md:p-12 border border-white/10">
            {/* Heading */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              {t('landing.howItWorks.title')}
            </h2>
            {/* Steps as vertical timeline */}
            <div className="flex flex-col gap-8 relative pl-8 md:pl-12">
              {[
                t('landing.howItWorks.steps.0'),
                t('landing.howItWorks.steps.1'),
                t('landing.howItWorks.steps.2'),
                t('landing.howItWorks.steps.3')
              ].map((step: string, index: number, arr: string[]) => (
                <div key={index} className="flex items-start relative">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center mr-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-[#f3aacb] bg-[#232946]/70 flex items-center justify-center text-white font-extrabold text-2xl md:text-3xl shadow-lg relative z-10 animate-pulse">
                      {index + 1}
                    </div>
                    {index < arr.length - 1 && (
                      <div className="w-1 h-12 md:h-16 bg-gradient-to-b from-[#f3aacb] to-transparent opacity-60"></div>
                    )}
                  </div>
                  <div className="text-lg md:text-2xl font-semibold text-white drop-shadow-md pt-2 whitespace-pre-line">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Content Safety & Transparency Section */}
      <section
        className="relative py-16 md:py-28 bg-gradient-to-b from-[#334269] via-[#232946] to-[#15192a]"
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              {t('landing.trustTransparency.title')}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t('landing.trustTransparency.subtitle')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Content Safety Card */}
            <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">{t('landing.trustTransparency.contentSafety.title')}</h3>
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                {t('landing.trustTransparency.contentSafety.description')}
              </p>
              <div className="space-y-3">
                {tList('landing.trustTransparency.contentSafety.features').map((feature: string, index: number) => (
                  <div key={index} className="flex items-center text-white/70">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Transparency Card */}
            <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">{t('landing.trustTransparency.aiTransparency.title')}</h3>
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                {t('landing.trustTransparency.aiTransparency.description')}
              </p>
              <div className="space-y-3">
                {tList('landing.trustTransparency.aiTransparency.features').map((feature: string, index: number) => (
                  <div key={index} className="flex items-center text-white/70">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Proof Banner */}
          <div className="bg-gradient-to-r from-[#f3aacb]/20 to-[#a3bffa]/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex -space-x-2 mr-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f3aacb] to-[#e6a3c4] rounded-full border-2 border-white shadow-lg"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#a3bffa] to-[#8b5cf6] rounded-full border-2 border-white shadow-lg"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#e6ebfc] to-[#c7d2fe] rounded-full border-2 border-white shadow-lg"></div>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-lg">{t('landing.trustTransparency.socialProof.trustedBy')}</p>
                <p className="text-white/70 text-sm">{t('landing.trustTransparency.socialProof.buildingRelationships')}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f3aacb] mb-2">99.9%</div>
                <div className="text-white/80">{t('landing.trustTransparency.socialProof.stats.contentSafety')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#a3bffa] mb-2">100%</div>
                <div className="text-white/80">{t('landing.trustTransparency.socialProof.stats.aiTransparency')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#e6ebfc] mb-2">24/7</div>
                <div className="text-white/80">{t('landing.trustTransparency.socialProof.stats.safetyMonitoring')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={currentLocale} />
      <CookieBanner locale={currentLocale} />
    </div>
  );
}
