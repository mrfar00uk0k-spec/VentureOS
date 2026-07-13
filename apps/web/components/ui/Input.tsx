import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * The "Input Experience" from Part 3B: large, rounded, no heavy border,
 * and a soft accent glow on focus instead of a hard outline.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, name, ...props }, ref) => {
    const inputId = id ?? name;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={clsx(
            "w-full rounded-md border border-border bg-white/[0.03] px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary",
            "outline-none transition-all duration-300 ease-out-expo",
            "focus:border-accent focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(61,107,255,0.15)]",
            error && "border-red-500/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
