import { PrismaClient } from "@prisma/client";
import { AnalysisOrchestrator } from "../../ai/orchestrator";
import { analysisQueue } from "../../jobs/job-queue";

const prisma = new PrismaClient();

analysisQueue.process(async ({ sessionId, projectId, idea }) => {
  const orchestrator = new AnalysisOrchestrator();

  // idea_understanding, evidence_collection, competitor_discovery, keyword_research,
  // market_analysis, reddit_insights, review_analysis, gap_detection, fact_check, report_generation
  const TOTAL_STAGES = 10;
  let completedCount = 0;
  const stageLog: Array<{ stage: string; status: string; timestamp: string }> = [];

  orchestrator.onProgress((event) => {
    if (event.status === "completed") completedCount += 1;
    stageLog.push({ stage: event.stage, status: event.status, timestamp: new Date().toISOString() });
    prisma.analysisSession
      .update({
        where: { id: sessionId },
        data: {
          currentAgent: event.stage,
          progress: Math.min(100, Math.round((completedCount / TOTAL_STAGES) * 100)),
          // Session Memory (Part 5): a real, growing timeline of what's
          // happened so far, not just the final result — so a session
          // that's interrupted still shows exactly how far it got.
          logs: stageLog as unknown as object,
        },
      })
      .catch((err) => console.error("Failed to persist progress:", err));
  });

  try {
    const result = await orchestrator.run({ projectId, sessionId, idea, knowledgeBase: {} });

    await prisma.analysisSession.update({
      where: { id: sessionId },
      data: { status: "completed", progress: 100, endedAt: new Date() },
    });

    await prisma.report.create({
      data: {
        projectId,
        overallScore: result.report.data?.overallScore ?? 0,
        summary: result.report.data?.summary ?? "Insufficient public evidence.",
        data: {
          verdict: result.report.data?.verdict ?? null,
          biggestOpportunity: result.report.data?.biggestOpportunity ?? null,
          biggestRisk: result.report.data?.biggestRisk ?? null,
          swot: result.report.data?.swot ?? null,
          confidence: result.report.data?.confidence ?? null,
          idea: result.idea.data,
          competitors: result.competitors.data?.competitors ?? [],
          keywords: result.keywords.data?.keywords ?? [],
          market: result.market.data ?? null,
          gaps: result.gaps.data?.gaps ?? [],
          reviews: result.reviews.data ?? null,
          reddit: result.reddit.data ?? null,
          factCheckIssues: result.factCheck.data?.issues ?? [],
        } as object,
      },
    });
  } catch (error) {
    await prisma.analysisSession.update({
      where: { id: sessionId },
      data: { status: "failed", endedAt: new Date() },
    });
    console.error("Analysis pipeline failed:", error);
  }
});

export const analysisService = {
  async start(projectId: string, idea: string) {
    const session = await prisma.analysisSession.create({
      data: { projectId, status: "running" },
    });
    await analysisQueue.add({ sessionId: session.id, projectId, idea });
    return session;
  },

  async getStatus(sessionId: string) {
    return prisma.analysisSession.findUnique({ where: { id: sessionId } });
  },
};
