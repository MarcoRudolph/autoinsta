export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
  // Get the site URL with proper fallback
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.NEXT_PUBLIC_SITE_URL || 'https://rudolpho-chat.de');

  return NextResponse.redirect(new URL('/dashboard', siteUrl));
}
