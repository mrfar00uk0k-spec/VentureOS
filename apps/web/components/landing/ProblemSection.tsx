import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { IconClock, IconSearch, IconTrendingUp } from "./Icons";

const PROBLEMS = [
  {
    Icon: IconClock,
    title: "Building blindly wastes time",
    body: "Every week spent coding before validating is a week you can't get back.",
  },
  {
    Icon: IconSearch,
    title: "Competition is unclear",
    body: "It's hard to know who you're really up against, or where they fall short.",
  },
  {
    Icon: IconTrendingUp,
    title: "Market demand is uncertain",
    body: 'Without evidence, "people will want this" is just a guess.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 sm:py-[120px]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-9 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
        <Reveal>
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-accent-bright">
            The Problem
          </div>
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            Most startups fail for reasons founders could have known in advance.
          </h2>
          <p className="mt-3.5 max-w-[560px] text-[1.02rem] text-text-secondary">
            Months of building, only to discover the market already answered the question.
          </p>
        </Reveal>

        <div className="grid gap-3.5">
          {PROBLEMS.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delayMs={i * 70}>
              <SpotlightCard>
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
