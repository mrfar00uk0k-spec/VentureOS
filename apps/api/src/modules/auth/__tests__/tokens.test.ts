import { describe, it, expect } from "vitest";
import { hashToken, generateRefreshToken, generateOpaqueToken } from "../tokens";

describe("hashToken", () => {
  it("hashes the same input identically", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("hashes different inputs differently", () => {
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});

describe("generateRefreshToken", () => {
  it("produces a hash matching hashToken(token)", () => {
    const { token, hash } = generateRefreshToken();
    expect(hash).toBe(hashToken(token));
  });

  it("never generates the raw token and its hash as the same string", () => {
    const { token, hash } = generateRefreshToken();
    expect(token).not.toBe(hash);
  });
});

describe("generateOpaqueToken", () => {
  it("generates tokens of sufficient length", () => {
    expect(generateOpaqueToken().length).toBeGreaterThanOrEqual(32);
  });

  it("generates a different token every time", () => {
    expect(generateOpaqueToken()).not.toBe(generateOpaqueToken());
  });
});
