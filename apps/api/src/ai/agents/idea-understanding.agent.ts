import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { IDEA_UNDERSTANDING_PROMPT } from "../prompts";

const schema = z.object({
  industry: z.string(),
  businessModel: z.string(),
  targetCustomer: z.string(),
  problem: z.string(),
  solution: z.string(),
  revenueModel: z.string(),
  country: z.string().nullable(),
  language: z.string().nullable(),
  valueProposition: z.string(),
  differentiator: z.string(),
  confidence: z.number().min(0).max(100),
});

export type IdeaUnderstandingOutput = z.infer<typeof schema>;

export class IdeaUnderstandingAgent extends BaseAgent<IdeaUnderstandingOutput> {
  readonly name = "IdeaUnderstandingAgent";
  protected readonly tier = "fast" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return IDEA_UNDERSTANDING_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return IDEA_UNDERSTANDING_PROMPT.buildUser(context.idea);
  }
}
