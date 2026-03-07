'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get URL parameters
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      return;
    }

    if (code) {
      // Handle successful OAuth callback
      handleOAuthCallback(code, state);
    } else {
      // No code parameter, redirect to dashboard
      setStatus('success');
      setMessage('Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [searchParams, router]);

  const handleOAuthCallback = async (code: string, state: string | null) => {
    try {
      setStatus('loading');
      setMessage('Processing authentication...');

      // Here you can process the OAuth code if needed
      // For now, we'll just redirect to dashboard
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      setMessage('Authentication successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent">
            Rudolpho-Chat
          </Link>
        </div>

        {/* Callback Card */}
        <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-gradient-to-r from-sky-700 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Authenticating...</h1>
                <p className="text-[#a3bffa]">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Success! 🎉</h1>
                <p className="text-[#a3bffa] mb-6">{message}</p>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-300 text-sm">
                    Redirecting you to the dashboard...
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sky-700 to-cyan-500 text-white rounded-lg hover:from-sky-600 hover:to-cyan-400 transition-all duration-200 font-medium"
                >
                  Go to Dashboard
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Authentication Failed</h1>
                <p className="text-[#a3bffa] mb-6">{message}</p>
                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-sky-700 to-cyan-500 text-white rounded-lg hover:from-sky-600 hover:to-cyan-400 transition-all duration-200 font-medium text-center"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block w-full px-6 py-3 border border-gray-600 text-[#a3bffa] rounded-lg hover:border-gray-500 transition-all duration-200 font-medium text-center"
                  >
                    Try Dashboard
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#a3bffa] text-sm">
            Need help? <Link href="/documentation" className="text-sky-400 hover:text-sky-300">Check our documentation</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

