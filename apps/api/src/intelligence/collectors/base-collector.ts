import { smartSearch } from "../providers/search-router";
import type { EvidenceCategory, RawEvidence } from "../types";

export interface CollectorTask {
  query: string;
  groupKey: string;
}

/**
 * Runs every task through the smart search router (Tavily → Brave,
 * each with full key-pool rotation). A single task failing never fails
 * the whole collector — the result for that query is simply empty.
 */
export async function collect(
  category: EvidenceCategory,
  tasks: CollectorTask[]
): Promise<RawEvidence[]> {
  const perTask = await Promise.all(
    tasks.map(async (task): Promise<RawEvidence[]> => {
      try {
        const results = await smartSearch(task.query, 8);
        return results.map((r) => ({
          category,
          groupKey: task.groupKey,
          title: r.title,
          snippet: r.snippet,
          url: r.url,
        }));
      } catch (error) {
        console.error(`[intelligence] Collector query failed ("${task.query}"):`, error);
        return [];
      }
    })
  );
  return perTask.flat();
}
