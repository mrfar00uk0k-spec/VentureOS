"use client";

import { useEffect, useRef } from "react";
import { Counter } from "./Counter";
import { ScrollProgressBar } from "./ScrollProgressBar";

export function HeroVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  // Continuous float + mouse-parallax tilt, fully JS-driven so the two
  // motions (idle float, cursor tilt) can be combined every frame instead
  // of fighting over the same CSS `transform` property.
  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;

    let t = Math.random() * 10;
    let targetRX = 0;
    let targetRY = 0;
    let curRX = 0;
    let curRY = 0;
    let frame: number;

    function loop() {
      t += 0.008;
      const floatY = Math.sin(t) * 8;
      curRX += (targetRX - curRX) * 0.06;
      curRY += (targetRY - curRY) * 0.06;
      if (card) {
        card.style.transform = `translateY(${floatY}px) rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      }
      frame = requestAnimationFrame(loop);
    }
    loop();

    function onMove(e: MouseEvent) {
      const rect = wrap!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = px * 6;
      targetRX = -py * 6;
    }
    function onLeave() {
      targetRX = 0;
      targetRY = 0;
    }

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // The score ring animates its stroke-dashoffset once, on scroll into view.
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const r = ring.r.baseVal.value;
    const circumference = 2 * Math.PI * r;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const pct = 87;
          requestAnimationFrame(() => {
            ring.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)";
            ring.style.strokeDashoffset = `${circumference * (1 - pct / 100)}`;
          });
          io.unobserve(ring);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(ring);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="mt-16 flex w-full justify-center [perspective:1400px]">
      <div ref={cardRef} className="glass w-full max-w-3xl rounded-lg p-6 will-change-transform">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-bg-2 p-4 text-left">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-text-tertiary">AI Score</div>
            <div className="flex items-center gap-3.5">
              <svg viewBox="0 0 60 60" className="h-14 w-14">
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
                <circle
                  ref={ringRef}
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="url(#heroRingGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                />
                <defs>
                  <linearGradient id="heroRingGradient">
                    <stop offset="0%" stopColor="#6f95ff" />
                    <stop offset="100%" stopColor="#3d6bff" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <div className="text-xl font-bold text-text-primary">
                  <Counter value={87} />
                </div>
                <div className="text-xs text-text-tertiary">Excellent</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-bg-2 p-4 text-left">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-text-tertiary">Market Demand</div>
            <div className="text-[17px] font-semibold text-text-primary">High</div>
            <div className="mt-2.5">
              <ScrollProgressBar value={78} />
            </div>
          </div>

          <div className="rounded-md border border-border bg-bg-2 p-4 text-left">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-text-tertiary">Competition</div>
            <div className="text-[17px] font-semibold text-text-primary">Moderate</div>
            <div className="mt-2.5">
              <ScrollProgressBar value={52} />
            </div>
          </div>

          <div className="col-span-2 rounded-md border border-border bg-bg-2 p-4 text-left sm:col-span-3">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-text-tertiary">Keyword Opportunity</div>
            <div className="flex h-10 items-end gap-1">
              {[35, 55, 40, 75, 60, 90, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-b from-accent-bright to-accent opacity-85"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
