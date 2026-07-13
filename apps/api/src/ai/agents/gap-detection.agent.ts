import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { GAP_DETECTION_PROMPT } from "../prompts";

const schema = z.object({
  gaps: z.array(
    z.object({
      title: z.string(),
      reasoning: z.string(),
      businessOpportunity: z.string(),
      difficulty: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high"]),
      evidenceUrls: z.array(z.string()),
      confidence: z.number().min(0).max(100),
    })
  ),
  confidence: z.number().min(0).max(100),
});

export type GapDetectionOutput = z.infer<typeof schema>;

export class GapDetectionAgent extends BaseAgent<GapDetectionOutput> {
  readonly name = "GapDetectionAgent";
  // Explicitly called out in the spec as needing the stronger reasoning model.
  protected readonly tier = "reasoning" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return GAP_DETECTION_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return GAP_DETECTION_PROMPT.buildUser(context.idea, context.knowledgeBase);
  }
}
