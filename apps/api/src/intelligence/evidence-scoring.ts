import { randomUUID } from "crypto";
import type { EvidenceItem, RawEvidence, SourceTier } from "./types";

const REVIEW_PLATFORM_DOMAINS = [
  "g2.com",
  "capterra.com",
  "trustpilot.com",
  "producthunt.com",
  "getapp.com",
  "softwareadvice.com",
];
const COMMUNITY_DOMAINS = ["reddit.com", "news.ycombinator.com", "indiehackers.com", "quora.com"];
const LOW_QUALITY_PATTERNS = ["medium.com", "substack.com", "blogspot.", "wordpress.com"];

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Classifies a URL into the spec's "Source Priority" tiers. Deliberately
 * conservative: without cross-referencing a competitor's own declared
 * domain (a good next step once competitors are known), most results land
 * in "general" rather than being guessed as "official".
 */
export function classifySourceTier(url: string): SourceTier {
  const host = safeHostname(url);
  if (!host) return "general";
  if (REVIEW_PLATFORM_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return "review_platform";
  if (COMMUNITY_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return "community";
  if (LOW_QUALITY_PATTERNS.some((p) => host.includes(p))) return "low_quality";
  return "general";
}

const TIER_WEIGHT: Record<SourceTier, number> = {
  official: 100,
  review_platform: 70,
  community: 55,
  general: 40,
  low_quality: 15,
};

/**
 * Scores every raw evidence item by source-tier weight, boosted when
 * multiple *independent* domains corroborate the same group key (the
 * spec's "Agreement between sources"). Freshness and full source-count
 * weighting are left as a documented next step — generic search snippets
 * rarely carry a reliable publish date to weight against.
 */
export function scoreEvidence(items: RawEvidence[]): EvidenceItem[] {
  const groups = new Map<string, RawEvidence[]>();
  for (const item of items) {
    const key = `${item.category}:${item.groupKey.toLowerCase()}`;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  const scored: EvidenceItem[] = [];
  const now = new Date().toISOString();

  for (const group of groups.values()) {
    const distinctDomains = new Set(group.map((g) => safeHostname(g.url)).filter(Boolean));
    const agreementBoost = Math.min(20, Math.max(0, distinctDomains.size - 1) * 8);

    for (const item of group) {
      const tier = classifySourceTier(item.url);
      const score = Math.max(5, Math.min(100, TIER_WEIGHT[tier] + agreementBoost));

      scored.push({
        ...item,
        id: randomUUID(),
        sourceTier: tier,
        retrievedAt: now,
        score,
      });
    }
  }

  return scored;
}
