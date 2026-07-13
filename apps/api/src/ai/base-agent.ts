import { z } from "zod";
import { getJsonCompletion } from "./client";
import type { Agent, AgentContext, AgentResult } from "./types";

/**
 * Every concrete agent extends this class and only has to declare a tier,
 * a Zod schema, and two prompt-building methods. Shared logic — calling
 * the multi-provider client, validating the response, computing confidence,
 * and turning failures into a structured result instead of a crash —
 * lives here once.
 */
export abstract class BaseAgent<TOutput> implements Agent<TOutput> {
  abstract readonly name: string;
  protected abstract readonly tier: "fast" | "reasoning";
  protected abstract readonly schema: z.ZodType<TOutput>;

  protected abstract buildSystemPrompt(): string;
  protected abstract buildUserPrompt(context: AgentContext): string;

  async run(context: AgentContext): Promise<AgentResult<TOutput>> {
    try {
      const { data } = await getJsonCompletion<unknown>({
        system: this.buildSystemPrompt(),
        user: this.buildUserPrompt(context),
        tier: this.tier,
      });

      const parsed = this.schema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          confidence: 0,
          data: null,
          summary: `${this.name} returned data that failed schema validation.`,
          error: parsed.error.message,
        };
      }

      return {
        success: true,
        confidence: this.extractConfidence(parsed.data),
        data: parsed.data,
        summary: `${this.name} completed successfully.`,
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        data: null,
        summary: `${this.name} failed to complete.`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private extractConfidence(data: TOutput): number {
    const value = (data as Record<string, unknown>)?.confidence;
    return typeof value === "number" ? value : 50;
  }
}
