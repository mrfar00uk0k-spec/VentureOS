import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { REVIEW_INTELLIGENCE_PROMPT } from "../prompts";

const schema = z.object({
  positiveThemes: z.array(z.object({ theme: z.string(), frequency: z.enum(["low", "medium", "high"]) })),
  negativeThemes: z.array(z.object({ theme: z.string(), frequency: z.enum(["low", "medium", "high"]) })),
  missingFeatures: z.array(z.string()),
  evidenceUrls: z.array(z.string()),
  confidence: z.number().min(0).max(100),
});

export type ReviewIntelligenceOutput = z.infer<typeof schema>;

export class ReviewIntelligenceAgent extends BaseAgent<ReviewIntelligenceOutput> {
  readonly name = "ReviewIntelligenceAgent";
  protected readonly tier = "fast" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return REVIEW_INTELLIGENCE_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return REVIEW_INTELLIGENCE_PROMPT.buildUser(context.idea, context.knowledgeBase);
  }
}
