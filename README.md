# AI Startup Validator — Full Build

Every milestone from the spec's own Part 10 roadmap now has real, working code behind it. This
README is organized by milestone, in order, so you can see exactly what exists and why. For the
complete backend file-by-file / endpoint-by-endpoint reference, see
[`apps/api/README.md`](apps/api/README.md). For going live, see [`DEPLOYMENT.md`](DEPLOYMENT.md).
For a full walkthrough of running and manually testing every feature locally, see
[`LOCAL_TESTING.md`](LOCAL_TESTING.md).

## Honest status — read this first

Every file described below is real, typed, production-shaped code — not mock data or TODOs. But
it was all written inside a sandboxed environment with **no internet access and no API keys**, so
none of it has been installed, run, or tested against a live database, OpenAI, Brave Search, or
Stripe. Three things follow from that, unavoidably:

1. **Nothing has been run.** `npm install` has never executed here. There is no `package-lock.json`
   yet — the very first `npm install` you run will create one.
2. **Some things need accounts only you can create**: an OpenAI API key, a Brave Search API key, a
   Stripe account (with two Price objects for the Starter/Pro plans), and — only if you want
   Google/GitHub login — an OAuth app registered with each provider. No amount of code changes
   that; it's inherent to using real third-party services.
3. **"Support 1,000,000 users" isn't a file you add.** Scaling, load testing, security audits, and
   uptime are things you validate against a running system over time, not a one-time deliverable.
   What's here is an architecture that doesn't block that future (stateless API, async job
   processing, swappable cache/queue backends) — not a certificate that it's already been proven at
   that scale.

## Milestone 1 — Foundation

The whole design system as tokens (`apps/web/tailwind.config.ts`, `globals.css`): dark
multi-layer charcoal background, one electric-blue accent, 8px spacing, large radii, one `glass`
utility. Core reusable components (`Button`, `GlassCard`, `Input`, `ProgressBar`, `Badge`). The
Express skeleton (`app.ts`, `server.ts`, middleware) and the full Prisma schema.

## Milestone 2 — Landing Page

Fully ported into real React + Tailwind components — `apps/web/app/page.tsx` composes
`components/landing/`: multi-layer animated background, scroll-blur navbar, a parallax hero
dashboard mockup (`HeroVisual.tsx`, fully JS-driven so idle float and cursor tilt combine every
frame instead of fighting over one CSS transform), scroll-reveal sections (`Reveal.tsx`), animated
counters (`Counter.tsx`), and spotlight-on-hover cards (`SpotlightCard.tsx`) — matching Parts 2 and
3B's motion language. The original standalone HTML/CSS/JS preview (shared earlier in this
conversation) was the design reference; every section, copy line, and animation timing was carried
over into the real app rather than re-imagined.

## Milestone 3 — Authentication

Email/password (bcrypt-hashed, email verification, password reset) and Google/GitHub OAuth, all in
`apps/api/src/modules/auth/`. Sessions use a short-lived JWT access token plus a long-lived opaque
refresh token in an `httpOnly` cookie, rotated on every use and stored hashed (never raw) in the
`Session` table so they can be revoked. Login/register/password-reset sit behind a stricter rate
limit than general traffic. No email provider is wired up — verification/reset links are logged to
the console instead of sent; swap in Resend/Postmark/SES before shipping.

## Milestone 4 — Dashboard

`apps/web/app/dashboard/`: a protected layout that redirects to `/login` if `AuthInitializer`'s
silent refresh confirms there's no session; a home page with quick stats and a project list; a
"describe your idea" form that creates a project and starts the pipeline; and a project detail
page that polls the analysis session every 2.5s, rendering a live stage-by-stage checklist, then
the report once it completes. Polling, not a WebSocket/SSE push — a fine first pass; swapping it
out later wouldn't require changing how the page renders, only how it learns about updates.

## Milestone 5 — Project Management

The `projects` module now has the full CRUD surface: create, list, get one, update
(`PATCH /projects/:id`), and delete (`DELETE /projects/:id`, which removes the project's dependent
rows in a transaction first so Postgres's foreign-key constraints don't reject it).

