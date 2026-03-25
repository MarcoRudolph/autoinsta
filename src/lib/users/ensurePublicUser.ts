import { sql } from 'drizzle-orm';
import { db, hasPostgresUrlConfig } from '@/drizzle';

type EnsurePublicUserInput = {
  userId: string;
  email?: string | null;
};

function normalizeEmail(email: string | null | undefined): string | null {
  const value = email?.trim();
  return value && value.length > 0 ? value : null;
}

export async function ensurePublicUserFromAuth(input: EnsurePublicUserInput): Promise<boolean> {
  if (!input.userId || !hasPostgresUrlConfig()) return false;

  let email = normalizeEmail(input.email);
  let createdAt: Date | null = null;

  if (!email) {
    const authRow = await db.execute(sql`
      select email, created_at
      from auth.users
      where id = cast(${input.userId} as uuid)
      limit 1
    `);

    const row = authRow.rows[0] as { email?: string | null; created_at?: Date | string | null } | undefined;
    email = normalizeEmail(row?.email ?? null);
    const createdRaw = row?.created_at;
    createdAt = createdRaw ? new Date(createdRaw) : null;
  }

  const safeEmail = email ?? `user_${input.userId.slice(0, 8)}@placeholder.local`;
  const safeCreatedAt = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : new Date();

  await db.execute(sql`
    insert into public.users (id, email, "passwordHash", "createdAt", "updatedAt")
    values (${input.userId}, ${safeEmail}, '', ${safeCreatedAt}, now())
    on conflict (id)
    do update set
      email = excluded.email,
      "updatedAt" = now()
  `);

  return true;
}
