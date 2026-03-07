import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    verifyEmailSchema.parse(body);

    // Drizzle-based auth currently does not store verification tokens in `users`.
    return NextResponse.json(
      {
        code: 'EMAIL_VERIFICATION_DISABLED',
        message: 'Email verification is disabled in the current authentication setup.',
      },
      { status: 400 }
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
