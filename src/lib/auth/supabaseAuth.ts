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
  try {
    const { createClient } = await import('@/lib/auth/supabaseClient.client');
    const supabase = createClient();
    
    return supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return { error: { message: 'Authentication service unavailable' } };
  }
}

export async function signOut() {
  try {
    const { createClient } = await import('@/lib/auth/supabaseClient.client');
    const supabase = createClient();
    
    return supabase.auth.signOut();
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return { error: { message: 'Authentication service unavailable' } };
  }
} 