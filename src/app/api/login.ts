import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const found = await db.select().from(users).where(eq(users.email, email));
    if (found.length === 0) {
      return NextResponse.json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }, { status: 401 });
    }
    const user = found[0];

    // Compare password
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }, { status: 401 });
    }

    // (Session management would go here)
    return NextResponse.json({ message: 'Login successful.' }, { status: 200 });
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