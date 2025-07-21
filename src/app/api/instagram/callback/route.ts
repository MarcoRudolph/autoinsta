import { NextResponse } from 'next/server';

export async function GET() {
  // Here you could handle any query params from Instagram if needed
  // For now, just redirect to the dashboard
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
