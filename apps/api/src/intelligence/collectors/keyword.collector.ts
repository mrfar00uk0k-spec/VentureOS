import type { SearchTask } from "../search-planner";
import type { RawEvidence } from "../types";
import { collect } from "./base-collector";

export async function collectKeywordEvidence(tasks: SearchTask[]): Promise<RawEvidence[]> {
  const relevant = tasks.filter((t) => t.category === "keyword");
  return collect(
    "keyword",
    relevant.map((t) => ({ query: t.query, groupKey: t.query }))
  );
}
