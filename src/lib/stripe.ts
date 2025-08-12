import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Pin API version for predictable behavior
});

// Price ID for the 10 Euro monthly product
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
} as const;

// Validate that required price ID is set
export function validateStripePrices() {
  if (!STRIPE_PRICES.PRO_MONTHLY) {
    console.warn('Missing Stripe price ID: NEXT_PUBLIC_STRIPE_PRICE_PRO');
  }
}

// Helper to map Stripe price ID to internal plan
export function mapPriceToPlan(priceId: string | null): 'free' | 'pro' | 'enterprise' {
  if (!priceId) return 'free';
  
  // Since we only have one product (10 Euro monthly), map it to 'pro'
  if (priceId === STRIPE_PRICES.PRO_MONTHLY) {
    return 'pro';
  }
  
  return 'free';
}
