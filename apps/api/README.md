# Backend Reference — apps/api

A complete map of what exists in the backend right now: every file, the full data model, every
API endpoint, and every environment variable. For the *why* behind each milestone, see the root
`README.md`; this file is the current-state technical reference.

---

## 1. Data model (`prisma/schema.prisma`) — 17 tables

| Table | Purpose | Key fields |
|---|---|---|
| **User** | Every account. | `email`, `passwordHash`, `role` (VISITOR/FREE/PRO/ADMIN/SUPER_ADMIN), `credits`, `emailVerified` |
| **Session** | One row per active refresh token (Milestone 3). | `refreshTokenHash` (never the raw token), `expiresAt`, `revokedAt` |
| **Project** | A founder's startup idea + its current state. | `idea`, `industry`, `status` (DRAFT/ANALYZING/COMPLETED/FAILED), `currentAiScore` |
| **AnalysisSession** | One run of the AI pipeline for a project. | `currentStage`, `progress`, `logs` (a real progressive stage timeline — Milestone 6), `tokenUsage`, `costUsd`, `confidence`, `status` |
| **Competitor** | A discovered competitor. | `pricing` (Json), `strengths`/`weaknesses` (Json), `popularity`, `confidence` |
| **Keyword** | A clustered keyword. | `type` (primary/secondary/long_tail), `intent`, `opportunityScore`, `cluster` |
| **Review** | One grouped review theme (not a raw review). | `sentiment`, `theme`, `frequency`, `sourceUrl` |
| **RedditInsight** | One grouped community insight. | `type` (pain_point/feature_request/complaint/positive), `summary` |
| **MarketAnalysis** | One market-analysis result. | `demandScore`, `growthScore`, `difficultyScore`, `competitionScore`, `opportunityScore`, `reasoning` |
| **GapDetection** | One discovered opportunity gap. | `impact`, `difficulty`, `confidence`, `positioning` |
| **Report** | The final generated report for a project. | `summary`, `overallScore`, `data` (Json — flattened, UI-friendly shape, see §6) |
| **Export** | A requested export of a report (Milestone 11). | `format` (pdf/markdown/json), `fileUrl`, `status` |
| **Subscription** | A user's billing plan (Milestone 9). | `plan`, `status`, `stripeCustomerId`, `stripeSubscriptionId`, `renewsAt` |
| **Invoice** | A billing charge. | `amountUsd`, `status` |
| **Notification** | An in-app notification. | `type`, `message`, `read` |
| **AuditLog** | Who did what, from where (admin/security trail). | `action`, `ipAddress`, `result`, `metadata` |
| **Log** | General structured application logs. | `level`, `service`, `message`, `requestId`, `metadata` |
| **FeatureFlag** | A togglable feature. | `key`, `enabled`, `rolloutPct` |

**Not yet wired up:** `Competitor`, `Keyword`, `Review`, `RedditInsight`, `MarketAnalysis`, and
`GapDetection` rows aren't written as their own rows yet — `analysis.service.ts` persists one
`Report` row per analysis with a flattened object (verdict, opportunity/risk, competitors, gaps,
keywords, market) in its `data` Json column, which the dashboard and export endpoints both read
directly. Writing the individual rows is a small, mechanical addition once something needs to
query them independently of their parent report. `Invoice` and `Notification` also have no writer
yet — Stripe's own dashboard is the source of truth for invoices today, and there's no email/push
delivery mechanism for notifications yet.

---

## 2. File tree

