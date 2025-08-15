import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/drizzle';
import { users } from '@/drizzle/schema';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection by counting users
    const userCount = await db.select().from(users);
    
    console.log(`Database connection successful. Found ${userCount.length} users in custom table.`);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount.length,
      users: userCount.map(u => ({ id: u.id, email: u.email, subscriptionStatus: u.subscriptionStatus }))
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
