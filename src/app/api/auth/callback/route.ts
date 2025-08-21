export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabaseClient.server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Get the site URL with proper fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.NEXT_PUBLIC_APP_URL || 'https://rudolpho-chat.de');

  // Initialize Supabase client
  const supabase = createClient();

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(errorDescription || error)}`, siteUrl)
    );
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(
      new URL('/dashboard?error=No authorization code received', siteUrl)
    );
  }

  try {
    // Exchange the authorization code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(exchangeError.message)}`, siteUrl)
      );
    }

    if (data.session) {
      // Successfully authenticated
      return NextResponse.redirect(
        new URL('/dashboard?status=success', siteUrl)
      );
    } else {
      console.error('No session received after code exchange');
      return NextResponse.redirect(
        new URL('/dashboard?error=Authentication failed', siteUrl)
      );
    }
  } catch (error) {
    console.error('Unexpected error during OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=Unexpected error during authentication', siteUrl)
    );
  }
}
