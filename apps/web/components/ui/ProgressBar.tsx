interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
}

/**
 * Animates from zero via a CSS transition on `width`, matching the spec's
 * "Progress bars animate from zero" rule. Exposes proper ARIA so screen
 * readers announce the value, not just the visual fill.
 */
export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label && <div className="mb-1.5 text-xs text-text-tertiary">{label}</div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-bright transition-[width] duration-[1200ms] ease-out-expo"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
