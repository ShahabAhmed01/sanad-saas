/**
 * In-memory sliding window rate limiter
 *
 * Uses a Map keyed by IP + route to track request counts.
 * Sliding window ensures smooth limiting without burst spikes.
 *
 * For production, replace with Upstash Redis for distributed rate limiting.
 * This implementation works for single-instance deployments (Vercel, single Docker).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - 60_000; // 1 minute old entries
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional key prefix to namespace limits (e.g., route name) */
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check rate limit for a given key (typically IP + route)
 * Returns whether the request is allowed and metadata
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;

  let entry = store.get(fullKey);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(fullKey, entry);
  }

  // Remove timestamps outside the window
  const windowStart = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Pre-configured rate limit configs for different endpoints
 */
export const RATE_LIMITS = {
  /** Login: 5 attempts per minute */
  login: { maxRequests: 5, windowMs: 60_000, keyPrefix: "login" },
  /** Signup: 3 attempts per 5 minutes */
  signup: { maxRequests: 3, windowMs: 300_000, keyPrefix: "signup" },
  /** Forgot password: 3 attempts per 5 minutes */
  forgotPassword: { maxRequests: 3, windowMs: 300_000, keyPrefix: "forgot-pw" },
  /** Setup endpoint: 5 attempts per 10 minutes */
  setup: { maxRequests: 5, windowMs: 600_000, keyPrefix: "setup" },
  /** General API: 60 requests per minute */
  api: { maxRequests: 60, windowMs: 60_000, keyPrefix: "api" },
  /** Audit endpoint: 30 requests per minute */
  audit: { maxRequests: 30, windowMs: 60_000, keyPrefix: "audit" },
} as const;
