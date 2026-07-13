import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { COMPETITOR_DISCOVERY_PROMPT } from "../prompts";

const schema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      website: z.string().nullable(),
      description: z.string(),
      category: z.string(),
      targetCustomer: z.string(),
      pricingModel: z.string().nullable(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      popularity: z.enum(["low", "medium", "high"]),
      confidence: z.number().min(0).max(100),
      evidenceUrls: z.array(z.string()),
    })
  ),
  confidence: z.number().min(0).max(100),
});

export type CompetitorDiscoveryOutput = z.infer<typeof schema>;

export class CompetitorDiscoveryAgent extends BaseAgent<CompetitorDiscoveryOutput> {
  readonly name = "CompetitorDiscoveryAgent";
  protected readonly tier = "fast" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return COMPETITOR_DISCOVERY_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return COMPETITOR_DISCOVERY_PROMPT.buildUser(context.idea, context.knowledgeBase);
  }
}
