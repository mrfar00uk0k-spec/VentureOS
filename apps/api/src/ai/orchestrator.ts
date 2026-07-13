import { IdeaUnderstandingAgent } from "./agents/idea-understanding.agent";
import { CompetitorDiscoveryAgent } from "./agents/competitor-discovery.agent";
import { MarketAnalysisAgent } from "./agents/market-analysis.agent";
import { KeywordResearchAgent } from "./agents/keyword-research.agent";
import { RedditInsightsAgent } from "./agents/reddit-insights.agent";
import { ReviewIntelligenceAgent } from "./agents/review-intelligence.agent";
import { GapDetectionAgent } from "./agents/gap-detection.agent";
import { FactCheckAgent } from "./agents/fact-check.agent";
import { ReportGeneratorAgent } from "./agents/report-generator.agent";
import { buildKnowledgeBase } from "../intelligence/knowledge-base-builder";
import { knowledgeCache } from "./knowledge-cache";
import type { AgentContext } from "./types";

export interface OrchestratorProgressEvent {
  stage: string;
  status: "started" | "completed" | "failed";
}

type ProgressListener = (event: OrchestratorProgressEvent) => void;

/**
 * Runs every analysis stage in the exact order the architecture spec
 * defines: idea understanding -> (competitors + keywords in parallel) ->
 * (market + reddit + reviews in parallel) -> gap detection -> fact check
 * -> report generation. Agents never talk to each other directly — only
 * the orchestrator reads and writes the shared knowledge base, exactly as
 * specified in "Agent Communication". Each stage is retried once; if the
 * retry also fails, the orchestrator continues with the remaining stages
 * instead of crashing the whole analysis ("Error Recovery").
 */
export class AnalysisOrchestrator {
  private listeners: ProgressListener[] = [];

  onProgress(listener: ProgressListener) {
    this.listeners.push(listener);
  }

  private emit(event: OrchestratorProgressEvent) {
    this.listeners.forEach((l) => l(event));
  }

  private async runStage<T>(stage: string, task: () => Promise<T>): Promise<T> {
    this.emit({ stage, status: "started" });
    try {
      const result = await task();
      this.emit({ stage, status: "completed" });
      return result;
    } catch {
      try {
        const result = await task();
        this.emit({ stage, status: "completed" });
        return result;
      } catch (finalError) {
        this.emit({ stage, status: "failed" });
        throw finalError;
      }
    }
  }

  async run(context: AgentContext) {
    const knowledgeBase: Record<string, unknown> = { ...context.knowledgeBase };

    const idea = await this.runStage("idea_understanding", () =>
      new IdeaUnderstandingAgent().run(context)
    );
    knowledgeBase.idea = idea.data;

    // Data Intelligence Layer (Part 6): retrieve real evidence before any
    // agent is asked to reason about competitors, reviews, Reddit,
    // keywords, or market conditions. This is what keeps those agents from
    // just recalling plausible-sounding facts from training data instead
    // of analyzing what was actually found. A cache sits in front of it —
    // see knowledge-cache.ts — so re-analyzing (near-)identical ideas
    // doesn't pay for a fresh round of searches every time.
    const intelligence = await this.runStage("evidence_collection", async () => {
      if (!idea.data) return null;
      const cached = knowledgeCache.get(context.idea);
      if (cached) return cached;
      const fresh = await buildKnowledgeBase(idea.data);
      knowledgeCache.set(context.idea, fresh);
      return fresh;
    });
    knowledgeBase.evidence = intelligence?.evidence ?? null;
    knowledgeBase.evidenceCoverage = intelligence?.coverage ?? null;

    const [competitors, keywords] = await Promise.all([
      this.runStage("competitor_discovery", () =>
        new CompetitorDiscoveryAgent().run({ ...context, knowledgeBase })
      ),
      this.runStage("keyword_research", () =>
        new KeywordResearchAgent().run({ ...context, knowledgeBase })
      ),
    ]);
    knowledgeBase.competitors = competitors.data;
    knowledgeBase.keywords = keywords.data;

    const [market, reddit, reviews] = await Promise.all([
      this.runStage("market_analysis", () =>
        new MarketAnalysisAgent().run({ ...context, knowledgeBase })
      ),
      this.runStage("reddit_insights", () =>
        new RedditInsightsAgent().run({ ...context, knowledgeBase })
      ),
      this.runStage("review_analysis", () =>
        new ReviewIntelligenceAgent().run({ ...context, knowledgeBase })
      ),
    ]);
    knowledgeBase.market = market.data;
    knowledgeBase.reddit = reddit.data;
    knowledgeBase.reviews = reviews.data;

    const gaps = await this.runStage("gap_detection", () =>
      new GapDetectionAgent().run({ ...context, knowledgeBase })
    );
    knowledgeBase.gaps = gaps.data;

    const factCheck = await this.runStage("fact_check", () =>
      new FactCheckAgent().run({ ...context, knowledgeBase })
    );
    knowledgeBase.factCheck = factCheck.data;

    const report = await this.runStage("report_generation", () =>
      new ReportGeneratorAgent().run({ ...context, knowledgeBase })
    );

    return { idea, competitors, keywords, market, reddit, reviews, gaps, factCheck, report };
  }
}
