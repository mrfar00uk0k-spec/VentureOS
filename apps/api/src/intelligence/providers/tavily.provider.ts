import type { SearchProvider, SearchResultItem } from "./types";

/**
 * Tavily's free tier (1,000 search credits/month, no card required — see
 * app.tavily.com) is the default search provider now. Unlike Groq/Gemini,
 * Tavily's free credits are tracked per account, so keys from genuinely
 * separate free accounts do add up when rotated through TAVILY_API_KEYS.
 */
export class TavilyProvider implements SearchProvider {
  readonly name = "tavily";

  async search(query: string, apiKey: string, count = 8): Promise<SearchResultItem[]> {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic", // "advanced" costs more credits per call
        max_results: count,
        include_answer: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Tavily error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const results: Array<{ title: string; url: string; content: string }> = data.results ?? [];
    return results.map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
  }
}
