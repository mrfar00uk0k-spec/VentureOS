import type { AiProvider, ProviderCompletionParams, ProviderCompletionResult } from "./types";

/**
 * Google AI Studio's free tier (get a key at aistudio.google.com/apikey,
 * no credit card needed) currently covers the Flash / Flash-Lite model
 * family — see GEMINI_API_KEYS in .env.example. Pro-tier Gemini models are
 * paid only as of 2026, so this provider is intentionally only ever
 * pointed at Flash models by default.
 *
 * Known limitation: Gemini's free-tier quota is per Google Cloud PROJECT,
 * not per API key — multiple keys created under the same project share one
 * quota. Keys from genuinely separate projects/accounts do add up. Either
 * way, this pool still protects against a single bad key; see key-pool.ts.
 *
 * The exact free model lineup shifts fairly often — double check
 * ai.google.dev/gemini-api/docs/pricing before assuming a model name below
 * is still free.
 */
export class GeminiProvider implements AiProvider {
  readonly name = "gemini";

  async complete(params: ProviderCompletionParams): Promise<ProviderCompletionResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": params.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: params.user }] }],
        systemInstruction: { parts: [{ text: params.system }] },
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini error (${res.status}): ${await res.text()}`);
    }

    const payload = await res.json();
    const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Gemini returned an empty response.");

    return {
      content,
      promptTokens: payload.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: payload.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }
}
