import Link from "next/link";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="flex min-h-[88vh] flex-col items-center justify-center px-6 pb-16 pt-[170px] text-center">
      <h1 className="max-w-[860px] text-[clamp(2.3rem,5.4vw,4.1rem)] font-extrabold leading-[1.08] tracking-tight">
        <span className="block animate-fade-up opacity-0">Validate your startup</span>
        <span className="block animate-fade-up text-text-secondary opacity-0 [animation-delay:120ms]">
          before wasting months building it.
        </span>
      </h1>

      <p className="mt-[22px] max-w-[620px] animate-fade-up text-[1.13rem] text-text-secondary opacity-0 [animation-delay:300ms]">
        Analyze competitors, validate market demand, and uncover hidden gaps — powered by AI,
        before you write a single line of code.
      </p>

      <div className="mt-8 flex animate-fade-up gap-3.5 opacity-0 [animation-delay:420ms]">
        <Link
          href="/register"
          className="rounded-full bg-gradient-to-b from-accent-bright to-accent px-6 py-[13px] text-[14.5px] font-semibold text-white shadow-glow transition-all duration-300 ease-out-expo hover:-translate-y-0.5 active:scale-[0.97]"
        >
          Start Free Validation
        </Link>
        <a
          href="#how-it-works"
          className="rounded-full border border-border-strong bg-white/[0.04] px-6 py-[13px] text-[14.5px] font-semibold text-text-primary backdrop-blur-md transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-white/[0.08] active:scale-[0.97]"
        >
          Watch Demo
        </a>
      </div>

      <div className="w-full animate-fade-up opacity-0 [animation-delay:580ms]">
        <HeroVisual />
      </div>
    </section>
  );
}
