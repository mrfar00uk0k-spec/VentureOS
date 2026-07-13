import { describe, it, expect } from "vitest";
import { classifySourceTier, scoreEvidence } from "../evidence-scoring";
import type { RawEvidence } from "../types";

describe("classifySourceTier", () => {
  it("classifies review platforms", () => {
    expect(classifySourceTier("https://www.g2.com/products/acme")).toBe("review_platform");
  });

  it("classifies community sites", () => {
    expect(classifySourceTier("https://www.reddit.com/r/startups/comments/xyz")).toBe("community");
  });

  it("classifies low-quality blog platforms", () => {
    expect(classifySourceTier("https://someone.medium.com/my-review")).toBe("low_quality");
  });

  it("defaults unknown domains to general", () => {
    expect(classifySourceTier("https://acme.com/pricing")).toBe("general");
  });

  it("falls back to general for an unparsable URL", () => {
    expect(classifySourceTier("not-a-url")).toBe("general");
  });
});

describe("scoreEvidence", () => {
  it("boosts the score when multiple independent domains agree", () => {
    const twoSources: RawEvidence[] = [
      { category: "competitor", groupKey: "Acme CRM", title: "a", snippet: "a", url: "https://site-one.com/acme" },
      { category: "competitor", groupKey: "Acme CRM", title: "b", snippet: "b", url: "https://site-two.com/acme" },
    ];
    const oneSource: RawEvidence[] = [twoSources[0]];

    const scoredTwo = scoreEvidence(twoSources);
    const scoredOne = scoreEvidence(oneSource);

    expect(scoredTwo[0].score).toBeGreaterThan(scoredOne[0].score);
  });

  it("keeps every score within 5-100", () => {
    const items: RawEvidence[] = [
      { category: "review", groupKey: "x", title: "t", snippet: "s", url: "https://random-blog.example" },
    ];
    const [scored] = scoreEvidence(items);
    expect(scored.score).toBeGreaterThanOrEqual(5);
    expect(scored.score).toBeLessThanOrEqual(100);
  });
});
