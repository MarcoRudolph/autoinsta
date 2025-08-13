import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Test if Stripe is properly configured
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'true' },
    });

    // Clean up test customer
    await stripe.customers.del(testCustomer.id);

    return NextResponse.json({
      success: true,
      message: 'Stripe integration is working correctly',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Stripe test failed:', error);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPriceId: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      },
    }, { status: 500 });
  }
}