```
apps/api/
├── package.json, tsconfig.json, vitest.config.ts
├── prisma/schema.prisma
└── src/
    ├── server.ts, app.ts
    │
    ├── middleware/
    │   ├── auth.ts                → requireAuth (sets userId + userRole) + requireAdmin
    │   ├── errorHandler.ts, rateLimiter.ts, requestId.ts
    │
    ├── utils/asyncHandler.ts, utils/logger.ts
    ├── jobs/job-queue.ts
    │
    ├── modules/
    │   ├── auth/          → register, login, refresh, logout, password reset, OAuth (M3)
    │   │   └── __tests__/tokens.test.ts
    │   ├── projects/      → full CRUD + latest analysis/report lookups (M5)
    │   ├── analysis/      → starts the pipeline, persists progress + logs (M6)
    │   ├── billing/       → Stripe checkout + webhook (M9)
    │   ├── export/        → PDF/Markdown/JSON report export (M11)
    │   └── admin/         → user/project lists + stats, admin-only (M10)
    │
    ├── intelligence/      → Data Intelligence Layer (M7)
    │   ├── types.ts, search-provider.ts, search-planner.ts, normalizer.ts,
    │   │   deduplicator.ts, evidence-scoring.ts, knowledge-base-builder.ts
    │   ├── collectors/    → competitor / review / reddit / keyword / market / news + base-collector.ts
    │   └── __tests__/     → normalizer.test.ts, evidence-scoring.test.ts
    │
    └── ai/                → the 9-agent orchestrator (M6/M7)
        ├── types.ts, client.ts, base-agent.ts, prompts.ts, knowledge-cache.ts, orchestrator.ts
        └── agents/        → 9 files, one per agent
```

---

## 3. The AI pipeline

**Execution order** (`ai/orchestrator.ts`): Idea Understanding → Evidence Collection (cached — see
`knowledge-cache.ts`) → *parallel:* Competitor Discovery + Keyword Research → *parallel:* Market
Analysis + Reddit Insights + Review Intelligence → Gap Detection → Fact Check → Report Generation.
Every stage retries once on failure, then the pipeline continues without it. Progress (`%`) and a
real stage-by-stage timeline are persisted to `AnalysisSession` as the pipeline runs.

| Agent | Model tier | Grounded in real evidence? |
|---|---|---|
| IdeaUnderstandingAgent | fast | n/a — reads only the user's own idea text |
| CompetitorDiscoveryAgent | fast | ✅ `evidence.competitors`, must cite `evidenceUrls` |
| MarketAnalysisAgent | reasoning | ✅ `evidence.market` + `evidence.news`, cites `evidenceUrls` |
| KeywordResearchAgent | fast | uses `evidence.keywords` as inspiration (synthesis task) |
| RedditInsightsAgent | fast | ✅ `evidence.reddit`, must cite `evidenceUrls` |
| ReviewIntelligenceAgent | fast | ✅ `evidence.reviews`, must cite `evidenceUrls` |
| GapDetectionAgent | reasoning | ✅ must cite `evidenceUrls` traceable to any upstream signal |
| FactCheckAgent | reasoning | reviews every agent above, flags empty `evidenceUrls` / thin `evidenceCoverage` |
| ReportGeneratorAgent | reasoning | organizes the validated knowledge base; never adds new claims |

**Data Intelligence Layer** (`intelligence/`): idea → `search-planner.ts` (deterministic, ~12
templated queries) → 6 parallel collectors → `search-provider.ts` (real Brave Search API) →
`evidence-scoring.ts` (source-tier + independent-source agreement) → `deduplicator.ts` →
`knowledge-base-builder.ts` assembles the `KnowledgeBase` the agents read. `knowledge-cache.ts`
sits in front of the whole thing, keyed by normalized idea text, TTL 6 hours.

---

