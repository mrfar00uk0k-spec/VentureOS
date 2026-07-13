export interface NormalizedPricing {
  amountUsd: number | null;
  period: "month" | "year" | null;
}

export interface NormalizedTrial {
  days: number | null;
}

/**
 * Converts free text like "$29/month" or "$490/yr" into a structured
 * amount + period. Intentionally conservative: an unrecognized format
 * returns nulls rather than a guessed value — a normalizer that's wrong
 * silently is worse than one that admits it didn't understand something.
 *
 * Meant to run on short, already-extracted strings (e.g. the `pricingModel`
 * field an agent read off a pricing page) rather than on raw search
 * snippets, which are too unpredictable for a regex to parse reliably.
 */
export function normalizePricing(text: string): NormalizedPricing {
  const match = text.match(/\$\s?(\d+(?:\.\d{1,2})?)\s*(?:\/|per\s+)?\s*(month|mo|year|yr)?/i);
  if (!match) return { amountUsd: null, period: null };

  const amount = parseFloat(match[1]);
  const periodRaw = match[2]?.toLowerCase();
  const period: NormalizedPricing["period"] =
    periodRaw === "year" || periodRaw === "yr" ? "year" : periodRaw ? "month" : null;

  return { amountUsd: Number.isFinite(amount) ? amount : null, period };
}

/** Converts phrases like "14-day free trial" into { days: 14 }. */
export function normalizeTrial(text: string): NormalizedTrial {
  const match = text.match(/(\d+)[\s-]*day/i);
  if (match) return { days: parseInt(match[1], 10) };
  return { days: null };
}
