import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { IconSearch, IconTrendingUp, IconTag, IconMessage, IconTarget, IconSparkle } from "./Icons";

const FEATURES = [
  { Icon: IconSearch, title: "Competitor Analysis", body: "A full map of direct and indirect competitors." },
  { Icon: IconTrendingUp, title: "Market Validation", body: "Demand, growth, and timing, explained." },
  { Icon: IconTag, title: "Keyword Research", body: "Clustered by intent and opportunity." },
  { Icon: IconMessage, title: "Review Intelligence", body: "What customers love, and what they don't." },
  { Icon: IconTarget, title: "Gap Detection", body: "Hidden opportunities, backed by evidence." },
  { Icon: IconSparkle, title: "AI Recommendations", body: "A clear verdict on what to build first." },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="mx-auto max-w-[560px] text-center">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-accent-bright">Features</div>
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            Built for founders who move with evidence.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delayMs={i * 70}>
              <SpotlightCard className="h-full p-7 text-left">
                <div className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-accent-dim text-accent-bright">
                  <Icon />
                </div>
                <h3 className="mb-2 text-[1.05rem] font-semibold">{title}</h3>
                <p className="text-[0.9rem] text-text-secondary">{body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
