import type { IdeaUnderstandingOutput } from "../ai/agents/idea-understanding.agent";
import { buildSearchPlan } from "./search-planner";
import { collectCompetitorEvidence } from "./collectors/competitor.collector";
import { collectReviewEvidence } from "./collectors/review.collector";
import { collectRedditEvidence } from "./collectors/reddit.collector";
import { collectKeywordEvidence } from "./collectors/keyword.collector";
import { collectMarketEvidence } from "./collectors/market.collector";
import { collectNewsEvidence } from "./collectors/news.collector";
import { scoreEvidence } from "./evidence-scoring";
import { deduplicateByUrl } from "./deduplicator";
import type { EvidenceCategory, KnowledgeBase } from "./types";

/**
 * Data Intelligence Layer entry point (Part 6). Collectors no longer take
 * a provider argument — the smart search router inside base-collector.ts
 * now handles Tavily → Brave fallback with full key-pool rotation, so this
 * builder stays focused purely on orchestrating the parallel collection and
 * assembling the KnowledgeBase.
 */
export async function buildKnowledgeBase(idea: IdeaUnderstandingOutput): Promise<KnowledgeBase> {
  const plan = buildSearchPlan(idea);

  const [competitor, review, reddit, keyword, market, news] = await Promise.all([
    collectCompetitorEvidence(plan),
    collectReviewEvidence(plan),
    collectRedditEvidence(plan),
    collectKeywordEvidence(plan),
    collectMarketEvidence(plan),
    collectNewsEvidence(plan),
  ]);

  const scored = scoreEvidence([...competitor, ...review, ...reddit, ...keyword, ...market, ...news]);
  const deduped = deduplicateByUrl(scored);

  const byCategory = (category: EvidenceCategory) => deduped.filter((e) => e.category === category);
  const categories: EvidenceCategory[] = ["competitor", "review", "reddit", "keyword", "market", "news"];

  const evidence = {} as KnowledgeBase["evidence"];
  const coverage = {} as KnowledgeBase["coverage"];
  for (const category of categories) {
    const items = byCategory(category);
    evidence[category] = items;
    coverage[category] = items.length;
  }

  return { idea, evidence, coverage };
}
