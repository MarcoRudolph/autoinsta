'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const verifyEmail = useCallback(async (tokenValue: string) => {
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        if (data.code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setMessage('Your verification link has expired. Please request a new one.');
        } else if (data.code === 'ALREADY_VERIFIED') {
          setStatus('success');
          setMessage('Your email is already verified. You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-transparent">
            Boost Your Date
          </Link>
        </div>

        {/* Verification Card */}
        <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-gradient-to-r from-sky-700 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h1>
                <p className="text-[#a3bffa]">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Email Verified! 🎉</h1>
                <p className="text-[#a3bffa] mb-6">{message}</p>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-300 text-sm">
                    Redirecting you to the dashboard in a few seconds...
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
                <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
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
                    Try Logging In
                  </Link>
                </div>
              </>
            )}

            {status === 'expired' && (
              <>
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Link Expired</h1>
                <p className="text-[#a3bffa] mb-6">{message}</p>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-300 text-sm">
                    Verification links expire after 24 hours for security reasons.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-sky-700 to-cyan-500 text-white rounded-lg hover:from-sky-600 hover:to-cyan-400 transition-all duration-200 font-medium text-center"
                  >
                    Register Again
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block w-full px-6 py-3 border border-gray-600 text-[#a3bffa] rounded-lg hover:border-gray-500 transition-all duration-200 font-medium text-center"
                  >
                    Try Logging In
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

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-700 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-700 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          <p className="text-[#a3bffa]">Preparing email verification...</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

