"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { SwotGrid } from "@/components/report/SwotGrid";
import { PainPointCloud } from "@/components/report/PainPointCloud";
import { apiClient, downloadFile } from "@/lib/api-client";
import type { ProjectReport, ProjectSummary } from "@/lib/types";

// Mirrors the exact stage keys the orchestrator emits — see
// apps/api/src/ai/orchestrator.ts.
const STAGES = [
  { key: "idea_understanding", label: "Idea Understanding" },
  { key: "evidence_collection", label: "Evidence Collection" },
  { key: "competitor_discovery", label: "Competitors" },
  { key: "keyword_research", label: "Keywords" },
  { key: "market_analysis", label: "Market" },
  { key: "reddit_insights", label: "Reddit" },
  { key: "review_analysis", label: "Reviews" },
  { key: "gap_detection", label: "Gap Detection" },
  { key: "fact_check", label: "Fact Check" },
  { key: "report_generation", label: "Report" },
];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [{ data: proj }, sessionResult] = await Promise.all([
          apiClient.get(`/projects/${params.id}`),
          apiClient.get(`/projects/${params.id}/analysis`).catch(() => ({ data: null })),
        ]);
        if (cancelled) return;

        setProject(proj);
        setCurrentStage(sessionResult.data?.currentAgent ?? null);
        setSessionStatus(sessionResult.data?.status ?? null);

        if (sessionResult.data?.status === "completed") {
          const reportResult = await apiClient.get(`/projects/${params.id}/report`).catch(() => ({ data: null }));
          if (!cancelled) setReport(reportResult.data);
          if (pollRef.current) clearInterval(pollRef.current);
        }
        if (sessionResult.data?.status === "failed" && pollRef.current) {
          clearInterval(pollRef.current);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load this project.");
      }
    }

    poll();
    // Polling, not a push-based subscription — a reasonable first pass. A
    // WebSocket/SSE upgrade (see Part 9's "Real-Time Experience") is a
    // clean next step and wouldn't require changing this page's rendering.
    pollRef.current = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params.id]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!project) return <p className="text-sm text-text-secondary">Loading…</p>;

  const stageIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">{project.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">{project.idea}</p>
      </div>

      {sessionStatus !== "completed" && (
        <GlassCard className="p-6">
          <h2 className="text-sm font-semibold text-text-primary">
            {sessionStatus === "failed" ? "Analysis failed" : "Analysis in progress"}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {STAGES.map((stage, i) => {
              const done = stageIndex >= 0 && i < stageIndex;
              const active = i === stageIndex && sessionStatus !== "failed";
              return (
                <li key={stage.key} className="flex items-center gap-3 text-sm">
                  <span className={done ? "text-accent-bright" : active ? "text-text-primary" : "text-text-tertiary"}>
                    {done ? "✓" : active ? "…" : "—"}
                  </span>
                  <span className={active ? "text-text-primary" : "text-text-secondary"}>{stage.label}</span>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}

      {report && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-text-primary">AI Verdict</h2>
              <span className="text-2xl font-bold text-accent-bright">{report.overallScore}/100</span>
            </div>
            <p className="mt-3 text-sm text-text-secondary">{report.summary}</p>
            {report.data.verdict && (
              <Badge tone="accent" className="mt-4">
                {report.data.verdict}
              </Badge>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="glass" className="text-xs" onClick={() => downloadFile(`/reports/${report.id}?format=markdown`, "report.md")}>
                Export Markdown
              </Button>
              <Button variant="glass" className="text-xs" onClick={() => downloadFile(`/reports/${report.id}?format=json`, "report.json")}>
                Export JSON
              </Button>
              <Button variant="glass" className="text-xs" onClick={() => downloadFile(`/reports/${report.id}?format=pdf`, "report.pdf")}>
                Export PDF
              </Button>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-5">
              <p className="text-xs text-text-tertiary">Biggest opportunity</p>
              <p className="mt-2 text-sm text-text-primary">{report.data.biggestOpportunity ?? "—"}</p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs text-text-tertiary">Biggest risk</p>
              <p className="mt-2 text-sm text-text-primary">{report.data.biggestRisk ?? "—"}</p>
            </GlassCard>
          </div>

          {report.data.competitors.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Competitors</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.data.competitors.map((c) => (
                  <GlassCard key={c.name} className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-text-primary">{c.name}</h3>
                      <Badge>{c.popularity}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{c.description}</p>
                    {c.strengths.length > 0 && (
                      <p className="mt-3 text-xs text-text-tertiary">
                        <span className="font-medium text-emerald-400">Strengths — </span>
                        {c.strengths.join(", ")}
                      </p>
                    )}
                    {c.weaknesses.length > 0 && (
                      <p className="mt-1.5 text-xs text-text-tertiary">
                        <span className="font-medium text-red-400">Weaknesses — </span>
                        {c.weaknesses.join(", ")}
                      </p>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {report.data.gaps.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Gap Detection</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {report.data.gaps.map((g) => (
                  <GlassCard key={g.title} className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-text-primary">{g.title}</h3>
                      <Badge tone="success">{g.impact} impact</Badge>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{g.businessOpportunity}</p>
                    <div className="mt-3">
                      <ProgressBar value={g.confidence} label="Confidence" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {report.data.swot && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">SWOT</h2>
              <SwotGrid swot={report.data.swot} />
            </div>
          )}

          {(report.data.reviews || report.data.reddit) && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">Customer Voice</h2>
              <GlassCard className="p-5">
                <PainPointCloud
                  items={[
                    ...(report.data.reviews?.negativeThemes ?? []).map((t) => ({
                      text: t.theme,
                      frequency: t.frequency,
                    })),
                    ...(report.data.reddit?.painPoints ?? []).map((p) => ({
                      text: p.summary,
                      frequency: p.frequency,
                    })),
                  ]}
                />
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
