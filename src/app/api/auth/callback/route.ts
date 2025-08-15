import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabaseClient.server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Initialize Supabase client
  const supabase = createClient();

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(errorDescription || error)}`, 
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    );
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(
      new URL('/dashboard?error=No authorization code received', 
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    );
  }

  try {
    // Exchange the authorization code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(exchangeError.message)}`, 
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
      );
    }

    if (data.session) {
      // Successfully authenticated
      return NextResponse.redirect(
        new URL('/dashboard?status=success', 
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
      );
    } else {
      console.error('No session received after code exchange');
      return NextResponse.redirect(
        new URL('/dashboard?error=Authentication failed', 
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
      );
    }
  } catch (error) {
    console.error('Unexpected error during OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=Unexpected error during authentication', 
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    );
  }
}
