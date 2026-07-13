import { Reveal } from "./Reveal";
import { Counter } from "./Counter";
import { ScrollProgressBar } from "./ScrollProgressBar";

export function AnalysisPreview() {
  return (
    <section className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="mx-auto max-w-[560px] text-center">
          <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-accent-bright">
            AI Analysis Preview
          </div>
          <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight">
            A dashboard that thinks with you.
          </h2>
        </Reveal>

        <Reveal className="glass mt-12 rounded-lg p-9">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-bg-2 p-[18px]">
              <div className="mb-1.5 text-xs text-text-tertiary">Startup Score</div>
              <div className="text-[1.9rem] font-bold text-text-primary">
                <Counter value={87} />
              </div>
            </div>
            <div className="rounded-md border border-border bg-bg-2 p-[18px]">
              <div className="mb-1.5 text-xs text-text-tertiary">Opportunity</div>
              <div className="text-[1.9rem] font-bold text-text-primary">
                <Counter value={74} />
              </div>
            </div>
            <div className="rounded-md border border-border bg-bg-2 p-[18px]">
              <div className="mb-1.5 text-xs text-text-tertiary">Competition</div>
              <div className="text-[1.9rem] font-bold text-text-primary">
                <Counter value={52} />
              </div>
            </div>
            <div className="rounded-md border border-border bg-bg-2 p-[18px]">
              <div className="mb-1.5 text-xs text-text-tertiary">Gap Detected</div>
              <div className="mt-1 text-[0.88rem] font-semibold text-text-primary">
                Affordable tier for solo founders
              </div>
              <div className="mt-2.5">
                <ScrollProgressBar value={92} />
              </div>
              <div className="mt-1.5 text-[11px] text-text-tertiary">92% confidence</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
