import { and, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import { db } from '@/drizzle';
import { instagramConnections, instagramMessages } from '@/drizzle/schema/instagram';
import { subscriptions } from '@/drizzle/schema/subscriptions';
import { billingLedger, userBillingCycles } from '@/drizzle/schema/billing';
import {
  BILLING_PLAN_CONFIG,
  BillingPlan,
  creditsFromCostMicros,
  microsFromCredits,
  normalizePlan,
} from './plans';

type BillingPeriod = {
  plan: BillingPlan;
  periodStart: Date;
  periodEnd: Date;
};

export type BillingUsageSummary = {
  plan: BillingPlan;
  periodStart: string;
  periodEnd: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  apiBudgetMicros: number;
  apiCostMicros: number;
};

function getCurrentMonthPeriod(now: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

async function resolveActivePlanAndPeriod(userId: string, now = new Date()): Promise<BillingPeriod> {
  const rows = await db
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), gt(subscriptions.currentPeriodEnd, now)))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  const row = rows[0];
  if (
    row &&
    row.currentPeriodStart &&
    row.currentPeriodEnd &&
    (row.status === 'active' || row.status === 'trialing')
  ) {
    return {
      plan: normalizePlan(row.plan),
      periodStart: new Date(row.currentPeriodStart),
      periodEnd: new Date(row.currentPeriodEnd),
    };
  }

  const { start, end } = getCurrentMonthPeriod(now);
  return {
    plan: 'free',
    periodStart: start,
    periodEnd: end,
  };
}

export async function ensureBillingCycle(userId: string, now = new Date()) {
  const period = await resolveActivePlanAndPeriod(userId, now);
  const planConfig = BILLING_PLAN_CONFIG[period.plan];

  const existing = await db
    .select()
    .from(userBillingCycles)
    .where(
      and(
        eq(userBillingCycles.userId, userId),
        eq(userBillingCycles.periodStart, period.periodStart),
        eq(userBillingCycles.periodEnd, period.periodEnd)
      )
    )
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const inserted = await db
    .insert(userBillingCycles)
    .values({
      userId,
      plan: period.plan,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      creditsTotal: planConfig.monthlyCredits,
      creditsUsed: 0,
      apiBudgetMicros: microsFromCredits(planConfig.monthlyCredits),
      apiCostMicros: 0,
    })
    .returning();

  const cycle = inserted[0];

  await db.insert(billingLedger).values({
    userId,
    billingCycleId: cycle.id,
    eventType: 'grant',
    creditsDelta: planConfig.monthlyCredits,
    apiCostMicros: 0,
    metadata: {
      reason: 'cycle_grant',
      plan: period.plan,
    },
  });

  return cycle;
}

export async function getBillingUsageSummary(userId: string): Promise<BillingUsageSummary> {
  const cycle = await ensureBillingCycle(userId);
  const creditsRemaining = Math.max(0, cycle.creditsTotal - cycle.creditsUsed);
  return {
    plan: normalizePlan(cycle.plan),
    periodStart: cycle.periodStart.toISOString(),
    periodEnd: cycle.periodEnd.toISOString(),
    creditsTotal: cycle.creditsTotal,
    creditsUsed: cycle.creditsUsed,
    creditsRemaining,
    apiBudgetMicros: cycle.apiBudgetMicros,
    apiCostMicros: cycle.apiCostMicros,
  };
}

export async function canAffordEstimatedMessage(userId: string): Promise<{
  allowed: boolean;
  requiredCredits: number;
  remainingCredits: number;
  plan: BillingPlan;
}> {
  const cycle = await ensureBillingCycle(userId);
  const plan = normalizePlan(cycle.plan);
  const remaining = Math.max(0, cycle.creditsTotal - cycle.creditsUsed);
  const required = BILLING_PLAN_CONFIG[plan].estimatedMinCreditsToSend;
  return {
    allowed: remaining >= required,
    requiredCredits: required,
    remainingCredits: remaining,
    plan,
  };
}

