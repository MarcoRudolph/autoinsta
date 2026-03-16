'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ProPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Plans and Upgrades</h1>
          <p className="text-gray-600 mb-8">
            Pro and Max upgrades are now managed on the pricing page.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
          >
            Open Pricing
          </button>
        </div>
      </div>
    </>
  );
}
