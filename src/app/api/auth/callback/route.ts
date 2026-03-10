import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabaseClient.server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.info('[AuthCallback] GET received', {
    hasCode: Boolean(code),
    codeLength: code?.length ?? 0,
    error: error ?? null,
    errorDescription: errorDescription ?? null,
    pathname: new URL(request.url).pathname,
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
  });

  // Get the site URL with proper fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_APP_URL || 'https://rudolpho-chat.de');
  console.info('[AuthCallback] siteUrl for redirect', { siteUrl });

  if (error) {
    console.error('[AuthCallback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(errorDescription || error)}`, siteUrl)
    );
  }

  if (!code) {
    console.error('[AuthCallback] No authorization code received');
    return NextResponse.redirect(
      new URL('/dashboard?error=No authorization code received', siteUrl)
    );
  }

  try {
    const supabase = createClient();
    console.info('[AuthCallback] Supabase client created, exchanging code for session');

    // Exchange the authorization code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    console.info('[AuthCallback] exchangeCodeForSession result', {
      hasSession: Boolean(data?.session),
      hasUser: Boolean(data?.user),
      userId: data?.user?.id ?? null,
      exchangeError: exchangeError?.message ?? null,
    });

    if (exchangeError) {
      console.error('[AuthCallback] Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(exchangeError.message)}`, siteUrl)
      );
    }

    if (data.session) {
      const redirectUrl = new URL('/dashboard?status=success', siteUrl);
      console.info('[AuthCallback] Success, redirecting to', { redirectUrl: redirectUrl.toString() });
      return NextResponse.redirect(redirectUrl);
    }

    console.error('[AuthCallback] No session received after code exchange');
    return NextResponse.redirect(
      new URL('/dashboard?error=Authentication failed', siteUrl)
    );
  } catch (err) {
    console.error('[AuthCallback] Unexpected error', {
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.redirect(
      new URL('/dashboard?error=Unexpected error during authentication', siteUrl)
    );
  }
}

