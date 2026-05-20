# AI_HANDOFF.md — KRAM project handoff for other AI agents

This document explains how to work on the KRAM auction/marketplace project without losing context or breaking production.

## Project identity

KRAM is a Ukrainian marketplace/auction platform running in **direct-agreement mode**:

- KRAM hosts listings/lots, bids, messages, transaction statuses, TTNs, reports, reviews.
- KRAM **does not accept payments**.
- KRAM **does not hold funds / escrow**.
- KRAM **does not issue payouts/refunds**.
- Buyers and sellers agree payment and delivery directly.
- Recommended safety language: use Nova Poshta cash-on-delivery / payment after inspection.

Never reintroduce public copy that suggests escrow, payment holding, payouts, guaranteed refunds, or LiqPay unless the owner explicitly decides to launch a real payment product.

## Repository / production

Primary repo:

```bash
github.com:gewitter89/kram-auction.git
```

Local Windows project path used by owner:

```cmd
C:\Users\user2\Desktop\newsbot_top_v3\projects\kram
```

OpenClaw workspace path used by this agent:

```bash
/home/node/.openclaw/workspace/kram-auction
```

Production URL:

```text
https://kram-auction.vercel.app
```

Vercel deployment command used by owner:

```bash
npx vercel --prod --yes
```

This OpenClaw environment is **not authenticated to Vercel**, so it cannot deploy directly unless Vercel credentials/token are provided. The owner’s Windows environment is authenticated and has successfully deployed many times.

## Standard workflow for future agents

Before editing:

```bash
git status -sb
git pull
```

