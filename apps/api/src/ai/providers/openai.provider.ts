import type { AiProvider, ProviderCompletionParams, ProviderCompletionResult } from "./types";

/**
 * Optional. OpenAI has no meaningful free tier, so this provider is never
 * in the default fallback chain — it only gets used if you explicitly add
 * OPENAI_API_KEYS and put "openai:<model>" into an AI_*_CHAIN env var
 * yourself. See ../client.ts for how the chain is assembled.
 */
export class OpenAiProvider implements AiProvider {
  readonly name = "openai";

  async complete(params: ProviderCompletionParams): Promise<ProviderCompletionResult> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
      throw new Error(`OpenAI error (${res.status}): ${await res.text()}`);
    }

    const payload = await res.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned an empty response.");

    return {
      content,
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    };
  }
}
