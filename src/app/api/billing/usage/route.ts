import { NextRequest, NextResponse } from 'next/server';
import { getBillingUsageSummary, getUserMessageStats } from '@/lib/billing/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const [billing, messages] = await Promise.all([
      getBillingUsageSummary(userId),
      getUserMessageStats(userId),
    ]);

    return NextResponse.json({
      plan: billing.plan,
      periodStart: billing.periodStart,
      periodEnd: billing.periodEnd,
      creditsTotal: billing.creditsTotal,
      creditsUsed: billing.creditsUsed,
      creditsRemaining: billing.creditsRemaining,
      apiBudgetMicros: billing.apiBudgetMicros,
      apiCostMicros: billing.apiCostMicros,
      messagesReceived: messages.received,
      messagesSent: messages.sent,
    });
  } catch (error) {
    console.error('Billing usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
