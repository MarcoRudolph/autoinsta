import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Admin secret key - in production, move to env var (e.g., process.env.ADMIN_SECRET)
const ADMIN_SECRET = 'your-admin-secret-key-here';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { userId, adminSecret } = body;

		if (adminSecret !== ADMIN_SECRET) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		if (!userId) {
			return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
		}

		console.log('Setting user as pro (users table fallback):', userId);

		// Update the users table directly (fallback path)
		await db
			.update(users)
			.set({
				isPro: true,
				subscriptionStatus: 'active',
				subscriptionPlan: 'pro',
				subscriptionStartDate: new Date(),
				subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));

		return NextResponse.json({
			success: true,
			message: 'User set as pro successfully (users table updated).',
		});
	} catch (error) {
		console.error('Error setting user as pro:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
