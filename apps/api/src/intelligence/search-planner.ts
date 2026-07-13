import type { IdeaUnderstandingOutput } from "../ai/agents/idea-understanding.agent";
import type { EvidenceCategory } from "./types";

export interface SearchTask {
  category: EvidenceCategory;
  query: string;
}

/**
 * Deterministic and template-based on purpose — no LLM call needed. This is
 * exactly the kind of formulaic task the spec's cost-optimization rule says
 * shouldn't burn a model call, and a template is more reliable than hoping
 * a model invents sensible search queries.
 *
 * Mirrors the spec's own example almost exactly: "AI CRM for dentists" ->
 * "Find SaaS competitors", "Find clinic software", "Find dentist CRM", ...
 */
export function buildSearchPlan(idea: IdeaUnderstandingOutput): SearchTask[] {
  const subject = idea.solution || idea.valueProposition || idea.industry;
  const industry = idea.industry;
  const customer = idea.targetCustomer;

  const tasks: SearchTask[] = [
    { category: "competitor", query: `${subject} competitors` },
    { category: "competitor", query: `${subject} alternatives` },
    { category: "competitor", query: `best ${industry} software for ${customer}` },
    { category: "competitor", query: `open source ${subject}` },
    { category: "review", query: `${subject} reviews complaints` },
    { category: "review", query: `${subject} pricing reviews` },
    { category: "reddit", query: `site:reddit.com ${industry} ${customer} problems` },
    { category: "reddit", query: `site:reddit.com looking for ${subject}` },
    { category: "keyword", query: `${subject} vs` },
    { category: "keyword", query: `how to choose ${subject}` },
    { category: "market", query: `${industry} market size growth` },
    { category: "news", query: `${industry} startup funding news` },
  ];

  return tasks;
}
