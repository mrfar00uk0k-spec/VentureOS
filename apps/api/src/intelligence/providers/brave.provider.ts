import type { SearchProvider, SearchResultItem } from "./types";

/** Kept as a fallback alongside Tavily — see BRAVE_SEARCH_API_KEYS in .env.example. */
export class BraveProvider implements SearchProvider {
  readonly name = "brave";

  async search(query: string, apiKey: string, count = 8): Promise<SearchResultItem[]> {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(count));

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
    });
    if (!res.ok) {
      throw new Error(`Brave Search error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const results: Array<{ title: string; url: string; description: string }> = data.web?.results ?? [];
    return results.map((r) => ({ title: r.title, url: r.url, snippet: r.description }));
  }
}
