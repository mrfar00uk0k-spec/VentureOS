# Deployment Guide

This matches the stack the spec names: Vercel for the frontend, Railway or Render for the
backend + a managed Postgres, and a managed Redis once you swap in the real job queue / rate
limiter (see the "Known gaps" section of `apps/api/README.md`).

## 1. Database

Provision a managed Postgres (Railway, Render, Neon, or Supabase all work). Set `DATABASE_URL` to
its connection string, then run once against it:

```bash
cd apps/api
npx prisma migrate deploy
```

`migrate deploy` (not `migrate dev`) is the one meant for non-interactive production environments.

## 2. Backend (Railway or Render)

- Root directory: `apps/api`
- Build command: `npm install && npx prisma generate && npm run build`
- Start command: `npm run start`
- Environment variables: everything in `.env.example`, with production values —
  `DATABASE_URL`, `JWT_SECRET` (a fresh long random string, not the one from local dev),
  `WEB_APP_URL` (your production frontend URL), `OPENAI_API_KEY`, `BRAVE_SEARCH_API_KEY`,
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`,
  and the Google/GitHub OAuth credentials if you're using those (with `OAUTH_REDIRECT_BASE_URL`
  set to this backend's production URL).

## 3. Frontend (Vercel)

- Root directory: `apps/web`
- Framework preset: Next.js (auto-detected)
- Environment variable: `NEXT_PUBLIC_API_URL` → your deployed backend's `/api/v1` URL.

## 4. Stripe webhook

In the Stripe dashboard, add a webhook endpoint pointing at
`https://<your-backend-domain>/api/v1/billing/webhook`, subscribed to at least
`checkout.session.completed` and `customer.subscription.deleted`. Copy the signing secret Stripe
gives you into `STRIPE_WEBHOOK_SECRET`.

## 5. OAuth redirect URIs

If you're using Google/GitHub login, add these exact callback URLs in each provider's OAuth app
settings:

- `https://<your-backend-domain>/api/v1/auth/google/callback`
- `https://<your-backend-domain>/api/v1/auth/github/callback`

## 6. Before you flip real traffic to it

- Swap `job-queue.ts` and `rateLimiter.ts` for Redis-backed implementations (both files document
  exactly what they need to be replaced with).
- Decide on a real object storage provider (S3, R2, GCS) for exported PDFs if you want them
  retrievable later instead of only streamed once at request time.
- Add the individual `Competitor`/`Keyword`/`Review`/etc. row persistence if you need to query them
  outside of a single report's `data` blob.
- Run `npx prisma migrate deploy` again after every schema change, before deploying the code that
  depends on it.
