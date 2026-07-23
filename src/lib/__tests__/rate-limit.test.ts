import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  RATE_LIMITS,
  type RateLimitConfig,
} from "../rate-limit";

const baseConfig: RateLimitConfig = { maxRequests: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("192.168.1.1", baseConfig);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over the limit", () => {
    checkRateLimit("10.0.0.1", baseConfig);
    checkRateLimit("10.0.0.1", baseConfig);
    checkRateLimit("10.0.0.1", baseConfig); // hits max
    const blocked = checkRateLimit("10.0.0.1", baseConfig);
    expect(blocked.allowed).toBe(false);
  });

  it("returns correct remaining count", () => {
    const first = checkRateLimit("172.16.0.1", baseConfig);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit("172.16.0.1", baseConfig);
    expect(second.remaining).toBe(1);

    const third = checkRateLimit("172.16.0.1", baseConfig);
    expect(third.remaining).toBe(0);
  });

  it("returns retryAfter > 0 when blocked", () => {
    for (let i = 0; i < baseConfig.maxRequests; i++) {
      checkRateLimit("10.0.0.99", baseConfig);
    }
    const blocked = checkRateLimit("10.0.0.99", baseConfig);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("different IPs have separate rate limit buckets", () => {
    // Exhaust IP-A
    for (let i = 0; i < baseConfig.maxRequests; i++) {
      checkRateLimit("IP-A", baseConfig);
    }
    const blockedA = checkRateLimit("IP-A", baseConfig);
    expect(blockedA.allowed).toBe(false);

    // IP-B should still be allowed
    const allowedB = checkRateLimit("IP-B", baseConfig);
    expect(allowedB.allowed).toBe(true);
  });

  it("different endpoints (keyPrefix) have separate rate limit buckets", () => {
    const endpointA: RateLimitConfig = { maxRequests: 2, windowMs: 60_000, keyPrefix: "ep-a" };
    const endpointB: RateLimitConfig = { maxRequests: 2, windowMs: 60_000, keyPrefix: "ep-b" };

    // Exhaust endpoint A
    checkRateLimit("10.0.0.50", endpointA);
    checkRateLimit("10.0.0.50", endpointA);
    const blockedA = checkRateLimit("10.0.0.50", endpointA);
    expect(blockedA.allowed).toBe(false);

    // Same IP on endpoint B should still be allowed
    const allowedB = checkRateLimit("10.0.0.50", endpointB);
    expect(allowedB.allowed).toBe(true);
  });
});

describe("RATE_LIMITS", () => {
  it("has expected login config", () => {
    expect(RATE_LIMITS.login.maxRequests).toBe(5);
    expect(RATE_LIMITS.login.windowMs).toBe(60_000);
    expect(RATE_LIMITS.login.keyPrefix).toBe("login");
  });

  it("has expected signup config", () => {
    expect(RATE_LIMITS.signup.maxRequests).toBe(3);
    expect(RATE_LIMITS.signup.windowMs).toBe(300_000);
    expect(RATE_LIMITS.signup.keyPrefix).toBe("signup");
  });

  it("has expected forgotPassword config", () => {
    expect(RATE_LIMITS.forgotPassword.maxRequests).toBe(3);
    expect(RATE_LIMITS.forgotPassword.windowMs).toBe(300_000);
    expect(RATE_LIMITS.forgotPassword.keyPrefix).toBe("forgot-pw");
  });

  it("has expected setup config", () => {
    expect(RATE_LIMITS.setup.maxRequests).toBe(5);
    expect(RATE_LIMITS.setup.windowMs).toBe(600_000);
    expect(RATE_LIMITS.setup.keyPrefix).toBe("setup");
  });

  it("has expected api config", () => {
    expect(RATE_LIMITS.api.maxRequests).toBe(60);
    expect(RATE_LIMITS.api.windowMs).toBe(60_000);
    expect(RATE_LIMITS.api.keyPrefix).toBe("api");
  });
});

describe("rate limit window reset", () => {
  it("allows requests again after the window expires", () => {
    const now = Date.now();
    vi.useFakeTimers({ now });

    const cfg: RateLimitConfig = { maxRequests: 2, windowMs: 10_000 };

    // Exhaust the limit
    checkRateLimit("reset-test", cfg);
    checkRateLimit("reset-test", cfg);
    const blocked = checkRateLimit("reset-test", cfg);
    expect(blocked.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(10_001);

    const after = checkRateLimit("reset-test", cfg);
    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(1);
  });

  it("still blocks if window has not yet elapsed", () => {
    const now = Date.now();
    vi.useFakeTimers({ now });

    const cfg: RateLimitConfig = { maxRequests: 1, windowMs: 5_000 };

    checkRateLimit("no-reset", cfg);

    vi.advanceTimersByTime(4_000);

    const stillBlocked = checkRateLimit("no-reset", cfg);
    expect(stillBlocked.allowed).toBe(false);
  });
});
