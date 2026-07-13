import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "glass" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  // Premium dark-glass "glow" button: multi-layer background, thin
  // semi-transparent border, an inset top highlight (the glass "catching
  // light"), and a soft accent-tinted glow — all built from this project's
  // own tokens (bg-2/3, accent, border) rather than copying anyone's exact
  // values. Motion is deliberately small: a 1-2px lift, a slightly brighter
  // glow, a gentle compress on click — never a bounce or an overscale.
  primary:
    "rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.10] to-white/[0.03] text-white " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(0,0,0,0.35),0_10px_28px_-10px_rgba(61,107,255,0.45)] " +
    "hover:border-white/[0.2] hover:from-white/[0.13] hover:to-white/[0.05] " +
    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_4px_rgba(0,0,0,0.4),0_16px_36px_-10px_rgba(61,107,255,0.55)] " +
    "hover:-translate-y-[1.5px] active:translate-y-0",
  glass:
    "rounded-full bg-white/[0.04] border border-border-strong backdrop-blur-md text-text-primary hover:bg-white/[0.08] hover:-translate-y-0.5",
  ghost: "rounded-full bg-transparent text-text-secondary hover:text-text-primary",
  danger: "rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15",
};

/**
 * The single Button every surface in the product should use. Motion follows
 * the spec's "Button Hover / Button Click" rules: a small lift on hover, a
 * quick compress-and-return on click, nothing bouncy or elastic.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold",
        "transition-all duration-300 ease-out-expo active:scale-[0.98] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
