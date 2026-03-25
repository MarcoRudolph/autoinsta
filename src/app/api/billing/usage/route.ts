import { NextRequest, NextResponse } from 'next/server';
import { getBillingUsageSummary, getUserMessageStats } from '@/lib/billing/service';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.response) return auth.response;

    const mismatch = validateRequestedUserId(request.nextUrl.searchParams.get('userId'), auth.userId);
    if (mismatch) return mismatch;
    const userId = auth.userId;

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
