import { HTMLAttributes } from "react";
import clsx from "clsx";

/**
 * The base "floating glass" surface described throughout Parts 1-3 of the
 * spec: soft blur, low opacity, thin border, and a hover state that lifts
 * the card a few pixels rather than scaling it dramatically.
 */
export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "relative rounded-lg border border-border bg-gradient-to-b from-white/[0.05] to-white/[0.02]",
        "backdrop-blur-xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 ease-out-expo",
        "hover:border-border-strong hover:-translate-y-1",
        className
      )}
      {...props}
    />
  );
}
