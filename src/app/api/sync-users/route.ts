import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all users from Supabase Auth
    console.log('Attempting to fetch users from Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch auth users', details: authError.message },
        { status: 500 }
      );
    }

    console.log(`Found ${authUsers.users.length} users in Supabase Auth`);
    console.log('Auth users:', authUsers.users.map(u => ({ id: u.id, email: u.email })));

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Sync each auth user to custom users table
    for (const authUser of authUsers.users) {
      try {
        console.log(`Processing user: ${authUser.email} (${authUser.id})`);
        
        // Check if user already exists in custom table
        const existingUser = await db.select().from(users).where(eq(users.id, authUser.id));
        console.log(`Existing user check for ${authUser.email}:`, existingUser.length > 0 ? 'Found' : 'Not found');
        
        if (existingUser.length > 0) {
          console.log(`User ${authUser.email} already exists in custom table, skipping`);
          skippedCount++;
          continue;
        }

        // Insert user into custom table
        console.log(`Inserting user ${authUser.email} into custom table...`);
        await db.insert(users).values({
          id: authUser.id,
          email: authUser.email!,
          passwordHash: '', // We don't store password hash for Supabase Auth users
          createdAt: authUser.created_at ? new Date(authUser.created_at) : new Date(),
          updatedAt: authUser.updated_at ? new Date(authUser.updated_at) : new Date(),
          // Set default subscription values
          subscriptionStatus: 'free',
          subscriptionPlan: 'free',
          isPro: false
        });

        console.log(`Successfully synced user: ${authUser.email} (${authUser.id})`);
        syncedCount++;

      } catch (error) {
        console.error(`Error syncing user ${authUser.email}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed`,
      stats: {
        totalAuthUsers: authUsers.users.length,
        synced: syncedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error in sync-users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
