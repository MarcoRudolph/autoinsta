export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to check existing user.' }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ code: 'USER_EXISTS', message: 'User already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user using Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        passwordHash: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscriptionStatus: 'free',
        subscriptionPlan: 'free',
        isPro: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to create user.' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User registered successfully.',
      userId: newUser.id 
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Unknown error' }, { status: 500 });
  }
}