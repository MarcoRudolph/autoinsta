'use client';
import { useI18n } from '@/hooks/useI18n';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
  const router = useRouter();
  const { currentLocale } = useI18n();

  useEffect(() => {
    if (currentLocale === 'de') {
      router.push('/privacy');
    } else {
      router.push('/privacy-en');
    }
  }, [currentLocale, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#334269]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        <p>Redirecting to the appropriate language version...</p>
        <div className="mt-4 space-x-4">
          <a href="/privacy-en" className="text-blue-600 hover:text-blue-800 underline">English</a>
          <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Deutsch</a>
        </div>
      </div>
    </div>
  );
}
