export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema/users';
import { createClient } from '@/lib/auth/supabaseClient.server';

export async function POST() {
  try {
    const supabase = createClient();
    
    // Get all users from Supabase Auth
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching auth users:', error);
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 });
    }

    console.log('Auth users found:', authUsers.users.length);
    
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const authUser of authUsers.users) {
      try {
        // Check if user already exists in our users table
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, authUser.id)
        });

        if (existingUser) {
          console.log(`User ${authUser.id} already exists, skipping`);
          skipped++;
          continue;
        }

        // Insert new user
        await db.insert(users).values({
          id: authUser.id,
          email: authUser.email || '',
          passwordHash: '', // Empty string for Supabase Auth users (no password hash)
          createdAt: authUser.created_at ? new Date(authUser.created_at) : new Date(),
          updatedAt: new Date(),
        });

        console.log(`Synced user ${authUser.id} (${authUser.email})`);
        synced++;
      } catch (err) {
        console.error(`Error syncing user ${authUser.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      totalAuthUsers: authUsers.users.length,
      synced,
      skipped,
      errors
    });

  } catch (error) {
    console.error('Error in sync-users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