## 4. API endpoints (all under `/api/v1`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | — | liveness check |
| POST | `/auth/register` | — | rate-limited (10/15min) |
| POST | `/auth/login` | — | rate-limited; sets `refresh_token` httpOnly cookie |
| POST | `/auth/refresh` | cookie | rotates the refresh token |
| POST | `/auth/logout` | cookie | revokes the current session |
| POST | `/auth/password-reset/request`, `/confirm` | — | rate-limited; no email enumeration |
| GET | `/auth/verify-email/:token` | — | |
| GET | `/auth/google`, `/auth/github` (+ `/callback`) | — | real OAuth redirect + code exchange |
| POST | `/projects` | Bearer | create |
| GET | `/projects` | Bearer | list your projects |
| GET | `/projects/:id` | Bearer | get one (only if you own it) |
| PATCH | `/projects/:id` | Bearer | update name/description/industry |
| DELETE | `/projects/:id` | Bearer | deletes the project + all dependent rows in one transaction |
| GET | `/projects/:id/analysis` | Bearer | latest analysis session |
| GET | `/projects/:id/report` | Bearer | latest report |
| POST | `/analysis/start` | Bearer | queues the AI pipeline, returns `202` immediately |
| GET | `/analysis/:id` | Bearer | poll session status/progress *(superseded by `/projects/:id/analysis` in the dashboard, kept for direct session lookups)* |
| POST | `/billing/checkout` | Bearer | creates a Stripe Checkout session, returns its URL |
| POST | `/billing/webhook` | Stripe signature | registered in `app.ts` before the JSON body parser — see the comment there |
| GET | `/reports/:id?format=pdf\|markdown\|json` | Bearer | real export, tracked as an `Export` row |
| GET | `/admin/users`, `/admin/projects`, `/admin/stats` | Bearer + ADMIN/SUPER_ADMIN | read-only |

`Bearer` = `Authorization: Bearer <accessToken>` header. `cookie` = relies on the `refresh_token`
httpOnly cookie instead.

---

## 5. Environment variables

| Variable | Used by | Required to actually run? |
|---|---|---|
| `DATABASE_URL` | Prisma | Yes — every module |
| `REDIS_URL` | *(not yet consumed — see note below)* | Only once you swap in real BullMQ/Redis |
| `JWT_SECRET` | `modules/auth/tokens.ts` | Yes — auth won't start without it |
| `WEB_APP_URL` | CORS, OAuth redirect target, Stripe success/cancel URLs | Yes, once anything other than localhost:3000 is used |
| `OAUTH_REDIRECT_BASE_URL`, `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` | `oauth.service.ts` | Only for social login |
| `OPENAI_API_KEY`, `AI_MODEL_FAST`, `AI_MODEL_REASONING` | `ai/client.ts` | `OPENAI_API_KEY` yes; the model names have working defaults |
| `BRAVE_SEARCH_API_KEY` | `intelligence/search-provider.ts` | Yes — every collector |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` | `modules/billing/` | Yes — every billing endpoint |
| `PORT` | `server.ts` | No — defaults to 4000 |

`REDIS_URL` is in `docker-compose.yml` and `.env.example` because the architecture spec calls for
Redis-backed caching, rate limiting, and job queues in production — but `job-queue.ts`,
`rateLimiter.ts`, and `knowledge-cache.ts` are currently in-memory stand-ins (clearly commented as
such). Nothing reads `REDIS_URL` yet; it's there so the swap, when you make it, is adding a client,
not re-plumbing every caller.

---

## 6. The `Report.data` shape

Written once per completed analysis in `analysis.service.ts`, and read by both the dashboard and
every export format:

```ts
{
  verdict: string | null;
  biggestOpportunity: string | null;
  biggestRisk: string | null;
  confidence: number | null;
  idea: IdeaUnderstandingOutput | null;
  competitors: CompetitorDiscoveryOutput["competitors"];
  keywords: KeywordResearchOutput["keywords"];
  market: MarketAnalysisOutput | null;
  gaps: GapDetectionOutput["gaps"];
  reviews: ReviewIntelligenceOutput | null;
  reddit: RedditInsightsOutput | null;
  factCheckIssues: FactCheckOutput["issues"];
}
```

---

## 7. Known gaps (intentional, not oversights)

- Individual `Competitor`/`Keyword`/`Review`/etc. rows aren't persisted yet (see §1).
- `job-queue.ts`, `rateLimiter.ts`, and `knowledge-cache.ts` are in-memory — fine for one instance,
  not for production (each says so in its own comments).
- `customer.subscription.updated` (plan changes, not just cancellation) isn't handled in the Stripe
  webhook yet — only `checkout.session.completed` and `customer.subscription.deleted` are.
- No email delivery — verification/reset links and any billing/analysis notifications are logged
  to the console, not sent.
- Nothing in this backend has been run — this environment has no network access, so none of it has
  been installed, migrated, or tested against a live database, OpenAI, Brave Search, or Stripe.
