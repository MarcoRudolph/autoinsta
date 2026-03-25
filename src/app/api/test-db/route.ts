import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, hasPostgresUrlConfig } from '@/drizzle';
import { requireInternalApiKey } from '@/lib/security/internalApiAuth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authError = requireInternalApiKey(request, {
    secrets: [process.env.INTERNAL_API_SECRET, process.env.ADMIN_SECRET],
    context: 'debug',
  });
  if (authError) return authError;

  const hasPostgresUrl = hasPostgresUrlConfig();

  try {
    const connectivityProbe = await db.execute(sql`select 1 as ok`);
    const isConnected = connectivityProbe.rowCount !== 0;

    let hasInstagramTable = false;
    let missingInstagramColumns: string[] = [];
    let hasInstagramUniqueIndex = false;
    let dbUser: string | null = null;
    if (isConnected) {
      try {
        const tableCheck = await db.execute(
          sql`select 1 from information_schema.tables where table_schema = 'public' and table_name = 'instagram_connections' limit 1`
        );
        hasInstagramTable = (tableCheck.rows?.length ?? 0) > 0;

        if (hasInstagramTable) {
          const columnsResult = await db.execute(sql`
            select column_name
            from information_schema.columns
            where table_schema = 'public' and table_name = 'instagram_connections'
          `);
          const existingColumns = new Set(
            (columnsResult.rows ?? [])
              .map((row) => String((row as Record<string, unknown>).column_name || ''))
              .filter(Boolean)
          );
          const expectedColumns = [
            'ig_account_id',
            'ig_username',
            'provider',
            'access_token',
            'token_expires_at',
            'status',
            'updated_at',
            'user_id',
          ];
          missingInstagramColumns = expectedColumns.filter((columnName) => !existingColumns.has(columnName));

          const indexResult = await db.execute(sql`
            select 1
            from pg_indexes
            where schemaname = 'public'
              and tablename = 'instagram_connections'
              and indexname = 'instagram_connections_ig_account_id_uidx'
            limit 1
          `);
          hasInstagramUniqueIndex = (indexResult.rows?.length ?? 0) > 0;
        }

        const userResult = await db.execute(sql`select current_user as current_user`);
        dbUser = String((userResult.rows?.[0] as Record<string, unknown> | undefined)?.current_user || '');
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({
      success: true,
      runtime: 'drizzle',
      hasPostgresUrl,
      isConnected,
      hasInstagramTable,
      hasInstagramUniqueIndex,
      missingInstagramColumns,
      dbUser,
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
