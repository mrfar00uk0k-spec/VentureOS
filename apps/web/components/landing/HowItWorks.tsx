import { Reveal } from "./Reveal";

const STEPS = [
  { title: "Describe your idea", body: "One or two sentences is enough to start." },
  { title: "AI researches the market", body: "Real signals, not guesses." },
  { title: "Analyze competitors", body: "Strengths, weaknesses, and gaps." },
  { title: "Receive a complete report", body: "Clear, evidence-based, shareable." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="mx-auto max-w-[520px] text-center">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-accent-bright">
            How It Works
          </div>
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            From idea to insight in minutes.
          </h2>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-6">
          <div className="pointer-events-none absolute inset-x-[8%] top-[19px] hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delayMs={i * 70} className="relative text-center">
              <div className="relative z-10 mx-auto mb-4.5 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border-strong bg-bg-2 text-sm font-bold text-accent-bright">
                {i + 1}
              </div>
              <h4 className="mb-1.5 text-[0.98rem] font-semibold">{step.title}</h4>
              <p className="text-[0.86rem] text-text-tertiary">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
