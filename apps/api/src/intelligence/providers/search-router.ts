import { loadKeyPool, withKeyRotation, type KeyPool } from "../../utils/key-pool";
import { logger } from "../../utils/logger";
import { TavilyProvider } from "./tavily.provider";
import { BraveProvider } from "./brave.provider";
import type { SearchProvider, SearchResultItem } from "./types";

interface SearchChainStep {
  provider: SearchProvider;
  pool: KeyPool;
}

const SEARCH_PROVIDERS: Record<string, SearchProvider> = {
  tavily: new TavilyProvider(),
  brave: new BraveProvider(),
};

const SEARCH_KEY_POOLS: Record<string, KeyPool> = {
  tavily: loadKeyPool("tavily", "TAVILY_API_KEYS"),
  brave: loadKeyPool("brave", "BRAVE_SEARCH_API_KEYS"),
};

// Default chain: Tavily first (better context snippets, free credits/account),
// then Brave as a fallback. Override by setting SEARCH_CHAIN env var to a
// comma-separated list like "tavily,brave" or just "brave".
const DEFAULT_SEARCH_CHAIN = "tavily,brave";

function parseSearchChain(): SearchChainStep[] {
  const raw = process.env.SEARCH_CHAIN ?? DEFAULT_SEARCH_CHAIN;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => {
      const provider = SEARCH_PROVIDERS[name];
      const pool = SEARCH_KEY_POOLS[name];
      if (!provider || !pool) return null;
      return { provider, pool };
    })
    .filter((s): s is SearchChainStep => s !== null);
}

/**
 * The smart search entry-point. Identical two-layer fallback strategy to
 * the AI client: key-rotation within a provider (withKeyRotation), then
 * provider-rotation across the chain if all of that provider's keys fail.
 */
export async function smartSearch(query: string, count = 8): Promise<SearchResultItem[]> {
  const chain = parseSearchChain();
  const errors: string[] = [];

  for (const step of chain) {
    if (step.pool.size === 0) {
      errors.push(`${step.provider.name}: no keys configured`);
      continue;
    }

    try {
      const results = await withKeyRotation(step.pool, (apiKey) =>
        step.provider.search(query, apiKey, count)
      );
      logger.info("Search completed", { provider: step.provider.name, query: query.slice(0, 60) });
      return results;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${step.provider.name}: ${msg}`);
      logger.warn("Search provider failed, trying next", { provider: step.provider.name });
    }
  }

  // Return empty rather than crashing the whole pipeline — search failure
  // means agents get less evidence and confidence drops, but the analysis
  // still runs instead of the user seeing a hard error.
  logger.error("All search providers failed", { errors, query: query.slice(0, 60) });
  return [];
}
