import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckout } from '@/app/actions/stripe';

export const runtime = 'nodejs';

type CheckoutBody = {
  userId?: string;
  plan?: 'pro' | 'max';
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const userId = body.userId;
    const plan = body.plan === 'max' ? 'max' : 'pro';

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const session = await createSubscriptionCheckout(userId, plan);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Billing checkout API error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
