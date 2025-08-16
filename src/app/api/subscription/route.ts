export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription } from '../../../lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscriptionStatus: subscription.subscriptionStatus,
      subscriptionPlan: subscription.subscriptionPlan,
      isPro: subscription.isPro,
      subscriptionStartDate: subscription.subscriptionStartDate,
      subscriptionEndDate: subscription.subscriptionEndDate,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
