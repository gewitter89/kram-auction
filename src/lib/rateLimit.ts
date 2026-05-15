// Simple in-memory rate limiter (works for single-node, replace with Redis for multi-node)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

/**
 * Returns true if the request should be blocked (rate limit exceeded)
 * @param key - unique identifier (IP + userId or just IP)
 * @param limit - max requests per window
 * @param windowMs - window size in milliseconds
 */
export function isRateLimited(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now()
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

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key)
  }
}, 5 * 60_000)
