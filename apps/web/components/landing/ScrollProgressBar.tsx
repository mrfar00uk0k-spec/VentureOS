"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollProgressBar({ value, label }: { value: number; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => setWidth(value));
          io.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref}>
      {label && <div className="mb-1.5 text-xs text-text-tertiary">{label}</div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-bright transition-[width] duration-[1200ms] ease-out-expo"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
