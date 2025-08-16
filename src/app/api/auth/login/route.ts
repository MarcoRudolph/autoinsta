export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { provider = 'facebook' } = await request.json();

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`;

    // Start OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'facebook' | 'google' | 'github',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          // Add any additional Facebook-specific parameters here
          // For example, you might want to request specific scopes
          scope: 'email,public_profile'
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
