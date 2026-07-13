import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { REDDIT_INSIGHTS_PROMPT } from "../prompts";

const schema = z.object({
  painPoints: z.array(z.object({ summary: z.string(), frequency: z.enum(["low", "medium", "high"]) })),
  featureRequests: z.array(
    z.object({ summary: z.string(), frequency: z.enum(["low", "medium", "high"]) })
  ),
  positiveSignals: z.array(z.string()),
  evidenceUrls: z.array(z.string()),
  confidence: z.number().min(0).max(100),
});

export type RedditInsightsOutput = z.infer<typeof schema>;

export class RedditInsightsAgent extends BaseAgent<RedditInsightsOutput> {
  readonly name = "RedditInsightsAgent";
  protected readonly tier = "fast" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return REDDIT_INSIGHTS_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return REDDIT_INSIGHTS_PROMPT.buildUser(context.idea, context.knowledgeBase);
  }
}
