import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get OAuth parameters
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  
  console.log('OAuth Callback received:', { code, error, state });
  
  if (error) {
    console.error('OAuth error:', error);
    // Redirect to dashboard with error parameter
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?error=${encodeURIComponent(error)}`);
  }
  
  if (code) {
    // OAuth code received - you can process it here if needed
    console.log('OAuth code received:', code);
    
    // Here you could:
    // 1. Exchange code for access token
    // 2. Get user information from Google
    // 3. Create/update user in your database
    // 4. Create session
    
    // For now, just redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?auth=success`);
  }
  
  // No code or error - redirect to dashboard
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`);
}

