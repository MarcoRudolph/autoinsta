'use client';

import { createClient } from './supabaseClient.client';

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
