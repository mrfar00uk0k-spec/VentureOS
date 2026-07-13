import { describe, it, expect } from "vitest";
import { normalizePricing, normalizeTrial } from "../normalizer";

describe("normalizePricing", () => {
  it("parses a monthly price", () => {
    expect(normalizePricing("$29/month")).toEqual({ amountUsd: 29, period: "month" });
  });

  it("parses a yearly price", () => {
    expect(normalizePricing("$490/yr")).toEqual({ amountUsd: 490, period: "year" });
  });

  it("returns nulls for unrecognized text", () => {
    expect(normalizePricing("Contact us for pricing")).toEqual({ amountUsd: null, period: null });
  });
});

describe("normalizeTrial", () => {
  it("parses a day count", () => {
    expect(normalizeTrial("14-day free trial")).toEqual({ days: 14 });
  });

  it("returns null when no day count is present", () => {
    expect(normalizeTrial("free trial available")).toEqual({ days: null });
  });
});
