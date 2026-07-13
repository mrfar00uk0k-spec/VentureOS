import type { SearchTask } from "../search-planner";
import type { RawEvidence } from "../types";
import { collect } from "./base-collector";

export async function collectMarketEvidence(tasks: SearchTask[]): Promise<RawEvidence[]> {
  const relevant = tasks.filter((t) => t.category === "market");
  return collect(
    "market",
    relevant.map((t) => ({ query: t.query, groupKey: t.query }))
  );
}
