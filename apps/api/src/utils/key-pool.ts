import { logger } from "./logger";

type KeyState = "healthy" | "rate_limited" | "invalid";

interface KeyRecord {
  key: string;
  state: KeyState;
  cooldownUntil: number;
  consecutiveFailures: number;
}

export interface KeyPoolStats {
  total: number;
  healthy: number;
  rateLimited: number;
  invalid: number;
}

/**
 * Rotates across up to ~50 API keys for a single service. This is
 * deliberately generic — the same pool powers Groq, Gemini, OpenAI, Tavily,
 * and Brave, so key-rotation logic exists exactly once in the codebase.
 *
 * Honest limitation, worth knowing before relying on this for extra
 * throughput: Groq and Gemini rate-limit at the account/project level, not
 * per key — multiple keys from the *same* account share one quota there.
 * Tavily's free-tier credits, by contrast, are per account, so keys from
 * genuinely separate Tavily accounts do add up. Either way, this pool still
 * earns its keep for *resilience*: if one key is revoked, hits a billing
 * problem, or gets individually throttled, requests keep flowing through
 * the others instead of the whole pipeline failing.
 */
export class KeyPool {
  private keys: KeyRecord[];
  private cursor = -1;
  private readonly serviceName: string;

  constructor(serviceName: string, rawKeys: string[]) {
    this.serviceName = serviceName;
    this.keys = rawKeys.map((key) => ({ key, state: "healthy", cooldownUntil: 0, consecutiveFailures: 0 }));
  }

  get size(): number {
    return this.keys.length;
  }

  get stats(): KeyPoolStats {
    this.recoverExpiredCooldowns();
    return {
      total: this.keys.length,
      healthy: this.keys.filter((k) => k.state === "healthy").length,
      rateLimited: this.keys.filter((k) => k.state === "rate_limited").length,
      invalid: this.keys.filter((k) => k.state === "invalid").length,
    };
  }

  private recoverExpiredCooldowns() {
    const now = Date.now();
    for (const record of this.keys) {
      if (record.state === "rate_limited" && record.cooldownUntil <= now) {
        record.state = "healthy";
        record.consecutiveFailures = 0;
      }
    }
  }

  /** Round-robin over healthy keys; returns null if none are usable right now. */
  next(): string | null {
    if (this.keys.length === 0) return null;
    this.recoverExpiredCooldowns();

    for (let i = 0; i < this.keys.length; i++) {
      this.cursor = (this.cursor + 1) % this.keys.length;
      const candidate = this.keys[this.cursor];
      if (candidate.state === "healthy") return candidate.key;
    }
    return null;
  }

  reportSuccess(key: string) {
    const record = this.keys.find((k) => k.key === key);
    if (record) record.consecutiveFailures = 0;
  }

  reportRateLimited(key: string, cooldownMs = 60_000) {
    const record = this.keys.find((k) => k.key === key);
    if (!record) return;
    record.state = "rate_limited";
    record.cooldownUntil = Date.now() + cooldownMs;
    record.consecutiveFailures += 1;
    logger.warn("API key rate-limited, rotating to next key", { service: this.serviceName, ...this.stats });
  }

  reportInvalid(key: string) {
    const record = this.keys.find((k) => k.key === key);
    if (!record) return;
    record.state = "invalid";
    logger.warn("API key rejected as invalid, excluding from rotation", { service: this.serviceName, ...this.stats });
  }
}

/** Reads a comma-separated list of keys from an env var (up to 50 are supported). */
export function loadKeyPool(serviceName: string, envVar: string): KeyPool {
  const raw = process.env[envVar] ?? "";
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 50);
  return new KeyPool(serviceName, keys);
}

function classify(error: unknown): "invalid" | "rate_limited" | "transient" {
  const message = error instanceof Error ? error.message : String(error);
  if (/\b401\b|\b403\b|invalid.?api.?key|unauthorized|permission.?denied/i.test(message)) return "invalid";
  if (/\b429\b|rate.?limit|quota.?exceeded|resource.?exhausted/i.test(message)) return "rate_limited";
  return "transient";
}

/**
 * Runs `attemptFn` against the pool's keys, rotating to the next healthy
 * key whenever one fails, until either a call succeeds or the pool is
 * exhausted. This is the "when a key fails, go to the next one" behavior,
 * applied generically to any provider.
 */
export async function withKeyRotation<T>(
  pool: KeyPool,
  attemptFn: (key: string) => Promise<T>
): Promise<T> {
  const maxAttempts = Math.max(1, Math.min(pool.size, 10));
  let lastError: unknown = new Error(`No API keys configured for this service.`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = pool.next();
    if (!key) break;

    try {
      const result = await attemptFn(key);
      pool.reportSuccess(key);
      return result;
    } catch (error) {
      lastError = error;
      const kind = classify(error);
      if (kind === "invalid") pool.reportInvalid(key);
      else if (kind === "rate_limited") pool.reportRateLimited(key);
      // "transient" errors don't penalize the key, but we still rotate on
      // the next loop iteration in case the failure was key-specific.
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
