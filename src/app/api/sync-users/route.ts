export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
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
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .limit(1);

        if (checkError) {
          console.error(`Error checking user ${authUser.id}:`, checkError);
          errors++;
          continue;
        }

        if (existingUser && existingUser.length > 0) {
          console.log(`User ${authUser.id} already exists, skipping`);
          skipped++;
          continue;
        }

        // Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            passwordHash: '', // Empty string for Supabase Auth users (no password hash)
            createdAt: authUser.created_at ? new Date(authUser.created_at).toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Error inserting user ${authUser.id}:`, insertError);
          errors++;
          continue;
        }

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
