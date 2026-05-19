# KRAM Live Launch Checklist

Use this before public launch and after every production deploy.

## 1. Required Vercel env

Required:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_SITE_URL=https://kram-auction.vercel.app
CRON_SECRET=
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=false
```

Optional integrations only if really enabled:

```env
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
TELEGRAM_BOT_TOKEN=
DEEPSEEK_API_KEY=
TURBOSMS_TOKEN=
LIQPAY_PUBLIC_KEY=
LIQPAY_PRIVATE_KEY=
```

## 2. Database preflight

Run locally against the production DB only when you intentionally point `DATABASE_URL` to production:

```bash
npm run preflight:prod
```

Must pass:

- Cloudinary configured.
- Categories exist.
- Admin exists.
- No pending reports before public announcement.
- No expired active auctions.
- No obvious seed/test accounts or smoke lots.

## 3. Deploy smoke

After deploy:

```bash
npm run test:smoke
```

Then manually check on mobile width:

- `/`
- `/catalog`
- `/sell`
- `/lot/<real-lot-id>`
- `/cabinet`
- `/admin`

## 4. Manual end-to-end scenario

Create/use three real test accounts that are not visible as demo accounts:

1. Admin
2. Seller
3. Buyer

Scenario:

- Seller logs in.
- Seller passes verification or admin marks seller verified.
- Seller creates a lot with 3–5 phone photos.
- Buyer opens catalog and finds the lot.
- Buyer places a bid.
- Buyer tests buy-now if enabled for the lot.
- Seller sees sale in cabinet.
- Buyer confirms direct agreement.
- Seller enters tracking number.
- Buyer confirms receipt.
- Buyer opens dispute on a separate test transaction.
- Buyer reports a suspicious lot.
- Admin reviews report, hides/restores lot, toggles VIP, checks readiness.

## 5. Public launch gate

Do not announce publicly until:

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `npm run preflight:prod` passes against the intended DB.
- Cloudinary uploads work on production.
- A real mobile browser can create a photo lot.
- Cron endpoint is scheduled and protected by `CRON_SECRET`.

