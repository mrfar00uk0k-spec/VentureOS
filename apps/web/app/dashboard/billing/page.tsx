"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";

const PLANS = [
  { id: "starter" as const, name: "Starter", price: "$29/mo", blurb: "For solo founders validating their first idea." },
  { id: "pro" as const, name: "Pro", price: "$79/mo", blurb: "For founders running multiple validations a month." },
];

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(plan: "starter" | "pro") {
    setLoadingPlan(plan);
    setError(null);
    try {
      const { data } = await apiClient.post("/billing/checkout", { plan });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Billing</h1>
        <p className="mt-1 text-sm text-text-secondary">Upgrade for more credits and deeper analyses.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <GlassCard key={plan.id} className="p-6">
            <h2 className="font-semibold text-text-primary">{plan.name}</h2>
            <p className="mt-1 text-2xl font-bold text-accent-bright">{plan.price}</p>
            <p className="mt-2 text-sm text-text-secondary">{plan.blurb}</p>
            <Button
              className="mt-5 w-full"
              onClick={() => upgrade(plan.id)}
              disabled={loadingPlan === plan.id}
            >
              {loadingPlan === plan.id ? "Redirecting…" : `Upgrade to ${plan.name}`}
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
