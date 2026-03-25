'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PricingCard from '@/components/PricingCard';
import { createClient } from '@/lib/auth/supabaseClient.client';
import { authedFetch } from '@/lib/auth/authedFetch';

const PricingPage = () => {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<'pro' | 'max' | null>(null);

  useEffect(() => {
    document.title = 'rudolpho-chat';
  }, []);

  const startCheckout = async (plan: 'pro' | 'max') => {
    try {
      setCheckoutLoading(plan);
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        router.push('/register');
        return;
      }

      const response = await authedFetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });
      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Unable to start checkout');
      }
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout start failed:', error);
      alert('Could not start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>rudolpho-chat</title>
      </Head>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center">
        <section className="w-full flex flex-col items-center pt-16 pb-8 px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-800 text-center mb-6">
            Let the bot do the chat for you
          </h1>
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mb-8">
            Pick the plan that matches your message volume and keep full visibility into usage and credits.
          </p>
          <div className="w-16 h-1 bg-teal-200 rounded-full mb-8" />
        </section>

        <section className="w-full flex flex-col items-center justify-center pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <PricingCard
              planType="Free"
              price="0 EUR / month"
              buttonLabel="Get started for free"
              onClick={() => router.push('/register')}
            />
            <PricingCard
              planType="Pro"
              price="10 EUR / month"
              buttonLabel={checkoutLoading === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
              highlight
              onClick={() => startCheckout('pro')}
            />
            <PricingCard
              planType="Max"
              price="200 EUR / month"
              buttonLabel={checkoutLoading === 'max' ? 'Redirecting...' : 'Upgrade to Max'}
              onClick={() => startCheckout('max')}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default PricingPage;
