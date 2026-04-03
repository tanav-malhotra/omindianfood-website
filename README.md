# OM Indian Restaurant

Next.js restaurant site with:
- Stripe Checkout for online payments
- Prisma + PostgreSQL for order storage
- Protected restaurant dashboard at `/admin`

## Required environment variables

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `AUTH_SECRET`

Generate the admin password hash with:

```bash
npm run hash:admin-password -- "replace-with-strong-password"
```

## Local setup

```bash
npm install
npx prisma migrate deploy
npm run dev
```

## Stripe webhook

For local testing, forward Stripe webhooks to:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the webhook secret Stripe gives you for `STRIPE_WEBHOOK_SECRET`.

## Production deploy checklist

1. Create a hosted PostgreSQL database.
2. Set all production environment variables in Vercel.
3. Run Prisma migrations against production:

```bash
npx prisma migrate deploy
```

4. In Stripe, set the production webhook endpoint to:

```text
https://your-domain.com/api/stripe/webhook
```

5. Give restaurant staff the `/admin/login` credentials.

## Security notes

- Card details are collected only on Stripe-hosted checkout.
- The app uses a signed, HTTP-only admin session cookie.
- `/admin` is protected by middleware.
- The legacy unpaid order endpoint has been disabled.
- Order totals are recalculated on the server from a trusted menu catalog.
