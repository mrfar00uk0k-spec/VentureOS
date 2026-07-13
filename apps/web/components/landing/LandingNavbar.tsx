"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] flex justify-center pt-5">
      <div
        className={clsx(
          "flex h-[68px] w-[min(1080px,92%)] items-center justify-between rounded-full border border-border pl-6 pr-3 backdrop-blur-xl transition-all duration-300 ease-out-expo",
          scrolled ? "border-border-strong bg-[rgba(12,13,17,0.78)] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]" : "bg-[rgba(18,19,24,0.35)]"
        )}
      >
        <Link href="/" className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-text-primary">
          <span className="h-[26px] w-[26px] flex-shrink-0 rounded-lg bg-gradient-to-br from-accent-bright to-accent shadow-glow" />
          VentureOS
        </Link>

        <div className="hidden gap-8 md:flex">
          {["Features", "How it Works", "Pricing", "FAQ"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-bright transition-all duration-300 ease-out-expo group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-medium text-text-secondary hover:text-text-primary sm:block">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-b from-accent-bright to-accent px-4 py-2 text-[13.5px] font-semibold text-white shadow-glow transition-transform duration-300 ease-out-expo hover:-translate-y-0.5"
          >
            Start Free Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
}
