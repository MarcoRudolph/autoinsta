import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.info('[AuthForm] Google login click');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'google' }),
      });

      const data = await response.json();
      console.info('[AuthForm] /api/auth/login response', {
        status: response.status,
        ok: response.ok,
        hasUrl: Boolean(data?.url),
        error: data?.error || null,
        hasAnySupabaseLikeVar: data?.hasAnySupabaseLikeVar ?? null,
      });
      if (!response.ok || data.error) {
        setError(data.error || 'Google login failed');
        return;
      }

      if (data.url) {
        console.info('[AuthForm] Redirecting to OAuth provider URL');
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setLoading(true);
    setError(null);
    
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
        setError(data.error);
        return;
      }

      if (data.url) {
        // Redirect to Facebook OAuth
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      setError('Facebook login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle rate limit errors specifically
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || 'Login failed');
          return;
        }

        // After successful login, redirect to dashboard
        router.push('/dashboard');
      } else {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit exceeded
            setError(data.message || 'Registration limit exceeded');
          } else {
            setError(data.message || 'Registration failed');
          }
          return;
        }

        // Check if email verification is required
        if (data.requiresEmailVerification) {
          // Show success message with rate limit info
          setSuccess(`Registration successful! Please check your email to verify your account.`);
          // Clear the form
          setEmail('');
          setPassword('');
          // Don't redirect - user needs to verify email first
        } else {
          // If no verification required, redirect to dashboard
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#334269] dark:text-white">
        {mode === 'login' ? 'Login to your account' : 'Create an account'}
      </h2>
      
      <div className="flex flex-col gap-3 mb-4">
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-semibold py-2 rounded-lg shadow hover:bg-gray-50 transition"
          disabled={loading}
        >
          <span className="i-mdi:google text-xl" />
          Continue with Google
        </button>
        <button
          onClick={handleFacebook}
          className="w-full flex items-center justify-center gap-2 bg-[#4267B2] text-white font-semibold py-2 rounded-lg shadow hover:bg-[#365899] transition"
          disabled={loading}
        >
          <span className="i-mdi:facebook text-xl" />
          Continue with Facebook
        </button>
      </div>
      
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-2 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f3aacb]"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f3aacb]"
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-500 text-sm text-center">{success}</div>}
        
        <button
          type="submit"
          className="w-full bg-[#f3aacb] text-[#334269] font-bold py-2 rounded-lg shadow hover:bg-[#e6ebfc] transition"
          disabled={loading}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="text-center mt-4">
        {mode === 'login' ? (
          <span className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-[#f3aacb] hover:underline font-semibold"
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </span>
        ) : (
          <span className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              type="button"
              className="text-[#f3aacb] hover:underline font-semibold"
              onClick={() => setMode('login')}
            >
              Login
            </button>
          </span>
        )}
      </div>
    </div>
  );
} 
