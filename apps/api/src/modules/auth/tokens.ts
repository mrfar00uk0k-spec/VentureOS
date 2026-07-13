import { randomBytes, createHash } from "crypto";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, requireSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

/**
 * Refresh tokens are opaque random strings, never JWTs — the server is the
 * only place they can be validated, and only a SHA-256 hash of the token is
 * ever persisted, so a database leak alone can't be used to log in as
 * anyone.
 */
export function generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
  const token = randomBytes(40).toString("hex");
  return {
    token,
    hash: hashToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Used for email-verification and password-reset one-time links. */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

function requireSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
}
