// Simple in-memory rate limiter with Upstash Redis REST fallback for multi-node/serverless environments.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
let lastCleanupTime = Date.now()

/**
 * Returns true if the request should be blocked (rate limit exceeded)
 * Seamlessly uses Upstash Redis REST API if configured in .env, otherwise falls back to local in-memory sliding window.
 * 
 * @param key - unique identifier (IP + userId or just IP)
 * @param limit - max requests per window
 * @param windowMs - window size in milliseconds
 */
export async function isRateLimited(key: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    try {
      const luaScript = `
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])

        local current = redis.call('get', key)
        if current and tonumber(current) >= limit then
            return 1
        else
            local val = redis.call('incr', key)
            if val == 1 then
                redis.call('pexpire', key, window)
            end
            return 0
        end
      `.trim()

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'EVAL',
          luaScript,
          '1',
          key,
          limit.toString(),
          windowMs.toString(),
        ]),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        // Upstash REST returns result in the format: { result: 1 } (rate limited) or { result: 0 } (allowed)
        return result.result === 1
      } else {
        console.warn('Upstash rate limit request failed, falling back to in-memory')
      }
    } catch (error) {
      console.warn('Failed to query Upstash Redis for rate-limiting, falling back to in-memory:', error)
    }
  }

  // Fallback to local in-memory sliding-window limit
  const now = Date.now()

  // Passive self-cleaning: clean up expired entries at most once every minute
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
