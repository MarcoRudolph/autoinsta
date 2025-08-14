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
import { createClient } from '@/lib/auth/supabaseClient.client';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && mounted) {
        router.replace('/dashboard');
      }
      setCheckingSession(false);
    });
    return () => { mounted = false; };
  }, [router, supabase]);

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
                Pricing
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#232946] border-2 border-[#f3aacb]/20 shadow-2xl max-w-md [&>button]:text-white [&>button]:hover:text-gray-200 [&>button]:bg-[#334269] [&>button]:hover:bg-[#334269]/80 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-all [&>button]:duration-200">
              <DialogTitle className="text-center mb-6 text-2xl font-bold text-[#334269] dark:text-white">
                Choose Your Plan
              </DialogTitle>
              <div className="space-y-6">
                {/* Free Plan */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#2a2f4c] dark:to-[#232946] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#334269]/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#334269] dark:text-white">Free Plan</h3>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      Free
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    20 automated messages in direct messages or comments.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Basic automation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Standard response templates
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-[#f3aacb] to-[#e6a3c4] rounded-xl p-6 shadow-lg border-2 border-[#f3aacb] hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#334269] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#334269]">Pro Plan</h3>
                    <span className="text-lg font-bold text-[#334269]">10€/month</span>
                  </div>
                  <p className="text-sm text-[#334269]/80 mb-4">
                    Unlimited messages for one Instagram account.
                  </p>
                  <ul className="space-y-2 text-sm text-[#334269]/80">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      Unlimited automation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      Advanced AI responses
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      Priority support
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#334269] rounded-full mr-3"></span>
                      Custom AI-Chatbot creation
                    </li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* rudolpho-chat Card + Catchy Lines Block */}
        <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-12 z-20">
          <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl px-8 py-4 max-w-md w-full flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#334269] tracking-tight drop-shadow-sm">rudolpho-chat</h1>
          </div>
          <div className="flex flex-col items-center gap-2 md:gap-4 select-none pointer-events-none text-center">
            <span className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-[#f3aacb] via-[#e6ebfc] to-[#a3bffa] bg-clip-text text-transparent animate-pulse text-center">
              Craft your AI-Chatbot.
            </span>
            <span className="text-lg md:text-2xl font-semibold text-white drop-shadow-md bg-gradient-to-r from-[#a3bffa] via-[#f3aacb] to-[#e6ebfc] bg-clip-text text-transparent animate-fade-in text-center">
              AI takes over your Instagram DMs & comments—just the way you want.
            </span>
            <span className="text-lg md:text-xl font-medium text-white drop-shadow-md bg-gradient-to-r from-[#e6ebfc] via-[#f3aacb] to-[#a3bffa] bg-clip-text text-transparent animate-fade-in delay-200 mb-4 text-center">
              Consistent, authentic, automatic.
            </span>
            <div className="pointer-events-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="inline-block bg-[#f3aacb] text-[#334269] font-bold px-10 py-4 rounded-full text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Try it now
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Login or Register</DialogTitle>
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
              How it works
            </h2>
            {/* Steps as vertical timeline */}
            <div className="flex flex-col gap-8 relative pl-8 md:pl-12">
              {[
                "1️⃣ Gestalte deinen AI-Chatbot\nLege Persönlichkeit, Schreibstil und Antworten fest – genau so, wie dein Bot klingen soll.",
                "2️⃣ Verbinde deine Kanäle\nVerknüpfe Instagram oder andere Plattformen mit deinem AI-Chatbot.",
                "3️⃣ Lass ihn für dich chatten\nDein AI-Chatbot beantwortet automatisch Nachrichten in deinem Stil – rund um die Uhr."
              ].map((step, index, arr) => (
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
      <Footer />
      <CookieBanner />
    </div>
  );
}
