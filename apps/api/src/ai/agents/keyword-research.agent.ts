import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { KEYWORD_RESEARCH_PROMPT } from "../prompts";

const schema = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      type: z.enum(["primary", "secondary", "long_tail"]),
      intent: z.enum(["commercial", "informational"]),
      opportunityScore: z.number().min(0).max(100),
      cluster: z.string(),
    })
  ),
  confidence: z.number().min(0).max(100),
});

export type KeywordResearchOutput = z.infer<typeof schema>;

export class KeywordResearchAgent extends BaseAgent<KeywordResearchOutput> {
  readonly name = "KeywordResearchAgent";
  protected readonly tier = "fast" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return KEYWORD_RESEARCH_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return KEYWORD_RESEARCH_PROMPT.buildUser(context.idea, context.knowledgeBase);
  }
}
