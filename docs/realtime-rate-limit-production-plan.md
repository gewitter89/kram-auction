# KRAM Production Realtime & Rate Limit Plan

## Current Status (MVP)

### Rate Limiting
- **Storage**: In-memory `Map<string, { count, resetAt }>`
- **Location**: `src/lib/rateLimit.ts`
- **Used by**:
  - `/api/reports`: 3/min per user
  - `/api/messages`: 30/min per user
  - `/api/upload`: 10/min per user
  - `/api/register`: 5/min per IP
  - `/api/user/verify/send`: DB-based attempts
  - `/api/bids`: 10/min per user (NEW)

### SSE Realtime
- **Storage**: In-memory `EventEmitter` via `globalThis._eventBus`
- **Location**: `src/lib/eventBus.ts`
- **Events**:
  - `lot_${listingId}`: New bid notifications
  - `global`: Live auction activity feed
  - `user_${userId}`: Outbid notifications

## MVP Limitations on Vercel Serverless

### Why In-Memory Doesn't Work in Production

1. **Serverless Architecture**: Vercel functions are stateless and ephemeral
2. **Multi-Instance**: Multiple function instances don't share memory
3. **Cold Starts**: Map gets cleared on each cold start
4. **No Persistence**: Events and rate limits lost between requests

### Current Impact

| Feature | Production Behavior | Expected |
|---------|---------------------|----------|
| Rate limiting | Works only on single instance | Global across all users |
| SSE events | Lost 50%+ of events | 100% delivery |
| Anti-sniping updates | Often delayed/missed | Instant to all clients |
| Concurrent bids | Race conditions possible | Proper serialization |

## Recommended Production Solution

### Option A: Upstash Redis (Recommended)

**Pros**:
- Serverless-native
- Free tier: 10k commands/day
- HTTP REST API (no connection overhead)
- Low latency (single-digit ms)
- Managed service (no maintenance)

**Cons**:
- External dependency
- Cost at scale ($0.20/100k commands after free tier)

**Implementation**:
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limit with Redis
export async function isRateLimitedRedis(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const windowKey = `${key}:${Math.floor(now / windowMs)}`
  
  const current = await redis.incr(windowKey)
  if (current === 1) {
    await redis.expire(windowKey, Math.ceil(windowMs / 1000))
  }
  
  return current > limit
}
```

### Option B: Vercel KV

**Pros**:
- Same platform (Vercel)
- Easy integration
- Good for simple use cases

**Cons**:
- Limited features vs Redis
- Higher latency than Upstash
- Pricing less predictable

### Option C: Redis Pub/Sub (Advanced)

For true realtime with multiple server instances:

```typescript
// lib/sse.ts with Redis
import { createClient } from 'redis'

const subscriber = createClient({ url: process.env.REDIS_URL })
const publisher = createClient({ url: process.env.REDIS_URL })

// Subscribe to all events
subscriber.psubscribe('lot:*', 'user:*', 'global')
subscriber.on('pmessage', (pattern, channel, message) => {
  // Broadcast to connected SSE clients
  broadcastToChannel(channel, JSON.parse(message))
})

// Publish events from anywhere
await publisher.publish(`lot:${listingId}`, JSON.stringify({
  type: 'new_bid',
  amount,
  endsAt
}))
```

## Required Environment Variables

```bash
# Option A: Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Option C: Redis Pub/Sub
REDIS_URL=redis://default:password@host:6379
```

## Files to Change

### Phase 1: Rate Limit (Priority: High)

| File | Change |
|------|--------|
| `src/lib/rateLimit.ts` | Add Redis implementation alongside in-memory |
| `src/lib/redis.ts` | Create Redis client singleton |
| `.env.example` | Add Redis env vars |
| `vercel.json` | Add env vars to preview/production |

### Phase 2: SSE Events (Priority: High)

| File | Change |
|------|--------|
| `src/lib/eventBus.ts` | Replace EventEmitter with Redis Pub/Sub |
| `src/app/api/sse/route.ts` | Use Redis subscription for events |
| `src/server/auction/placeBid.ts` | Publish via Redis instead of eventBus |

### Phase 3: Advanced (Priority: Medium)

| File | Change |
|------|--------|
| `src/components/lot/LotPageContent.tsx` | Add polling fallback for unstable SSE |
| `src/hooks/useRealtime.ts` | Abstract Redis/events integration |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Redis downtime | Low | High | Graceful fallback to in-memory + polling |
| Latency increase | Low | Medium | Connection pooling, HTTP/2 |
| Cost overrun | Medium | Low | Monitor usage, alerts at 80% |
| Migration complexity | Medium | Medium | Feature flags, gradual rollout |

## Implementation Order

1. **Week 1**: Set up Upstash account, implement Redis rate limit
2. **Week 2**: Test rate limit in preview, add monitoring
3. **Week 3**: Implement Redis Pub/Sub for SSE
4. **Week 4**: E2E testing, fallback mechanisms, production deploy

## Success Metrics

- Rate limit accuracy: >99%
- SSE event delivery: >95%
- Bid race conditions: 0 incidents
- P50 latency: <50ms for rate check
- P99 latency: <200ms for rate check

## Current Status: MVP ONLY ⚠️

**Do not use in production without Redis implementation.**

The current in-memory solution is suitable for:
- Development
- Single-user testing
- Demo/presentation
- Early beta with <100 concurrent users

**Not suitable for**:
- Production with real money
- >100 concurrent users
- High-frequency bidding (e.g., 10+ bids/second)
