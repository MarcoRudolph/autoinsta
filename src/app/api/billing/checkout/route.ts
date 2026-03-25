import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckout } from '@/app/actions/stripe';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

type CheckoutBody = {
  userId?: string;
  plan?: 'pro' | 'max';
};

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.response) return auth.response;

    const body = (await request.json()) as CheckoutBody;
    const mismatch = validateRequestedUserId(body.userId, auth.userId);
    if (mismatch) return mismatch;

    const userId = auth.userId;
    const plan = body.plan === 'max' ? 'max' : 'pro';

    const session = await createSubscriptionCheckout(userId, plan);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Billing checkout API error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
