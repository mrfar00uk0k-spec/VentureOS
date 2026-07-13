import { z } from "zod";
import { BaseAgent } from "../base-agent";
import type { AgentContext } from "../types";
import { REPORT_GENERATOR_PROMPT } from "../prompts";

const schema = z.object({
  summary: z.string(),
  overallScore: z.number().min(0).max(100),
  verdict: z.string(),
  biggestOpportunity: z.string(),
  biggestRisk: z.string(),
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  confidence: z.number().min(0).max(100),
});

export type ReportGeneratorOutput = z.infer<typeof schema>;

export class ReportGeneratorAgent extends BaseAgent<ReportGeneratorOutput> {
  readonly name = "ReportGeneratorAgent";
  protected readonly tier = "reasoning" as const;
  protected readonly schema = schema;

  protected buildSystemPrompt() {
    return REPORT_GENERATOR_PROMPT.system;
  }

  protected buildUserPrompt(context: AgentContext) {
    return REPORT_GENERATOR_PROMPT.buildUser(context.knowledgeBase);
  }
}
