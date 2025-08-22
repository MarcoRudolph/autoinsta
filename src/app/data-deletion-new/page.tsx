'use client';
import { useI18n } from '@/hooks/useI18n';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DataDeletion() {
  const router = useRouter();
  const { currentLocale } = useI18n();

  useEffect(() => {
    if (currentLocale === 'de') {
      router.push('/data-deletion');
    } else {
      router.push('/data-deletion-en');
    }
  }, [currentLocale, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#15192a] via-[#232946] to-[#334269] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Loading...</h1>
            <p>Redirecting to the appropriate language version...</p>
            <div className="mt-4 space-x-4">
              <a href="/data-deletion-en" className="text-blue-400 hover:text-blue-300 underline">English</a>
              <a href="/data-deletion" className="text-blue-400 hover:text-blue-300 underline">Deutsch</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