## Milestone 6 — AI Orchestrator

`apps/api/src/ai/orchestrator.ts` runs all 9 agents in the exact order the spec defines: Idea
Understanding → Evidence Collection → *parallel:* Competitors + Keywords → *parallel:* Market +
Reddit + Reviews → Gap Detection → Fact Check → Report. Two deepenings beyond the original
scaffold: `knowledge-cache.ts` caches a full evidence-collection pass per (normalized) idea for 6
hours, so re-analyzing a near-identical idea doesn't pay for a fresh round of searches — the
spec's "never ask the same AI question twice" rule, for real. And `analysis.service.ts` now
persists a growing stage-by-stage timeline into `AnalysisSession.logs` as the pipeline runs — real
Session Memory, not just a final result.

## Milestone 7 — Data Intelligence Layer

This is what "deepen the AI agents" turned out to mean: the original Competitor/Market/Review/
Reddit agents were asking the model to *recall* facts from training data instead of analyzing real
evidence. `apps/api/src/intelligence/` fixes that — a deterministic Search Planner, a real Brave
Search API client behind a swappable interface, six category collectors sharing one fetch
implementation, a Normalizer, a Duplicate Remover, and an Evidence Engine that scores sources by
tier (official > review platform > community > general > low-quality blog) and independent-source
agreement. The five agents that depend on it now require every claim to cite `evidenceUrls`,
enforced by their Zod schemas, not just asked for in the prompt.

## Milestone 8 — Report Generator UI

The project detail page renders the AI Verdict, score, biggest opportunity/risk, a real SWOT 2×2
grid (`components/report/SwotGrid.tsx`, synthesized by `ReportGeneratorAgent` from the validated
knowledge base — not invented), a pain-point tag cloud sized by frequency
(`components/report/PainPointCloud.tsx`, combining review negative-themes and Reddit pain points),
competitor cards now showing real strengths/weaknesses, gap cards with confidence bars, and export
buttons (Milestone 11). What's left of Part 7's visual richness is presentation polish, not
plumbing: an interactive feature-comparison matrix, and a shareable public link with an Open Graph
preview image — the underlying data for both already exists in `Report.data`.

## Milestone 9 — Billing

