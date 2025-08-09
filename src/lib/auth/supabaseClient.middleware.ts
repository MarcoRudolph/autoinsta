import { type NextRequest, NextResponse } from 'next/server';

// Simplified middleware that just passes through requests
// Since we're using client-side auth primarily
export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}; 