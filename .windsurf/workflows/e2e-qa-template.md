---
description: KRAM Auction E2E QA Complete Task Template
---

# 🛡️ KRAM Auction — E2E QA Task Template

**Production URL:** [https://kram-auction.vercel.app](https://kram-auction.vercel.app)
**Project Stack:** Next.js 15 (App Router), TypeScript, Tailwind v4, Prisma ORM, PostgreSQL / Neon

**Current State:** Trust Layer, SSR, Hero, Catalog, Sell, /cabinet/verify, Admin Reports implemented.
**Missing:** TRUE E2E QA (bids, reports, admin moderation, SSE, rate limits).

---

## ⚠️ Constraints

- [ ] Do NOT use production DATABASE_URL
- [ ] Do NOT run QA seed on production
- [ ] Do NOT modify hero/footer/legal pages
- [ ] Do NOT add LiqPay / TurboSMS
- [ ] Do NOT expose real user passwords

---

## 🔹 Phase 1 — Create Isolated Test Database

- [ ] Use **separate PostgreSQL DB** (Neon branch / temp project / local DB)
- [ ] Create `.env.test.local` with masked DATABASE_URL:

```env
DATABASE_URL="postgresql://user:***@localhost:5433/kram_test"
ALLOW_QA_SEED=true
QA_SEED_PASSWORD="<hidden>"
NEXTAUTH_SECRET="test-secret"
AUTH_SECRET="test-secret"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] Verify `.gitignore` excludes `.env.test.local`

---

## 🔹 Phase 2 — Prisma Setup and Seed

- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push` (test DB only)
- [ ] Run `npx prisma db seed`
- [ ] Verify via Prisma query:
  - [ ] qa-seller exists
  - [ ] qa-buyer exists
  - [ ] qa-admin exists
  - [ ] "Тестовий QA-лот KRAM" created
  - [ ] Document lot ID and seller ID (mask email/password)

---

## 🔹 Phase 3 — Local Dev Server

- [ ] Start server with `.env.test.local`
- [ ] Verify endpoints:
  - [ ] `curl http://localhost:3000/`
  - [ ] `curl http://localhost:3000/catalog`
  - [ ] `curl http://localhost:3000/lot/<qa-lot-id>`
  - [ ] `curl http://localhost:3000/cabinet/verify`
  - [ ] `curl http://localhost:3000/admin/reports`
  - [ ] `curl http://localhost:3000/admin/users`

---

## 🔹 Phase 4 — Bid E2E Scenarios

| Scenario | Expected Result | Status |
|----------|-----------------|--------|
| Anonymous bid | 401 / "Необхідна авторизація" | [ ] |
| Seller own bid | Blocked with error message | [ ] |
| Buyer bid below minBid | Minimum bid error | [ ] |
| Buyer valid bid | currentPrice, bidCount updated; Bid row created; bid history visible | [ ] |
| Ended auction | Bid blocked | [ ] |
| Anti-sniping | endsAt extended; event contains updated endsAt | [ ] |
| Race condition | One bid passes, second gets conflict/min bid error | [ ] |

---

## 🔹 Phase 5 — Report E2E Scenarios

| Scenario | Expected Result | Status |
|----------|-----------------|--------|
| Anonymous report | 401 / "Необхідна авторизація" | [ ] |
| QA buyer report | Status PENDING; correct listingId and userId; DB record created | [ ] |
| Rate limit (>3 reports/min) | 429 error | [ ] |

---

## 🔹 Phase 6 — Admin Moderation E2E

- [ ] Login as qa-admin
- [ ] Verify PENDING report visible
- [ ] Test PATCH transitions:
  - [ ] PENDING → REVIEWED
  - [ ] REVIEWED → DISMISSED
  - [ ] PENDING → ACTION_TAKEN
- [ ] Verify AuditLog records:
  - [ ] REPORT_CREATED
  - [ ] REPORT_REVIEWED
  - [ ] REPORT_DISMISSED
  - [ ] REPORT_ACTION_TAKEN
- [ ] Admin user verification:
  - [ ] Change seller status
  - [ ] Verify badge on lot page

---

## 🔹 Phase 7 — SSE / Realtime

- [ ] Open lot in two browser tabs
- [ ] Place bid in one tab
- [ ] Verify update in other tab without refresh
- [ ] If polling fallback: PARTIAL
- [ ] If no update: FAIL

---

## 🔹 Phase 8 — Rate Limit

| Test | Limit | Expected | Status |
|------|-------|----------|--------|
| Anonymous/IP | >20 bid/min | 429 | [ ] |
| Auth QA-buyer | >10 bid/min | 429 | [ ] |

**Note:** Storage is in-memory (MVP only, Redis/Vercel KV needed for production)

---

## 🔹 Phase 9 — QA Commands

```bash
# Run these and verify pass
npm run lint
npm run typecheck
npm run build
npx prisma generate
```

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npx prisma generate` completes

---

## 🔹 Phase 10 — Final Report

### Test Results Table

| Test | Environment | User | URL/API | Expected | Actual | DB Proof | PASS/FAIL |
|------|-------------|------|---------|----------|--------|----------|-----------|
| | | | | | | | |

### Summary Checklist

- [ ] Test DB created
- [ ] QA seed completed
- [ ] QA users created
- [ ] QA lot created
- [ ] Bid E2E: Anonymous blocked
- [ ] Bid E2E: Seller own bid blocked
- [ ] Bid E2E: Min bid validation
- [ ] Bid E2E: Valid bid creates record
- [ ] Bid E2E: Ended auction blocked
- [ ] Bid E2E: Anti-sniping
- [ ] Bid E2E: Race condition handled
- [ ] Report E2E: Anonymous blocked
- [ ] Report E2E: Creation works
- [ ] Report E2E: Rate limit works
- [ ] Admin moderation: Status transitions
- [ ] Admin moderation: AuditLog records
- [ ] Admin users: Verification toggle
- [ ] SSE realtime: Cross-tab updates
- [ ] Rate limit: IP limit works
- [ ] Rate limit: User limit works

### Final Status

- Rate limit storage: in-memory / Redis
- Do NOT write "ready" / "production-ready" without actual test execution
