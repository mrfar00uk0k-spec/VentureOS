import { loadKeyPool, withKeyRotation, type KeyPool } from "../utils/key-pool";
import { GroqProvider } from "./providers/groq.provider";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAiProvider } from "./providers/openai.provider";
import type { AiProvider } from "./providers/types";

type ModelTier = "fast" | "reasoning";

interface CompletionParams {
  system: string;
  user: string;
  tier: ModelTier;
}

export interface CompletionUsage {
  promptTokens: number;
  completionTokens: number;
}

interface ChainStep {
  provider: AiProvider;
  pool: KeyPool;
  model: string;
}

const PROVIDERS: Record<string, AiProvider> = {
  groq: new GroqProvider(),
  gemini: new GeminiProvider(),
  openai: new OpenAiProvider(),
};

const KEY_POOLS: Record<string, KeyPool> = {
  groq: loadKeyPool("groq", "GROQ_API_KEYS"),
  gemini: loadKeyPool("gemini", "GEMINI_API_KEYS"),
  openai: loadKeyPool("openai", "OPENAI_API_KEYS"),
};

// Free-by-default chains: each tier tries Groq first (fastest free tier),
// then falls back to Gemini's free Flash models if every Groq key is
// exhausted or failing. OpenAI is never in the default chain — it has no
// meaningful free tier — but you can add "openai:<model>" to either env
// var yourself if you have a paid key you want as a last-resort fallback.
const DEFAULT_CHAINS: Record<ModelTier, string> = {
  fast: "groq:llama-3.1-8b-instant,gemini:gemini-2.5-flash-lite",
  reasoning: "groq:llama-3.3-70b-versatile,gemini:gemini-2.5-flash",
};

function parseChain(tier: ModelTier): ChainStep[] {
  const envVar = tier === "fast" ? "AI_FAST_CHAIN" : "AI_REASONING_CHAIN";
  const raw = process.env[envVar] || DEFAULT_CHAINS[tier];

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [providerName, model] = entry.split(":").map((s) => s.trim());
      const provider = PROVIDERS[providerName];
      const pool = KEY_POOLS[providerName];
      if (!provider || !pool) return null;
      return { provider, pool, model };
    })
    .filter((step): step is ChainStep => step !== null);
}

/**
 * Tries each (provider, model) pair in the tier's fallback chain, in
 * order. Within a provider, withKeyRotation already rotates across that
 * provider's keys on failure — this loop is the *next* level up: if an
 * entire provider is unusable (no keys configured, or every key
 * exhausted), it moves on to the next provider in the chain instead of
 * failing the whole request. That's the "smart, multi-provider" behavior:
 * two independent layers of fallback, not just one.
 */
export async function getJsonCompletion<T>(
  params: CompletionParams
): Promise<{ data: T; usage: CompletionUsage; provider: string; model: string }> {
  const chain = parseChain(params.tier);

  if (chain.length === 0) {
    throw new Error(
      `No AI providers configured for the "${params.tier}" tier. Add at least one of GROQ_API_KEYS or GEMINI_API_KEYS to your .env.`
    );
  }

  const errors: string[] = [];

  for (const step of chain) {
    if (step.pool.size === 0) {
      errors.push(`${step.provider.name}: no keys configured`);
      continue;
    }

    try {
      const result = await withKeyRotation(step.pool, (apiKey) =>
        step.provider.complete({ system: params.system, user: params.user, model: step.model, apiKey })
      );

      return {
        data: JSON.parse(result.content) as T,
        usage: { promptTokens: result.promptTokens, completionTokens: result.completionTokens },
        provider: step.provider.name,
        model: step.model,
      };
    } catch (error) {
      errors.push(`${step.provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`All AI providers failed for tier "${params.tier}". ${errors.join(" | ")}`);
}
