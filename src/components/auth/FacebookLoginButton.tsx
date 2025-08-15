'use client';

import { useState } from 'react';

interface FacebookLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function FacebookLoginButton({ className = '', children }: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'facebook' }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Facebook login error:', data.error);
        alert('Facebook login failed: ' + data.error);
        return;
      }

      if (data.url) {
        // Redirect to Facebook OAuth
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Unexpected error during Facebook login:', error);
      alert('Unexpected error during Facebook login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className={`flex items-center justify-center gap-3 bg-[#1877F2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      {children || (isLoading ? 'Connecting...' : 'Continue with Facebook')}
    </button>
  );
}
