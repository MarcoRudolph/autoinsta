import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SerializeOptions } from 'cookie';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type CookieToSet = { name: string; value: string; options?: SerializeOptions };

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const resolvedCookieStore = await cookieStore;
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => resolvedCookieStore.set(name, value, options));
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    },
  );
}; 