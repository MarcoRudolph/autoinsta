export const runtime = 'edge';

import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Save persona API received data:', JSON.stringify(data, null, 2));
    console.log('Data being inserted into database:', JSON.stringify(data, null, 2));
    
    // Insert new persona (add userId as needed)
    const result = await db.insert(personas).values({
      userId: data.userId, // ensure userId is provided
      data,
    }).returning();
    
    console.log('Database insert result:', JSON.stringify(result, null, 2));
    return NextResponse.json({ success: true, persona: result[0] });
  } catch (error) {
    console.error('Error in save-persona API:', error);
    return NextResponse.json({ error: 'Failed to save persona', details: String(error) }, { status: 500 });
  }
} 