`apps/api/src/modules/billing/`: a real Stripe Checkout session (subscription mode) and a real
webhook handler for `checkout.session.completed` (activates the subscription, upgrades the user to
`PRO`) and `customer.subscription.deleted` (downgrades back to `FREE`). The webhook route is
registered in `app.ts` *before* the global JSON body parser — Stripe's signature verification needs
the untouched raw request body, and that's gone by the time a normally-mounted router sees it.
Needs `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and a Price ID per plan. A `/dashboard/billing`
page starts checkout for either plan.

## Milestone 10 — Admin Dashboard

Role is now read out of the JWT in `requireAuth` and checked by a new `requireAdmin` guard.
`apps/api/src/modules/admin/` exposes user/project lists and basic aggregate stats to
`ADMIN`/`SUPER_ADMIN` accounts only; `apps/web/app/admin/` is a role-gated page (redirects non-admins
straight back to `/dashboard`) showing a stats row and a user table.

## Milestone 11 — Export System

`GET /api/v1/reports/:id?format=pdf|markdown|json` — real generation for all three, tracked as an
`Export` row per request. PDF uses `pdfkit` (pure JS, no headless browser needed); Markdown and
JSON are built straight from the same `Report.data` the dashboard already reads. The project detail
page has real "Export Markdown / JSON / PDF" buttons that trigger a browser download.

## Milestone 12 — Optimization & Production

- **Real unit tests** (`vitest`) for the Normalizer, the Evidence Engine, and the auth token
  primitives — pure functions, genuinely testable without a running server. Integration, E2E,
  load, security, and AI-evaluation tests are the honest gap: they need a live, deployed system to
  test against, which this sandbox can't provide.
- **CI** (`.github/workflows/ci.yml`): type-checks and tests the API, type-checks and builds the
  web app, on every PR. Will start working the moment there's a `package-lock.json` for it to
  cache against (i.e., after your first real `npm install`).
- **Structured logging** (`apps/api/src/utils/logger.ts`): one JSON line per log, ready to ship to
  a real aggregator without changing call sites.
- **`DEPLOYMENT.md`**: Vercel + Railway/Render + managed Postgres, Stripe webhook setup, OAuth
  redirect URIs, and what to swap before real traffic (Redis-backed queue/rate-limiter, individual
  entity persistence).

---

## What's included

```
ai-startup-validator/
├── DEPLOYMENT.md
├── docker-compose.yml          → Postgres + Redis for local dev
├── .env.example
├── .github/workflows/ci.yml
├── apps/
│   ├── web/                     → Next.js + Tailwind design system
│   │   ├── tailwind.config.ts
│   │   ├── app/
│   │   │   ├── layout.tsx, page.tsx                   → Milestone 2 (full landing page)
│   │   │   ├── login/, register/, auth/callback/     → Milestone 3
│   │   │   ├── dashboard/                             → Milestone 4 (+ billing/ → M9)
│   │   │   └── admin/                                 → Milestone 10
│   │   ├── store/useAuthStore.ts
│   │   ├── lib/{api-client,types}.ts
│   │   └── components/
│   │       ├── ui/         (Button, GlassCard, Input, ProgressBar, Badge)
│   │       ├── landing/    (11 files: Navbar, Hero, HeroVisual, Problem/Solution/Features
│   │       │                sections, HowItWorks, AnalysisPreview, Cta, Footer, + shared
│   │       │                Reveal/Counter/SpotlightCard/Icons primitives)
│   │       └── report/     (SwotGrid, PainPointCloud)
│   └── api/                    → Express + Prisma backend
│       ├── prisma/schema.prisma
│       ├── vitest.config.ts
│       └── src/
│           ├── ai/               → the 9-agent orchestrator + knowledge-cache.ts
│           ├── intelligence/     → Data Intelligence Layer (Milestone 7)
│           ├── modules/
│           │   ├── auth/          → Milestone 3
│           │   ├── projects/      → Milestone 5
│           │   ├── analysis/      → Milestone 6
│           │   ├── billing/       → Milestone 9
│           │   ├── export/        → Milestone 11
│           │   └── admin/         → Milestone 10
│           ├── middleware/, utils/, jobs/
│           └── **/__tests__/     → Milestone 12
```

**For the full file-by-file / endpoint-by-endpoint backend reference, see
[`apps/api/README.md`](apps/api/README.md).**

## Getting started

```bash
cp .env.example apps/api/.env   # fill in JWT_SECRET, OPENAI_API_KEY, BRAVE_SEARCH_API_KEY, ...
docker compose up -d            # Postgres + Redis
cd apps/api && npm install && npx prisma migrate dev --name init && npm run dev
cd apps/web && npm install && npm run dev
```

Open `http://localhost:3000`. See the message earlier in this conversation for the full walkthrough
(API keys, what works without them, OAuth setup), and `DEPLOYMENT.md` for production.

## Roadmap

- [x] Milestone 1 — Foundation
- [x] Milestone 2 — Landing Page *(fully ported to React — see above)*
- [x] Milestone 3 — Authentication
- [x] Milestone 4 — Dashboard
- [x] Milestone 5 — Project Management
- [x] Milestone 6 — AI Orchestrator
- [x] Milestone 7 — Data Intelligence Layer
- [x] Milestone 8 — Report Generator *(SWOT, pain-point cloud, competitor detail all real; feature-matrix + share links are the remaining polish)*
- [x] Milestone 9 — Billing
- [x] Milestone 10 — Admin Dashboard
- [x] Milestone 11 — Export System
- [x] Milestone 12 — Optimization & Production *(unit tests + CI + logging + deployment docs; live-system testing is the open item)*

## A note on this environment

This was built inside a sandboxed container with no network access, so packages couldn't be
installed and nothing could be run or tested against a live database, OpenAI, Brave Search, or
Stripe. If you'd like this actually installed, migrated, and tested end-to-end, either enable
network access for this environment in Settings, or continue the project in **Claude Code**, which
runs on your own machine with full terminal and network access.
