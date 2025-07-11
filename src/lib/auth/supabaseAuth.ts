import { createClient } from '@supabase/supabase-js'


export async function register(email: string, password: string) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  if (!res.ok) {
    return { error: { message: result.message || 'Failed to register' } };
  }
  return { data: result };
}

export async function signUp(email: string, password: string) {
  return register(email, password);
}

export async function signIn(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey)

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey)
  return supabase.auth.signOut();
} 