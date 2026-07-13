"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/api-client";

function Callback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("accessToken");

    if (token) {
      setAccessToken(token);
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-text-secondary">
      Signing you in...
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Callback />
    </Suspense>
  );
}
