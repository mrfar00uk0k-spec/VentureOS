import type { KnowledgeBase } from "../intelligence/types";

interface CacheEntry {
  value: KnowledgeBase;
  expiresAt: number;
}

// Evidence doesn't meaningfully change minute to minute, so a multi-hour
// TTL is safe and saves real search-API cost.
const TTL_MS = 6 * 60 * 60 * 1000;
const store = new Map<string, CacheEntry>();

function normalizeKey(idea: string): string {
  return idea.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * NOTE: in-memory, single-instance only — the same pattern as job-queue.ts
 * and rateLimiter.ts; swap for Redis before running more than one instance.
 * Matches the spec's Memory System rule directly: "Never ask the same AI
 * question twice if the answer already exists." Two founders describing
 * the same idea within the TTL window reuse one round of evidence
 * collection instead of paying for it twice.
 */
export const knowledgeCache = {
  get(idea: string): KnowledgeBase | null {
    const entry = store.get(normalizeKey(idea));
    if (!entry || entry.expiresAt < Date.now()) return null;
    return entry.value;
  },
  set(idea: string, value: KnowledgeBase): void {
    store.set(normalizeKey(idea), { value, expiresAt: Date.now() + TTL_MS });
  },
};
