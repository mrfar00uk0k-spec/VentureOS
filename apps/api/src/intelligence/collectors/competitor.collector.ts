import type { SearchTask } from "../search-planner";
import type { RawEvidence } from "../types";
import { collect } from "./base-collector";

export async function collectCompetitorEvidence(tasks: SearchTask[]): Promise<RawEvidence[]> {
  const relevant = tasks.filter((t) => t.category === "competitor");
  return collect(
    "competitor",
    relevant.map((t) => ({ query: t.query, groupKey: t.query }))
  );
}
