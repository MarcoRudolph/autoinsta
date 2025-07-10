import { createClient } from '@supabase/supabase-js'

export async function signUp(email: string, password: string) {
  const supabaseUrl = 'https://beydpbnwneqksnmnlcce.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey!)

  // 1. Register with Supabase Auth
  const { error, data } = await supabase.auth.signUp({ email, password });
  if (error) return { error };

  // 2. Register in local DB
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    return { error: { message: err.message || 'Failed to register in local DB' } };
  }
  return { data };
}

export async function signIn(email: string, password: string) {
  const supabaseUrl = 'https://beydpbnwneqksnmnlcce.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey!)

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabaseUrl = 'https://beydpbnwneqksnmnlcce.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey!)
  return supabase.auth.signOut();
} 