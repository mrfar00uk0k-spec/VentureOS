import Link from "next/link";
import { Reveal } from "./Reveal";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-[120px]">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="glass mx-auto max-w-[720px] rounded-lg px-8 py-16 text-center">
          <h2 className="mx-auto mb-7 max-w-[560px] text-[clamp(1.8rem,3.6vw,2.6rem)] font-bold leading-tight tracking-tight">
            Stop guessing. Start validating.
          </h2>
          <Link
            href="/register"
            className="inline-flex rounded-full bg-gradient-to-b from-accent-bright to-accent px-6 py-[13px] text-[14.5px] font-semibold text-white shadow-glow transition-all duration-300 ease-out-expo hover:-translate-y-0.5 active:scale-[0.97]"
          >
            Start Free Validation
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
