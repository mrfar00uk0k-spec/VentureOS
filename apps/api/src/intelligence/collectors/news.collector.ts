import type { SearchTask } from "../search-planner";
import type { RawEvidence } from "../types";
import { collect } from "./base-collector";

export async function collectNewsEvidence(tasks: SearchTask[]): Promise<RawEvidence[]> {
  const relevant = tasks.filter((t) => t.category === "news");
  return collect(
    "news",
    relevant.map((t) => ({ query: t.query, groupKey: t.query }))
  );
}
