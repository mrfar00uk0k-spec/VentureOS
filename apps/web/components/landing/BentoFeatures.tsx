import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { Counter } from "./Counter";

function MiniBar({ label, value, tone = "accent" }: { label: string; value: number; tone?: "accent" | "green" | "amber" }) {
  const barColor =
    tone === "green" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-gradient-to-r from-accent to-accent-bright";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-text-tertiary">
        <span>{label}</span>
        <span className="font-medium text-text-secondary">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CompetitorCard() {
  const rows = [
    { name: "Acme CRM", score: 74 },
    { name: "ClinicFlow", score: 61 },
    { name: "OpenDesk", score: 45 },
  ];
  return (
    <>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">Discovered</p>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-2 text-xs">
            <span className="text-text-secondary">{r.name}</span>
            <span className="font-semibold text-accent-bright">{r.score}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function MarketCard() {
  return (
    <div className="space-y-3">
      <MiniBar label="Demand" value={78} />
      <MiniBar label="Growth" value={64} tone="green" />
      <MiniBar label="Difficulty" value={42} tone="amber" />
    </div>
  );
}

function EvidenceCard() {
  const tiers = [
    { label: "Official sources", count: 12 },
    { label: "Review platforms", count: 9 },
    { label: "Community", count: 21 },
    { label: "General web", count: 15 },
  ];
  return (
    <>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">Evidence collected</p>
      <ul className="space-y-3">
        {tiers.map((t) => (
          <li key={t.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" />
              {t.label}
            </span>
            <span className="font-semibold text-text-primary">{t.count}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function KeywordCard() {
  const tags = [
    { term: "dental crm software", score: 82 },
    { term: "clinic management app", score: 71 },
    { term: "ai crm for clinics", score: 90 },
    { term: "patient scheduling tool", score: 58 },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t.term}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-[11px] text-text-secondary"
        >
          {t.term}
          <span className="font-semibold text-accent-bright">{t.score}</span>
        </span>
      ))}
    </div>
  );
}

function ScoreCard() {
  const circumference = 2 * Math.PI * 42;
  return (
    <div className="flex h-full flex-col justify-between">
      <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">AI Score</p>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="h-24 w-24 flex-shrink-0 -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#bentoScoreGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - 0.87)}
          />
          <defs>
            <linearGradient id="bentoScoreGradient">
              <stop offset="0%" stopColor="#6f95ff" />
              <stop offset="100%" stopColor="#3d6bff" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <div className="text-4xl font-bold text-text-primary">
            <Counter value={87} />
          </div>
          <p className="mt-1 text-xs text-text-tertiary">Excellent — high confidence</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Fact-checked against 57 sources
      </div>
    </div>
  );
}

function GapCard() {
  return (
    <>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">Gap detected</p>
      <p className="text-sm font-medium text-text-primary">Affordable tier for solo clinics</p>
      <div className="mt-3 flex gap-1.5">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          High impact
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
          92% confidence
        </span>
      </div>
    </>
  );
}

function ReviewCard() {
  return (
    <>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">Review sentiment</p>
      <MiniBar label="Positive" value={64} tone="green" />
      <div className="mt-2.5">
        <MiniBar label="Negative" value={36} />
      </div>
    </>
  );
}

function FactCheckCard() {
  const claims = ["Competition is moderate", "Demand is growing", "No native mobile app found"];
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      {claims.map((c) => (
        <div key={c} className="flex items-center gap-2 text-sm text-text-secondary">
          <svg viewBox="0 0 20 20" className="h-4 w-4 flex-shrink-0 text-accent-bright" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {c}
        </div>
      ))}
    </div>
  );
}

export function BentoFeatures() {
  return (
    <section className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="max-w-[560px]">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-accent-bright">Under the hood</div>
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            The full research stack, in one pass.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[170px]">
          <div className="md:col-start-1 md:row-start-1">
            <SpotlightCard className="h-full">
              <p className="mb-1 text-sm font-semibold text-text-primary">Competitor Analysis</p>
              <CompetitorCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-2 md:row-start-1">
            <SpotlightCard className="h-full">
              <p className="mb-3 text-sm font-semibold text-text-primary">Market Validation</p>
              <MarketCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-3 md:row-start-1 md:row-span-2">
            <SpotlightCard className="h-full">
              <p className="mb-1 text-sm font-semibold text-text-primary">Evidence Engine</p>
              <EvidenceCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-1 md:row-start-2 md:col-span-2">
            <SpotlightCard className="h-full">
              <p className="mb-3 text-sm font-semibold text-text-primary">Keyword Research</p>
              <KeywordCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-1 md:row-start-3 md:col-span-2 md:row-span-2">
            <SpotlightCard className="h-full">
              <ScoreCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-3 md:row-start-3">
            <SpotlightCard className="h-full">
              <GapCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-3 md:row-start-4">
            <SpotlightCard className="h-full">
              <ReviewCard />
            </SpotlightCard>
          </div>

          <div className="md:col-start-1 md:row-start-5 md:col-span-3">
            <SpotlightCard className="h-full">
              <p className="mb-1 text-sm font-semibold text-text-primary">Fact-Checked Reports</p>
              <FactCheckCard />
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
