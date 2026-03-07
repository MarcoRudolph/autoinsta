import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, hasPostgresUrlConfig } from '@/drizzle';

export async function GET() {
  const hasPostgresUrl = hasPostgresUrlConfig();

  try {
    const connectivityProbe = await db.execute(sql`select 1 as ok`);
    const isConnected = connectivityProbe.rowCount !== 0;

    return NextResponse.json({
      success: true,
      runtime: 'drizzle',
      hasPostgresUrl,
      isConnected,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        runtime: 'drizzle',
        hasPostgresUrl,
        isConnected: false,
        error: 'Database error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
