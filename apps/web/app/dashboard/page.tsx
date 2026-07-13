"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ProjectStatus, ProjectSummary } from "@/lib/types";

const STATUS_TONE: Record<ProjectStatus, "neutral" | "accent" | "success" | "danger"> = {
  DRAFT: "neutral",
  ANALYZING: "accent",
  COMPLETED: "success",
  FAILED: "danger",
};

export default function DashboardHomePage() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get("/projects")
      .then(({ data }) => setProjects(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects."));
  }, []);

  const completed = projects?.filter((p) => p.status === "COMPLETED") ?? [];
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((sum, p) => sum + (p.currentAiScore ?? 0), 0) / completed.length)
      : null;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Your validations</h1>
          <p className="mt-1 text-sm text-text-secondary">Every idea you've run through the pipeline.</p>
        </div>
        <Link href="/dashboard/new">
          <Button>Start New Validation</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Total projects</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{projects?.length ?? "–"}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Completed</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{completed.length}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary">Average score</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{avgScore ?? "–"}</p>
        </GlassCard>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {projects && projects.length === 0 && (
        <GlassCard className="p-10 text-center">
          <p className="text-text-primary">No projects yet.</p>
          <p className="mt-1 text-sm text-text-secondary">
            Describe your first idea to get a full validation report.
          </p>
          <Link href="/dashboard/new">
            <Button className="mt-6">Start New Validation</Button>
          </Link>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects?.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <GlassCard className="h-full p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-text-primary">{project.name}</h3>
                <Badge tone={STATUS_TONE[project.status]}>{project.status}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{project.idea}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary">
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                {project.currentAiScore !== null && (
                  <span className="font-semibold text-accent-bright">{project.currentAiScore}/100</span>
                )}
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
