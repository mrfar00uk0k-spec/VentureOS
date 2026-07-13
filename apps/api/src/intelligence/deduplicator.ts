import type { EvidenceItem } from "./types";

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/$/, "");
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Different search tasks often surface the same page (e.g. "X competitors"
 * and "X alternatives" both returning the same comparison article). This
 * keeps one copy per category+URL so it isn't double-counted as two
 * independent sources during evidence scoring.
 */
export function deduplicateByUrl(items: EvidenceItem[]): EvidenceItem[] {
  const seen = new Set<string>();
  const result: EvidenceItem[] = [];

  for (const item of items) {
    const key = `${item.category}:${normalizeUrl(item.url)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}
