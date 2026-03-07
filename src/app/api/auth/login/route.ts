import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerConfig } from '@/lib/supabase/serverConfig';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { provider = 'facebook' } = await request.json();

    const supabaseConfig = getSupabaseServerConfig();
    if (!supabaseConfig) {
      let bindingKeys: string[] = [];
      try {
        bindingKeys = Object.keys((getCloudflareContext().env as Record<string, unknown>) || {});
      } catch {
        // ignore context probe failure
      }

      const hasAnySupabaseLikeVar =
        bindingKeys.some((k) => k.includes('SUPABASE')) ||
        Object.keys(process.env).some((k) => k.includes('SUPABASE'));

      return NextResponse.json(
        {
          error:
            'Supabase configuration missing on server. Expected one URL key (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL) and one anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY / SUPABASE_ANON_KEY).',
          hasAnySupabaseLikeVar,
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

    const origin = request.nextUrl.origin;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || origin;

    // Get the callback URL
    const callbackUrl = `${siteUrl}/api/auth/callback`;

    // Start OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'facebook' | 'google' | 'github',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          // Facebook-specific parameters - nur public_profile für OAuth-Anmeldung
          scope: 'public_profile',
          // Ensure we're requesting the correct permissions
          response_type: 'code',
          // Add any additional parameters for better compatibility
          ...(provider === 'facebook' && {
            // Facebook-specific parameters
            display: 'popup',
            auth_type: 'rerequest'
          })
        }
      }
    });

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.url) {
      return NextResponse.json({ url: data.url });
    } else {
      return NextResponse.json({ error: 'No OAuth URL received' }, { status: 400 });
    }
  } catch (error) {
    console.error('Unexpected error during OAuth login:', error);
    return NextResponse.json(
      { error: 'Unexpected error during OAuth login' }, 
      { status: 500 }
    );
  }
}

