export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, passwordHash } = body;

    if (!email || !passwordHash) {
      return NextResponse.json({
        error: 'Email and passwordHash are required'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        userId: existingUser[0].id,
      });
    }

    // Create new test user with all required fields
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add default values for Stripe fields
        stripeCustomerId: null,
        subscriptionStatus: 'free',
        subscriptionPlan: 'free',
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        isPro: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating test user:', insertError);
      return NextResponse.json({
        success: false,
        error: insertError.message,
        details: insertError,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created',
      userId: newUser.id,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error creating test user:', error);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Error fetching test user:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    if (!user || user.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        stripeCustomerId: user[0].stripeCustomerId,
        subscriptionStatus: user[0].subscriptionStatus,
        subscriptionPlan: user[0].subscriptionPlan,
        isPro: user[0].isPro,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching test user:', error);
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