After editing:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:smoke
git status --short
git add <changed-files>
git commit -m "Clear concise message"
git push origin main
```

Deploy from the owner’s Windows project folder:

```cmd
git pull
npx vercel --prod --yes
```

If Windows Git says `Unlink of file .git/objects/pack/... failed`, some process is holding Git pack files. Answer `n`, close IDE/extra terminals/Explorer if needed, then run `git status`. Do not panic.

## Expected local warnings

Local builds often show warnings/errors about missing local env:

- `DATABASE_URL is not set`
- `MissingSecret`
- sitemap DB fetch fallback

This is expected in the local/OpenClaw environment and does not necessarily fail production. Production env was verified through Vercel/runtime checks.

Do not “fix” this by adding secrets to the repo.

## Important production env

Critical:

```env
DATABASE_URL
AUTH_SECRET or NEXTAUTH_SECRET
NEXT_PUBLIC_SITE_URL=https://kram-auction.vercel.app
CRON_SECRET
CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET
TELEGRAM_BOT_TOKEN
TELEGRAM_CHANNEL_ID=@kram_auction
PAYMENTS_ENABLED should NOT be true for direct-agreement launch
NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=false
```

Email is currently intentionally allowed as a warning:

- `dev-log` email provider does **not** block controlled launch.
- Real production email should later be implemented with Resend/Gmail/SendGrid/etc.
- Do not use Ethereal as “real production email”; it is only a test mailbox.

## Launch Center / admin surfaces

Important admin URLs:

```text
/admin
/admin/launch
/admin/lots
/admin/users
/admin/reports
/admin/verifications
/admin/disputes
```

`/admin/launch` is the main daily operations screen. It shows:

- critical readiness checks;
- warnings;
- users/lots/bids/messages/transactions in last 24h;
- pending reports;
- pending seller verifications;
- pending review lots;
- open disputes;
- expired active lots;
- QA/test users;
- payments disabled status;
- saved searches count;
- manual cron test buttons;
- Telegram latest/digest buttons.

Readiness now distinguishes:

- `critical` blockers: DB, categories, admin, Cloudinary, CRON_SECRET, AUTH_SECRET, pending reports, expired active lots.
- `warning`: email dev-log.

## Direct-agreement / transaction flow

Relevant files:

```text
src/lib/transaction-service.ts
src/app/api/transactions/*
src/components/cabinet/PurchasesTab.tsx
src/components/cabinet/SalesTab.tsx
src/app/cabinet/transactions/[id]/page.tsx
```

Key decisions already implemented:

- Buyer “mark paid” is now really “terms agreed”.
- `TERMS_AGREED` is used in direct-agreement flow.
- `paymentStatus` remains `NOT_PAID` in direct mode.
- Confirming receipt does not create payout/release.
- Cancellation is allowed before shipment from:
  - `PENDING_PAYMENT`
  - `TERMS_AGREED`
  - legacy `PAID_HELD`
- Dispute UX uses a modal, not `prompt()`.
- Admin dispute resolution records decision without moving money.

## Payments / LiqPay

Payment code still exists but is intentionally disabled unless:

```env
PAYMENTS_ENABLED=true
```

By default production should keep payments disabled. LiqPay routes return disabled/410 behavior when payments are not enabled.

Do not expose payment UI/copy unless real payment/escrow model is intentionally launched.

## Moderation autopilot

Relevant files:

```text
src/lib/listing-risk.ts
src/lib/listing-moderation.ts
src/app/api/admin/lots/autopilot/route.ts
src/app/admin/lots/page.tsx
```

Behavior:

- Rule-based risk engine: low/medium/high risk.
- Auto-approve only safe low-risk pending lots from verified sellers.
- Risky categories like phones/laptops/games/auto are more conservative.
- Suspicious words like предоплата/telegram/viber/etc. increase risk.
- Prohibited-ish words (weapons/drugs/documents/etc.) become blockers.
- Admin UI supports AI dry run and auto-approve low-risk.

## QA cleanup

Relevant endpoint:

```text
/api/admin/qa-cleanup
```

UI:

```text
/admin/users
```

This is admin-only. It finds and removes explicit QA/test/demo users and their artifacts:

- bids;
- favorites;
- saved searches;
- messages;
- notifications;
- reports;
- reviews;
- transactions/events;
- payments/payment releases if any;
- own QA listings;
- restores real listings touched by QA buyer to active if needed.

Safe patterns include:

- `kram.qa.*`
- `qa.*`
- `test.*`
- `demo.*`
- local part contains `qa-`, `test-`, `+qa`, `+test`, `demo`
- domains `example.com`, `test.com`, `kram-test.com`

Admin users are refused.

Never leave public cleanup routes in the repo. Temporary public routes were used earlier for one-off production checks but must not remain.

## Marketplace import

Old OLX-specific import has been upgraded to universal marketplace import.

Main files:

```text
src/lib/olx-import.ts
src/lib/marketplace-import.ts
src/app/api/lots/import-url/preview/route.ts
src/app/api/lots/import-url/route.ts
src/app/api/lots/import-url/bulk/route.ts
src/app/api/lots/import-olx/preview/route.ts
src/app/api/lots/import-olx/route.ts
src/app/api/lots/import-olx/bulk/route.ts
src/components/sellers/OlxImportBox.tsx
```

New universal endpoints:

```text
POST /api/lots/import-url/preview
POST /api/lots/import-url
POST /api/lots/import-url/bulk
```

Old OLX endpoints are compatibility wrappers exporting the new handlers.

Supported import behavior:

- OLX: uses OLX API parser from `olx-import.ts`.
- Prom.ua: parsed via generic marketplace metadata/schema fallback, with `sourceLabel = Prom.ua`.
- Generic URL fallback: reads `og:title`, `og:image`, `og:description`, `<title>`, and schema.org Product/offers when present.

UI now says “Імпорт лотів з маркетплейсів” and supports OLX, Prom.ua, generic URL fallback.

Important caveat: generic/Prom import can be imperfect. UI warns sellers to verify price, category, and description after import.

## Telegram channel loop

Relevant files:

```text
src/lib/telegram.ts
src/lib/telegram-channel.ts
src/app/api/admin/telegram-channel/route.ts
src/app/api/cron/daily-digest/route.ts
vercel.json
src/app/admin/launch/page.tsx
```

Behavior:

- New active/approved/imported/autopilot-approved lots are posted to Telegram channel if configured.
- `TELEGRAM_CHANNEL_ID=@kram_auction` is used in production.
- Bot must be admin in channel.
- Lot posts use `sendPhoto` when the lot has an image, fallback to text.
- Audit log prevents duplicate lot posts: `TELEGRAM_CHANNEL_LOT_POSTED`.
- Daily digest posts 3–5 active lots with links and CTA.
- Audit log prevents duplicate daily digest for the same day: `TELEGRAM_CHANNEL_DAILY_DIGEST_POSTED`.

Admin Launch Center buttons:

- `Post latest lots`
- `Force repost latest`
- `Post daily digest`
- `Force daily digest`
- `Test daily-digest (force)` through cron test area

Vercel cron:

```json
{
  "path": "/api/cron/daily-digest",
  "schedule": "0 9 * * *"
}
```

This is about 12:00 Kyiv time in summer.

## SEO / OG

Relevant files:

```text
src/lib/seo.ts
src/lib/categories.ts
src/app/lot/[id]/page.tsx
src/app/lot/[id]/opengraph-image.tsx
src/app/category/[slug]/page.tsx
src/app/catalog/page.tsx
src/app/sitemap.ts
```

Implemented:

- Product JSON-LD for lot pages.
- Breadcrumb JSON-LD.
- Organization + WebSite/SearchAction JSON-LD.
- Catalog metadata.
- Category landing pages under `/category/{slug}`.
- Dynamic lot OG image at `/lot/[id]/opengraph-image` with KRAM branding, price, category, city, image.

Telegram/social previews may cache old images. Use query param like `?v=2` when testing link previews.

## Seller onboarding

Main file:

```text
src/app/sell/page.tsx
```

Implemented:

- “Create lot in 3 minutes” header.
- 0% commission / direct agreement / autopilot cards.
- Better photo tips.
- Better description tips.
- Quality checklist before publishing:
  - 2+ photos;
  - 80+ character description;
  - city set;
  - no suspicious prepayment/messenger words.
- Success screen after lot creation:
  - active vs pending review;
  - reasons if moderation is needed;
  - next steps;
  - open lot / cabinet / create another buttons.

## Launch/growth docs

Important docs created in repo:

```text
LAUNCH_KIT_2026-05-20.md
GROWTH_PLAN_2026-05-20.md
AI_HANDOFF.md
```

Use them for launch copy, first-week outreach, seller messages, and project context.

## Known current status at handoff

As of this handoff:

- Production deploy was repeatedly successful.
- Launch Center was green for controlled launch, with email as warning only.
- QA/test/demo users were cleaned.
- Pending reports/verification/moderation/disputes were zero in latest screenshots.
- Telegram posts and daily digest worked.
- OLX and Prom import were tested successfully in production.
- `/sellers` works; OLX/marketplace import layout has overflow protections.
- Latest pushed commits include universal import and import UX polish.

## Commands cheat sheet

Check status:

```bash
git status -sb
git log --oneline -5
```

Run checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

Deploy from owner Windows machine:

```cmd
git pull
npx vercel --prod --yes
```

If local smoke hangs because old Next dev server owns port 3000, kill old `next dev`/node processes and rerun.

## Do not do these things

- Do not commit `.env`, secrets, Vercel tokens, or temporary cleanup scripts.
- Do not leave public cleanup/preflight/debug endpoints in `src/app/api/public-*`.
- Do not re-enable LiqPay/payment surfaces unless explicitly requested.
- Do not claim KRAM provides escrow/guaranteed payment protection.
- Do not auto-delete real users/lots except through safe admin-only cleanup patterns.
- Do not bulk-post Telegram without duplicate protection/audit log.

## If another AI takes over

Recommended next steps are not more infrastructure polish unless a bug is reported. Focus on:

1. Real seller acquisition and 20–50 quality lots.
2. Watching `/admin/launch` daily.
3. Improving seller/import UX based on actual user friction.
4. Setting up real email provider later (Resend preferred), keeping it as warning until then.
5. Adding deeper Prom parser only if generic Prom import misses real fields often.
