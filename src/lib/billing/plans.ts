export type BillingPlan = 'free' | 'pro' | 'max' | 'enterprise';

export type BillingPlanConfig = {
  monthlyPriceEurCents: number;
  monthlyApiBudgetEurCents: number;
  monthlyCredits: number;
  estimatedMinCreditsToSend: number;
};

const CREDIT_MICROS = 1_000; // 0.001 EUR
const EUR_CENT_MICROS = 10_000; // 0.01 EUR

export const BILLING_PLAN_CONFIG: Record<BillingPlan, BillingPlanConfig> = {
  free: {
    monthlyPriceEurCents: 0,
    monthlyApiBudgetEurCents: 0,
    monthlyCredits: 300,
    estimatedMinCreditsToSend: 10,
  },
  pro: {
    monthlyPriceEurCents: 1_000,
    monthlyApiBudgetEurCents: 500,
    monthlyCredits: 5_000,
    estimatedMinCreditsToSend: 30,
  },
  max: {
    monthlyPriceEurCents: 20_000,
    monthlyApiBudgetEurCents: 12_000,
    monthlyCredits: 120_000,
    estimatedMinCreditsToSend: 80,
  },
  enterprise: {
    monthlyPriceEurCents: 0,
    monthlyApiBudgetEurCents: 0,
    monthlyCredits: 250_000,
    estimatedMinCreditsToSend: 80,
  },
};

export function normalizePlan(input: string | null | undefined): BillingPlan {
  if (input === 'pro' || input === 'max' || input === 'enterprise') {
    return input;
  }
  return 'free';
}

export function creditsFromCostMicros(costMicros: number): number {
  if (!Number.isFinite(costMicros) || costMicros <= 0) return 0;
  return Math.ceil(costMicros / CREDIT_MICROS);
}

export function microsFromCredits(credits: number): number {
  if (!Number.isFinite(credits) || credits <= 0) return 0;
  return Math.round(credits) * CREDIT_MICROS;
}

export function microsToEur(costMicros: number): number {
  return Math.round((costMicros / 1_000_000) * 1_000_000) / 1_000_000;
}

export function centsToMicros(cents: number): number {
  if (!Number.isFinite(cents)) return 0;
  return Math.round(cents) * EUR_CENT_MICROS;
}

export function canSendWithCredits(remainingCredits: number, requiredCredits: number): boolean {
  if (!Number.isFinite(remainingCredits) || !Number.isFinite(requiredCredits)) return false;
  return remainingCredits >= requiredCredits;
}
