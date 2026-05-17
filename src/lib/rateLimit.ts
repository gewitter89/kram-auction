// Simple in-memory rate limiter (works for single-node, replace with Redis for multi-node)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
let lastCleanupTime = Date.now()

/**
 * Returns true if the request should be blocked (rate limit exceeded)
 * @param key - unique identifier (IP + userId or just IP)
 * @param limit - max requests per window
 * @param windowMs - window size in milliseconds
 */
export function isRateLimited(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now()

  // Passive self-cleaning: clean up expired entries at most once every minute
  // This is highly optimal for Serverless environments where setInterval gets suspended.
  if (now - lastCleanupTime > 60_000) {
    for (const [k, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) {
        rateLimitMap.delete(k)
      }
    }
    lastCleanupTime = now
  }

  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= limit) {
    return true
  }

  entry.count++
  return false
}
