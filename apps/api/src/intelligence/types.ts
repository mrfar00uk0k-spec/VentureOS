import type { IdeaUnderstandingOutput } from "../ai/agents/idea-understanding.agent";

export type EvidenceCategory = "competitor" | "review" | "reddit" | "keyword" | "market" | "news";

/** Mirrors the spec's "Source Priority" tiers, highest to lowest trust. */
export type SourceTier = "official" | "review_platform" | "community" | "general" | "low_quality";

export interface RawEvidence {
  category: EvidenceCategory;
  /** What this result is "about" — used to group and de-duplicate, and to compute source agreement. */
  groupKey: string;
  title: string;
  snippet: string;
  url: string;
}

export interface EvidenceItem extends RawEvidence {
  id: string;
  sourceTier: SourceTier;
  retrievedAt: string; // ISO timestamp
  /** 0-100. Source quality + independent-source agreement, per the spec's Evidence Engine. */
  score: number;
}

export interface KnowledgeBase {
  idea: IdeaUnderstandingOutput;
  evidence: Record<EvidenceCategory, EvidenceItem[]>;
  /** How many evidence items were found per category — feeds the Confidence Engine downstream. */
  coverage: Record<EvidenceCategory, number>;
}
