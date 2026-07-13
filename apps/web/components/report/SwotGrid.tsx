import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { ReportSwot } from "@/lib/types";

const QUADRANTS: Array<{
  key: keyof ReportSwot;
  label: string;
  tone: "success" | "danger" | "accent" | "warning";
}> = [
  { key: "strengths", label: "Strengths", tone: "success" },
  { key: "weaknesses", label: "Weaknesses", tone: "danger" },
  { key: "opportunities", label: "Opportunities", tone: "accent" },
  { key: "threats", label: "Threats", tone: "warning" },
];

export function SwotGrid({ swot }: { swot: ReportSwot }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {QUADRANTS.map((q) => {
        const items = swot[q.key];
        if (!items || items.length === 0) return null;
        return (
          <GlassCard key={q.key} className="p-5">
            <Badge tone={q.tone}>{q.label}</Badge>
            <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
              {items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </GlassCard>
        );
      })}
    </div>
  );
}
