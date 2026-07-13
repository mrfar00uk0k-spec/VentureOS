"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const logout = useAuthStore((s) => s.logout);

  // AuthInitializer (mounted in the root layout) tries a silent refresh on
  // load. Only redirect once that's actually resolved — otherwise a
  // logged-in user gets bounced to /login for the split second before
  // their session comes back.
  useEffect(() => {
    if (!isInitializing && !user) {
      router.replace("/login");
    }
  }, [isInitializing, user, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-text-secondary">
        Loading your workspace…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <span className="h-6 w-6 flex-shrink-0 rounded-lg bg-gradient-to-br from-accent-bright to-accent" />
            VentureOS
          </Link>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <Link href="/dashboard/billing" className="hover:text-text-primary">
              Billing
            </Link>
            <span>{user.name ?? user.email}</span>
            <Button
              variant="ghost"
              onClick={() => {
                logout().then(() => router.push("/login"));
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
