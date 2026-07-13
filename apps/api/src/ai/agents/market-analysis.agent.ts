import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { MARKET_ANALYSIS_PROMPT } from "../prompts";

const schema = z.object({
  demandScore: z.number().min(0).max(100),
  growthScore: z.number().min(0).max(100),
  difficultyScore: z.number().min(0).max(100),
  competitionScore: z.number().min(0).max(100),
  opportunityScore: z.number().min(0).max(100),
  reasoning: z.string(),
  evidenceUrls: z.array(z.string()),
  confidence: z.number().min(0).max(100),
});

export type MarketAnalysisOutput = z.infer<typeof schema>;

export class MarketAnalysisAgent extends BaseAgent<MarketAnalysisOutput> {
  readonly name = "MarketAnalysisAgent";
  // Business analysis benefits from the stronger reasoning model, per the
  // spec's cost-optimization rule.
  protected readonly tier = "reasoning" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return MARKET_ANALYSIS_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return MARKET_ANALYSIS_PROMPT.buildUser(context.idea, context.knowledgeBase);
  }
}
