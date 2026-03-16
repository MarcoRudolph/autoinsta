import Stripe from 'stripe';

// Only create Stripe instance if secret key is available
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });
}

export { stripe };

// Price mapping
const PRICE_MAP = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  MAX_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX,
};

export function mapPriceToPlan(priceId: string | null): 'free' | 'pro' | 'max' {
  if (!priceId) return 'free';
  if (priceId === PRICE_MAP.PRO_MONTHLY) return 'pro';
  if (priceId === PRICE_MAP.MAX_MONTHLY) return 'max';
  return 'free';
}

export function mapPlanToPrice(plan: 'pro' | 'max'): string | null {
  if (plan === 'pro') return PRICE_MAP.PRO_MONTHLY || null;
  if (plan === 'max') return PRICE_MAP.MAX_MONTHLY || null;
  return null;
}
