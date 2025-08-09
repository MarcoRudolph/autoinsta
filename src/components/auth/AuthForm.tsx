import React, { useState } from 'react';
import { signIn, signUp } from '@/lib/auth';
import { createClient } from '@/lib/auth/supabaseClient.client';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to check localStorage for Bravo
  const isBravoLogin = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('login') === 'Bravo';
  };

  const handleGoogle = async () => {
    if (!isBravoLogin()) {
      setError('Login currently disabled.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
    else router.push('/dashboard');
    setLoading(false);
  };

  const handleFacebook = async () => {
    if (!isBravoLogin()) {
      setError('Login currently disabled.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
    if (error) setError(error.message);
    else router.push('/dashboard');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Test-Login für OILRATS
    if (email === 'OILRATS' || email.toLowerCase() === 'oilrats') {
      setLoading(true);
      setError(null);
      
      // Simuliere einen erfolgreichen Login
      setTimeout(() => {
        // Setze Test-Session im localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('testUser', 'OILRATS');
          localStorage.setItem('isLoggedIn', 'true');
        }
        router.push('/dashboard');
        setLoading(false);
      }, 500);
      return;
    }
    
    if (!isBravoLogin()) {
      setError('Login currently disabled.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else router.push('/dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) setError(error.message);
        else router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as { message?: string }).message || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
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