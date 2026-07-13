import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { IconSearch, IconTrendingUp, IconTag, IconMessage, IconTarget } from "./Icons";

const SOLUTIONS = [
  { Icon: IconSearch, title: "Competitor Analysis", body: "See who else is solving this, and how." },
  { Icon: IconTrendingUp, title: "Market Validation", body: "Understand real demand, not assumptions." },
  { Icon: IconTag, title: "Keyword Research", body: "Know what people are actually searching for." },
  { Icon: IconMessage, title: "Review Analysis", body: "Patterns from real customer feedback." },
  { Icon: IconTarget, title: "Gap Detection", body: "Find the opportunities competitors missed." },
];

export function SolutionSection() {
  return (
    <section id="features" className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-accent-bright">
            The Solution
          </div>
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            Everything you need before writing a single line of code.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {SOLUTIONS.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delayMs={i * 70}>
              <SpotlightCard className="h-full text-left">
                <div className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-accent-dim text-accent-bright">
                  <Icon />
                </div>
                <h3 className="mb-2 text-[1.02rem] font-semibold">{title}</h3>
                <p className="text-[0.92rem] text-text-secondary">{body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
