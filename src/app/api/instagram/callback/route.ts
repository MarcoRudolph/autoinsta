export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the site URL with proper fallback
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://rudolpho-chat.de' : 'http://localhost:3000');

  return NextResponse.redirect(new URL('/dashboard', siteUrl));
}
