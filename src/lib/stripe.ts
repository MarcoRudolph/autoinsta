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
};

export function mapPriceToPlan(priceId: string | null): 'free' | 'pro' {
  if (!priceId) return 'free';
  return priceId === PRICE_MAP.PRO_MONTHLY ? 'pro' : 'free';
}
