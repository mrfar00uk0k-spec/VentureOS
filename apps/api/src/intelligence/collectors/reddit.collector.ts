import type { SearchTask } from "../search-planner";
import type { RawEvidence } from "../types";
import { collect } from "./base-collector";
// Uses search router with site:reddit.com queries — no Reddit API key needed.

export async function collectRedditEvidence(tasks: SearchTask[]): Promise<RawEvidence[]> {
  const relevant = tasks.filter((t) => t.category === "reddit");
  return collect(
    "reddit",
    relevant.map((t) => ({ query: t.query, groupKey: t.query }))
  );
}
