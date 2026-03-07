import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerConfig } from './serverConfig';

export function createSupabaseAnonServerClient() {
  const config = getSupabaseServerConfig();
  if (!config) {
    throw new Error('Supabase public configuration missing on server.');
  }

  return createClient(config.url, config.anonKey);
}