export async function recordUsageDebit(input: {
  userId: string;
  igAccountId: string;
  threadKey: string;
  platformMessageId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  apiCostMicros: number;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; creditsDebited: number; remainingCredits: number }> {
  const cycle = await ensureBillingCycle(input.userId);
  const existing = await db
    .select({
      id: billingLedger.id,
      creditsDelta: billingLedger.creditsDelta,
    })
    .from(billingLedger)
    .where(and(eq(billingLedger.eventType, 'usage'), eq(billingLedger.platformMessageId, input.platformMessageId)))
    .limit(1);
  if (existing[0]) {
    const remainingExisting = Math.max(0, cycle.creditsTotal - cycle.creditsUsed);
    return {
      ok: true,
      creditsDebited: Math.abs(existing[0].creditsDelta),
      remainingCredits: remainingExisting,
    };
  }

  const creditsDebited = creditsFromCostMicros(input.apiCostMicros);
  const currentRemaining = Math.max(0, cycle.creditsTotal - cycle.creditsUsed);

  if (creditsDebited > currentRemaining) {
    return { ok: false, creditsDebited, remainingCredits: currentRemaining };
  }

  await db
    .update(userBillingCycles)
    .set({
      creditsUsed: sql`${userBillingCycles.creditsUsed} + ${creditsDebited}`,
      apiCostMicros: sql`${userBillingCycles.apiCostMicros} + ${input.apiCostMicros}`,
      updatedAt: new Date(),
    })
    .where(eq(userBillingCycles.id, cycle.id));

  await db.insert(billingLedger).values({
    userId: input.userId,
    billingCycleId: cycle.id,
    eventType: 'usage',
    creditsDelta: -creditsDebited,
    apiCostMicros: input.apiCostMicros,
    model: input.model,
    promptTokens: input.promptTokens,
    completionTokens: input.completionTokens,
    totalTokens: input.totalTokens,
    platformMessageId: input.platformMessageId,
    igAccountId: input.igAccountId,
    threadKey: input.threadKey,
    metadata: input.metadata ?? null,
  });

  return {
    ok: true,
    creditsDebited,
    remainingCredits: Math.max(0, currentRemaining - creditsDebited),
  };
}

export async function getUserMessageStats(userId: string): Promise<{ received: number; sent: number }> {
  const connections = await db
    .select({ igAccountId: instagramConnections.igAccountId })
    .from(instagramConnections)
    .where(eq(instagramConnections.userId, userId));

  const accountIds = connections.map((row) => row.igAccountId).filter(Boolean);
  if (accountIds.length === 0) {
    return { received: 0, sent: 0 };
  }

  const incoming = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(instagramMessages)
    .where(and(eq(instagramMessages.direction, 'incoming'), inArray(instagramMessages.igAccountId, accountIds)));

  const outgoing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(instagramMessages)
    .where(and(eq(instagramMessages.direction, 'outgoing'), inArray(instagramMessages.igAccountId, accountIds)));

  return {
    received: incoming[0]?.count ?? 0,
    sent: outgoing[0]?.count ?? 0,
  };
}

export async function refreshUserEntitlementFromSubscription(userId: string): Promise<{
  plan: BillingPlan;
  isPro: boolean;
  status: string;
  currentPeriodEnd: Date | null;
}> {
  const rows = await db
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), gt(subscriptions.currentPeriodEnd, new Date())))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  const row = rows[0];
  if (!row || !row.currentPeriodEnd || (row.status !== 'active' && row.status !== 'trialing')) {
    return { plan: 'free', isPro: false, status: 'free', currentPeriodEnd: null };
  }

  const plan = normalizePlan(row.plan);
  return {
    plan,
    isPro: plan === 'pro' || plan === 'max' || plan === 'enterprise',
    status: row.status,
    currentPeriodEnd: new Date(row.currentPeriodEnd),
  };
}
