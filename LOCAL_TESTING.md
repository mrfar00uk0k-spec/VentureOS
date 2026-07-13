# Local Testing Guide

This walks through getting every piece of the project actually running on your machine, then a
feature-by-feature checklist to confirm each one really works — not just that the code exists.

## 0. What "tested" means here

There's no automated end-to-end test suite in this project (see `apps/api/README.md`'s "Known
gaps" — that needs a live system to run against, which this was built without). What follows is a
manual QA pass: you run the real app and click through every feature yourself. The unit tests
(§2) are the only automated tests that exist; everything else in §5 you verify by hand.

---

## 1. Prerequisites

- **Node.js 18.18+** — check with `node -v`
- **Docker Desktop** (for Postgres + Redis) — or a hosted Postgres (Neon/Supabase/Railway) if you
  don't want to run Docker
- **A code editor** to view logs/edit `.env`, and **two terminal windows** (one per server)

---

## 2. Get your credentials first

Nothing below will work end-to-end without these. Get them before you start the servers, or you'll
be restarting them repeatedly.

| Credential | Where to get it | Required for |
|---|---|---|
| `OPENAI_API_KEY` | platform.openai.com → API keys (needs billing enabled on your OpenAI account) | Every AI agent |
| `BRAVE_SEARCH_API_KEY` | brave.com/search/api → sign up (free tier exists) | Evidence collection |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com, **toggle to Test mode** → Developers → API keys | Billing |
| `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` | Stripe → Products → create two products with a recurring price each; copy each price's ID (`price_...`) | Billing checkout |
| `STRIPE_WEBHOOK_SECRET` | see §5.7 — the Stripe CLI gives you this when you run it locally | Billing webhook |
| `GOOGLE_CLIENT_ID`/`SECRET` *(optional)* | Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web). Redirect URI: `http://localhost:4000/api/v1/auth/google/callback` | Google login |
| `GITHUB_CLIENT_ID`/`SECRET` *(optional)* | GitHub → Settings → Developer settings → OAuth Apps → New OAuth App. Callback URL: `http://localhost:4000/api/v1/auth/github/callback` | GitHub login |

You can skip the OAuth rows entirely if you only want to test email/password login.

---

## 3. Project setup

```bash
unzip ai-startup-validator.zip
cd ai-startup-validator

cp .env.example apps/api/.env
# now open apps/api/.env and fill in: JWT_SECRET (any long random string),
# OPENAI_API_KEY, BRAVE_SEARCH_API_KEY, and the Stripe/OAuth values from §2

docker compose up -d          # starts Postgres + Redis

cd apps/api
npm install
npx prisma migrate dev --name init
```

`prisma migrate dev` will print confirmation that it created the tables. If it errors, check that
`DATABASE_URL` in `.env` matches `docker-compose.yml` (default: `postgresql://postgres:postgres@localhost:5432/ai_startup_validator`).

---

## 4. Run the automated unit tests

Still inside `apps/api`:

```bash
npm test
```

Expect all tests to pass — they're pure-function tests (token hashing, evidence scoring, pricing
normalization) with no database or network dependency, so they should work immediately after
`npm install`, before you even start a server.

---

## 5. Start both servers and walk through every feature

**Terminal 1:**
```bash
cd apps/api
npm run dev
# → "AI Startup Validator API listening on port 4000"
```

**Terminal 2:**
```bash
cd apps/web
npm install
npm run dev
# → ready on http://localhost:3000
```

### 5.1 Health check
Visit `http://localhost:4000/api/v1/health` — should return `{"status":"ok"}`. If this fails,
nothing else will work; check Terminal 1 for the actual error.

### 5.2 Landing page
Visit `http://localhost:3000`. Confirm the background blobs drift, the navbar blurs on scroll, and
scrolling down reveals each section with the fade-up animation. Move your mouse over the hero's
dashboard mockup — it should tilt slightly toward the cursor.

### 5.3 Register + verify email
Click "Start Free Validation" → fill the form → submit. Since no email provider is configured,
check **Terminal 1's logs** for a line like:
```
[auth] Verification link for you@example.com: /verify-email?token=...
```
Copy that token and visit `http://localhost:3000/verify-email?token=<token>` — wait, there's no
frontend page at that route yet (only the backend `GET /auth/verify-email/:token` exists); for
now, hit the backend endpoint directly: `http://localhost:4000/api/v1/auth/verify-email/<token>`.
You should see `{"data":{"message":"Email verified."}}`.

