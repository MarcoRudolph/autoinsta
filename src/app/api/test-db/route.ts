import { NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema/users';

export async function GET() {
  try {
    const result = await db.select().from(users);
    return NextResponse.json({ 
      success: true, 
      count: result.length,
      users: result.map(user => ({ id: user.id, email: user.email }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
}
