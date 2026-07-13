import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { FACT_CHECK_PROMPT } from "../prompts";

const schema = z.object({
  issues: z.array(
    z.object({
      claim: z.string(),
      concern: z.string(),
      recommendedConfidenceAdjustment: z.number(),
    })
  ),
  confidence: z.number().min(0).max(100),
});

export type FactCheckOutput = z.infer<typeof schema>;

export class FactCheckAgent extends BaseAgent<FactCheckOutput> {
  readonly name = "FactCheckAgent";
  protected readonly tier = "reasoning" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return FACT_CHECK_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return FACT_CHECK_PROMPT.buildUser(context.knowledgeBase);
  }
}
