"use client";

import { Reveal } from "./Reveal";

interface Testimonial {
  quote: string;
  name: string;
  handle: string;
  verified?: boolean;
}

// Illustrative placeholder quotes, not real customer testimonials — swap
// these for real ones once the product has real users. Avatars are
// initials-only (no photos) for the same reason.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Found out our \"unique\" feature was already in six competitors' free tier. Saved us three months of building the wrong thing.",
    name: "Jordan Ellis",
    handle: "@jordan_builds",
    verified: true,
  },
  {
    quote: "The gap detection flagged a pricing tier nobody else in the space offers. That's the whole pitch now.",
    name: "Priya Nair",
    handle: "@priyabuilds",
  },
  {
    quote:
      "I've run three ideas through this so far. It's the first validation tool I've used that actually cites where a claim came from instead of just asserting it.",
    name: "Sam Torres",
    handle: "@samtorres",
    verified: true,
  },
  {
    quote: "The Reddit pain-point summary alone was worth it — repositioned our onboarding around what people were actually complaining about.",
    name: "Marcus Chen",
    handle: "@marcusbuilds",
  },
  {
    quote: "Told us plainly that evidence was thin for our market-size estimate instead of making up a confident number. That's rare.",
    name: "Alina Novak",
    handle: "@alinacodes",
    verified: true,
  },
  {
    quote: "Went from idea to a real report in under ten minutes. Would've taken me a weekend of manual searching.",
    name: "Deepak Rao",
    handle: "@deepakrao",
  },
  {
    quote: "The competitor breakdown caught two direct competitors we genuinely didn't know existed.",
    name: "Fatima Zahra",
    handle: "@fatimabuilds",
  },
  {
    quote: "Not flashy, just useful. The confidence scores kept us from over-trusting a thin result.",
    name: "Owen Baptiste",
    handle: "@owenb",
    verified: true,
  },
  {
    quote: "Reworked our whole roadmap after the gap detection report. Worth the ten minutes it took to run.",
    name: "Lena Kowalski",
    handle: "@lenak",
  },
];

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 flex-shrink-0 text-accent-bright" fill="currentColor" aria-label="Verified">
      <path d="M10 1.5l2.1 1.6 2.6-.4 1 2.4 2.4 1-.4 2.6 1.6 2.1-1.6 2.1.4 2.6-2.4 1-1 2.4-2.6-.4L10 20l-2.1-1.6-2.6.4-1-2.4-2.4-1 .4-2.6L.7 10.6l1.6-2.1-.4-2.6 2.4-1 1-2.4 2.6.4L10 1.5z" />
      <path d="M7 10l2 2 4-4" stroke="#0e0f13" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const initials = item.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="group glass relative mb-4 break-inside-avoid overflow-hidden rounded-[20px] p-5 transition-all duration-[400ms] ease-out-expo hover:-translate-y-1 hover:border-border-strong">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out-expo group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--mx,50%) var(--my,20%), rgba(111,149,255,.12), transparent 65%)",
        }}
      />
      <div
        className="relative"
        onMouseMove={(e) => {
          const el = e.currentTarget.parentElement as HTMLDivElement;
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          el.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-bright/30 to-accent/30 text-[11px] font-semibold text-accent-bright">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-semibold text-text-primary">{item.name}</span>
              {item.verified && <VerifiedBadge />}
            </div>
            <div className="text-xs text-text-tertiary">{item.handle}</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">{item.quote}</p>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            Loved by early founders
          </h2>
          <p className="mt-3 text-[1.02rem] text-text-secondary">
            Here&apos;s what a few of them said about validating with real evidence.
          </p>
        </Reveal>

        <Reveal className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-4" delayMs={70}>
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.handle} item={item} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
