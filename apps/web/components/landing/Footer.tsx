const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border py-9">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex flex-wrap items-start justify-between gap-7">
          <div className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-text-primary">
            <span className="h-[26px] w-[26px] flex-shrink-0 rounded-lg bg-gradient-to-br from-accent-bright to-accent" />
            VentureOS
          </div>
          <div className="flex flex-wrap gap-7">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13.5px] text-text-tertiary transition-colors hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-[12.5px] text-text-tertiary">© 2026 VentureOS. All rights reserved.</p>
          <div className="flex gap-2.5">
            {[0, 1, 2].map((i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border text-text-tertiary transition-colors hover:border-border-strong hover:text-accent-bright"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[15px] w-[15px]">
                  {i === 0 && <path d="M4 4l16 16M20 4L4 20" />}
                  {i === 1 && (
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 12h8M12 8v8" />
                    </>
                  )}
                  {i === 2 && <rect x="4" y="4" width="16" height="16" rx="4" />}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
