// Simple in-memory rate limiting for registration attempts
// In production, you'd want to use Redis or database for persistence

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const registrationAttempts = new Map<string, RateLimitEntry>();

const DAILY_LIMIT = 2; // 2 registration attempts per day
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function checkRegistrationRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = registrationAttempts.get(identifier);

  if (!entry) {
    // First attempt
    registrationAttempts.set(identifier, {
      count: 1,
      resetTime: now + RESET_INTERVAL
    });
    return {
      allowed: true,
      remaining: DAILY_LIMIT - 1,
      resetTime: now + RESET_INTERVAL
    };
  }

  // Check if reset time has passed
  if (now > entry.resetTime) {
    // Reset the counter
    registrationAttempts.set(identifier, {
      count: 1,
      resetTime: now + RESET_INTERVAL
    });
    return {
      allowed: true,
      remaining: DAILY_LIMIT - 1,
      resetTime: now + RESET_INTERVAL
    };
  }

  // Check if limit exceeded
  if (entry.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  // Increment counter
  entry.count++;
  registrationAttempts.set(identifier, entry);

  return {
    allowed: true,
    remaining: DAILY_LIMIT - entry.count,
    resetTime: entry.resetTime
  };
}

export function getClientIP(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

// Clean up old entries periodically (optional)
export function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of registrationAttempts.entries()) {
    if (now > entry.resetTime) {
      registrationAttempts.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldEntries, 60 * 60 * 1000);




