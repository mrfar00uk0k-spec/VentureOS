"use client";

import { useRef } from "react";
import clsx from "clsx";

export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={clsx(
        "glass group relative overflow-hidden rounded-lg p-6 transition-all duration-300 ease-out-expo",
        "hover:-translate-y-1 hover:border-border-strong",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out-expo group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(111,149,255,.14), transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
