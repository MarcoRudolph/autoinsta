import { NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { personas } from '@/drizzle/schema/personas';

export async function GET() {
  try {
    const result = await db.select().from(personas);
    console.log('DEBUG: Raw database result for personas:', JSON.stringify(result, null, 2));
    
    const debugInfo = result.map(row => ({
      id: row.id,
      userId: row.userId,
      data: row.data,
      dataType: typeof row.data,
      dataKeys: Object.keys(row.data || {}),
      personalityName: row.data?.personality?.name,
      directName: row.data?.name,
      personality: row.data?.personality
    }));
    
    return NextResponse.json({ 
      debug: debugInfo,
      rawResult: result 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
}
