import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerConfig } from '@/lib/supabase/serverConfig';

// Cloudflare-compatible server client without cookies dependency
export const createClient = () => {
  const config = getSupabaseServerConfig();
  if (!config) {
    throw new Error('Supabase public configuration missing on server.');
  }

  return createSupabaseClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
