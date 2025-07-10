import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Insert new persona (add userId as needed)
    const result = await db.insert(personas).values({
      userId: data.userId, // ensure userId is provided
      data,
    }).returning();
    return NextResponse.json({ success: true, persona: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save persona', details: String(error) }, { status: 500 });
  }
} 