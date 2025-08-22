export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Delete user's personas
    const { error: personasError } = await supabase
      .from('personas')
      .delete()
      .eq('userId', userId);

    if (personasError) {
      console.error('Error deleting personas:', personasError);
    }

    // Reset user's locale to default (keep account but reset preferences)
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        locale: 'en',
        instaAccessToken: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user:', userError);
    }

    // Note: We don't delete the user account itself, just the data
    // The user can still login with their email/password

    return NextResponse.json({ 
      success: true, 
      message: 'User data deleted successfully. Account remains for login.' 
    });

  } catch (error) {
    console.error('Error in delete-user-data API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