### 5.4 Login + dashboard access control
Log in with the account you just created. You should land on `/dashboard`. Now open an incognito
window and go straight to `http://localhost:3000/dashboard` — it should redirect you to `/login`
within a second (that's `AuthInitializer`'s silent-refresh check completing first, then the guard
kicking in).

### 5.5 Create a project and watch the live analysis
Click "Start New Validation", describe an idea (e.g. "An AI-powered CRM built for dental
clinics"), submit. You should land on the project page and see the 10-stage checklist updating
every ~2.5 seconds. This is the step that needs `OPENAI_API_KEY` and `BRAVE_SEARCH_API_KEY` to be
real — if either is missing or invalid, check Terminal 1 for the specific error (it'll say exactly
which key is missing).

### 5.6 Review the report
Once the pipeline finishes (a few minutes, most of it spent on real web searches + LLM calls),
confirm you see: the overall score and verdict, biggest opportunity/risk, a SWOT grid, competitor
cards (with strengths/weaknesses), gap cards with confidence bars, and a pain-point tag cloud.
Click **Export Markdown**, **Export JSON**, and **Export PDF** — each should download a real file;
open the PDF to confirm it rendered properly.

### 5.7 Billing checkout + webhook
Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:
```bash
stripe login
stripe listen --forward-to localhost:4000/api/v1/billing/webhook
```
This prints a webhook signing secret (`whsec_...`) — put it in `STRIPE_WEBHOOK_SECRET` in your
`.env` and restart the API server. Now go to `http://localhost:3000/dashboard/billing`, click
"Upgrade to Starter", and complete Stripe's test checkout with card `4242 4242 4242 4242`, any
future expiry date, and any 3-digit CVC. After payment, check:
- Terminal running `stripe listen` shows the webhook was delivered
- Terminal 1 logs `"Subscription activated"`
- Reload the dashboard — your account's role should now be `PRO` (visible via Prisma Studio, §5.8)

### 5.8 Inspect/edit the database directly (and test Admin)
```bash
cd apps/api
npx prisma studio
```
Opens a GUI at `http://localhost:5555`. Open the `User` table, find your account, and manually
change `role` to `ADMIN`. Then visit `http://localhost:3000/admin` — you should see the stats row
and user table. Change the role back to `FREE`/`PRO` and confirm `/admin` now redirects you to
`/dashboard`.

### 5.9 Update / delete a project
On any project card, there's no delete button in the UI yet (only the API supports
`PATCH`/`DELETE /projects/:id` — see `apps/api/README.md` §4). Test it directly:
```bash
curl -X DELETE http://localhost:4000/api/v1/projects/<project-id> \
  -H "Authorization: Bearer <your-access-token>"
```
Get `<your-access-token>` from your browser's dev tools (Network tab → any authenticated request →
the `Authorization` header), since it's kept in memory, not a cookie.

### 5.10 OAuth login (only if you configured Google/GitHub in §2)
From `/login`, there's no Google/GitHub button in the UI yet either — the backend routes
(`GET /api/v1/auth/google`, `/github`) work, but they're not linked from the login page. Test by
visiting `http://localhost:4000/api/v1/auth/google` directly in your browser; it should redirect
you to Google's consent screen, then back to `http://localhost:3000/auth/callback` signed in.

---

## 6. If something doesn't work

- **"OPENAI_API_KEY is not configured"** → it's missing or empty in `apps/api/.env`, and the
  server wasn't restarted after you added it (env vars are only read on startup).
- **CORS errors in the browser console** → `WEB_APP_URL` in `.env` doesn't match the URL you're
  actually loading the frontend from.
- **`prisma migrate dev` fails to connect** → Postgres isn't running; check `docker compose ps`,
  or `DATABASE_URL` doesn't match the container's credentials.
- **Stripe webhook signature errors** → `STRIPE_WEBHOOK_SECRET` doesn't match the one `stripe
  listen` just printed (it's regenerated every time you restart that command).
- **A route "doesn't exist" in the UI** (delete project, OAuth login buttons) → correct — see
  §5.9/§5.10, those are real backend endpoints without a frontend button wired to them yet.
