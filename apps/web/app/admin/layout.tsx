"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [isInitializing, user, router]);

  const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  if (isInitializing || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-text-secondary">
        Checking access…
      </div>
    );
  }

  return <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>;
}
