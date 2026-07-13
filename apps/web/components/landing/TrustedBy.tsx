import { Reveal } from "./Reveal";

const BADGES = ["Solo Founders", "Technical Co-founders", "Indie Hackers", "Early-Stage Teams", "Accelerator Alumni"];

export function TrustedBy() {
  return (
    <Reveal className="py-14 text-center">
      <p className="mb-5 text-[13px] tracking-wide text-text-tertiary">USED BY FOUNDERS BUILDING AI STARTUPS</p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {BADGES.map((badge) => (
          <span key={badge} className="rounded-full border border-border px-4 py-2 text-[12.5px] font-medium text-text-tertiary">
            {badge}
          </span>
        ))}
      </div>
    </Reveal>
  );
}
