import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { checkRegistrationRateLimit, getClientIP } from '@/lib/rateLimit';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema/users';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRegistrationRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const hoursUntilReset = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60));

      return NextResponse.json(
        {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Registration limit exceeded. You can try again in ${hoursUntilReset} hours.`,
          resetTime: rateLimit.resetTime,
          hoursUntilReset,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    const existingUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json({ code: 'USER_EXISTS', message: 'User already exists.' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const insertedUsers = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email,
        passwordHash: hashedPassword,
        subscriptionStatus: 'free',
        subscriptionPlan: 'free',
        isPro: false,
      })
      .returning({ id: users.id });

    const newUser = insertedUsers[0];
    if (!newUser?.id) {
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to create user.' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Registration successful.',
        requiresEmailVerification: false,
        userId: newUser.id,
      },
      { status: 201 }
    );
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
