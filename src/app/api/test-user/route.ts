import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, passwordHash } = body;

    if (!email || !passwordHash) {
      return NextResponse.json({
        error: 'Email and passwordHash are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        userId: existingUser.id,
      });
    }

    // Create new test user with all required fields
    const newUser = await db.insert(users).values({
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add default values for Stripe fields
      stripeCustomerId: null,
      subscriptionStatus: 'free',
      subscriptionPlan: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      isPro: false,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Test user created',
      userId: newUser[0].id,
    });
  } catch (error: any) {
    console.error('Error creating test user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        isPro: user.isPro,
      },
    });
  } catch (error: any) {
    console.error('Error fetching test user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
