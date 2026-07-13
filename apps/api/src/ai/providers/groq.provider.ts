import type { AiProvider, ProviderCompletionParams, ProviderCompletionResult } from "./types";

/**
 * Groq's free developer tier needs no credit card and hosts several fully
 * free open models (Llama 3.x, etc.) — see GROQ_API_KEYS in .env.example.
 * The API is OpenAI-compatible, so the request/response shape below mirrors
 * the OpenAI provider almost exactly.
 *
 * Known limitation: Groq rate-limits at the account level, not per key —
 * multiple keys from the same Groq account share one quota. This pool
 * still protects against a single revoked/broken key taking the pipeline
 * down; see key-pool.ts for the full explanation.
 */
export class GroqProvider implements AiProvider {
  readonly name = "groq";

  async complete(params: ProviderCompletionParams): Promise<ProviderCompletionResult> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq error (${res.status}): ${await res.text()}`);
    }

    const payload = await res.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned an empty response.");

    return {
      content,
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    };
  }
}
