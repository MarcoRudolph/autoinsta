export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST() {
  // Session/token invalidation would go here
  return NextResponse.json({ message: 'Logout successful.' }, { status: 200 });
} 