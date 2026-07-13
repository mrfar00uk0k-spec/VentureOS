import { NextFunction, Request, Response } from "express";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

/**
 * NOTE: this in-memory limiter only works correctly for a single instance.
 * Before deploying with more than one API instance, replace it with a
 * Redis-backed limiter (e.g. rate-limit-redis) — every consumer of these
 * middlewares stays the same, only the storage changes.
 */
function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function limiter(req: Request, res: Response, next: NextFunction) {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({ error: { message: "Too many requests, please slow down." } });
    }

    entry.count += 1;
    next();
  };
}

// General API traffic.
export const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 100 });

// Credential-guessing surfaces (login, register, password reset) get a much
// tighter budget — the spec explicitly calls for different limits per
// surface, and this is the one where it matters most.
export const authRateLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10 });
