import type { SearchTask } from "../search-planner";
import type { RawEvidence } from "../types";
import { collect } from "./base-collector";

export async function collectReviewEvidence(tasks: SearchTask[]): Promise<RawEvidence[]> {
  const relevant = tasks.filter((t) => t.category === "review");
  return collect(
    "review",
    relevant.map((t) => ({ query: t.query, groupKey: t.query }))
  );
}
