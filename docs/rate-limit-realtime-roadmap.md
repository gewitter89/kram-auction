# KRAM Auction: Rate Limit & Realtime Scaling Roadmap

## 1. Current State (Beta MVP)

### Rate Limiting
Currently, rate limiting is implemented as an **in-memory** MVP using a simple Map object (`src/lib/rateLimit.ts`).
- **Endpoints protected:**
  - `/api/bids` (10 requests / min)
  - `/api/reports` (3 requests / min)
- **Risk on Vercel Serverless:** Vercel functions scale by spinning up isolated instances. An in-memory Map only limits requests hitting the *same* instance. A distributed attack or high traffic will spawn new instances, effectively bypassing the in-memory rate limit and potentially overwhelming the database.

### Realtime (Bidding & Updates)
Realtime bidding is implemented using Server-Sent Events (SSE) via an **in-memory** `EventEmitter` (`src/app/api/events/route.ts`).
- **Risk on Vercel Serverless:** SSE connections hold the serverless function open (which can lead to timeouts and high billing). Furthermore, an event emitted on one instance (e.g., when a user places a bid) is NOT broadcast to users connected to other instances. A 4-second polling fallback was added to mitigate this, but it adds database load.

---

## 2. Recommended Infrastructure: Upstash Redis (Vercel KV)

To transition from MVP to a production-grade beta, we need a centralized state store. **Upstash Redis (Vercel KV)** is the recommended solution because it is serverless-native, integrates seamlessly with Vercel, and provides low-latency distributed caching.

### Rate Limiting Implementation Plan
Migrate `isRateLimited` to use `@upstash/ratelimit` and `@vercel/kv`.

**Target Endpoints to Protect:**
1. `/api/bids`: Prevent bid spam and protect the optimistic locking mechanism. (e.g., 20 requests / 10s per user)
2. `/api/reports`: Prevent report spamming. (e.g., 5 requests / minute per user)
3. `/api/messages` (Future): Prevent chat spam. (e.g., 30 requests / minute)
4. `/api/upload` / `/api/lots` (Future): Prevent malicious bulk uploads. (e.g., 5 requests / minute)

---

## 3. Realtime Scaling Roadmap

### Phase 1: MVP SSE + Polling (Current)
- In-memory event bus.
- 4-second polling fallback for state synchronization across instances.
- *Status: Implemented. Acceptable for low-traffic early beta.*

### Phase 2: Upstash Redis Pub/Sub
- Replace the in-memory `EventEmitter` with Upstash Redis Pub/Sub.
- When a bid is placed on Instance A, it publishes to Redis. Instance B subscribes to Redis and forwards the SSE event to its connected clients.
- *Pros:* Fixes cross-instance synchronization. Reuses the KV infrastructure.
- *Cons:* Still keeps serverless functions open for SSE, which can hit Vercel execution limits.

### Phase 3: Dedicated Realtime Provider (Production)
- Offload websocket/SSE connection management to a dedicated service provider.
- **Recommended Options:**
  1. **Pusher / Ably:** Extremely reliable, easy to integrate, robust client libraries.
  2. **Supabase Realtime:** Good if we plan to migrate PostgreSQL to Supabase.
  3. **Partykit:** Cloudflare worker-based WebSockets, highly scalable and cost-effective.
- *Implementation:* When a bid succeeds, the Next.js API simply calls the provider's HTTP API (e.g., `pusher.trigger('lot-123', 'new-bid', data)`). The client subscribes directly to the provider.

## 4. Next Action Items
1. Provision Vercel KV database.
2. Install `@upstash/ratelimit` and `@vercel/kv`.
3. Refactor `src/lib/rateLimit.ts` to use Redis.
4. Evaluate Pusher/Ably free tiers for replacing the SSE endpoint.
