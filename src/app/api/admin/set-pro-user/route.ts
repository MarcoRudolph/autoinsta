import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireInternalApiKey } from '@/lib/security/internalApiAuth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
	try {
		const authError = requireInternalApiKey(req, {
			secrets: [process.env.ADMIN_SECRET, process.env.INTERNAL_API_SECRET],
			context: 'admin',
		});
		if (authError) return authError;

		const body = await req.json();
		const { userId } = body;
		if (!userId) {
			return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
		}

		console.log('Setting user as pro (users table fallback):', userId);

		// Initialize Supabase client
		const supabase = createSupabaseAnonServerClient();

		// Update the users table directly using Supabase
		const { error: updateError } = await supabase
			.from('users')
			.update({
				is_pro: true,
				subscription_status: 'active',
				subscription_plan: 'pro',
				subscription_start_date: new Date().toISOString(),
				subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
				updatedAt: new Date().toISOString(),
			})
			.eq('id', userId);

		if (updateError) {
			console.error('Error updating user:', updateError);
			return NextResponse.json(
				{ error: 'Failed to update user', details: updateError.message },
				{ status: 500 }
			);
		}

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


