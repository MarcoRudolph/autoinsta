import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getBrowserSupabaseEnvDebug = () => ({
  hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0,
  hasLegacyKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_KEY),
  hasPublishableDefaultKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY),
  hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  keyLength:
    process.env.NEXT_PUBLIC_SUPABASE_KEY?.length ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.length ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ??
    0,
});

export const createClient = () => {
  const debug = getBrowserSupabaseEnvDebug();
  console.info('[supabaseClient.client] createClient env debug:', debug);

  if (!supabaseUrl || !supabaseKey) {
    console.error('[supabaseClient.client] Missing Supabase browser config.', debug);
    throw new Error(
      'Missing NEXT_PUBLIC Supabase config in browser bundle. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY at build time.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
