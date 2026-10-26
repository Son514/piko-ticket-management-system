import { afterEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "@/app/server/auth/rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows attempts up to the limit and blocks after it", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const key = `test-limit-${Date.now()}`;

    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);

    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const key = `test-window-${Date.now()}`;

    expect(rateLimit(key, 1, 1_000).ok).toBe(true);
    expect(rateLimit(key, 1, 1_000).ok).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(rateLimit(key, 1, 1_000).ok).toBe(true);
  });

  it("tracks separate keys independently", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const prefix = `test-separate-${Date.now()}`;

    expect(rateLimit(`${prefix}-a`, 1, 1_000).ok).toBe(true);
    expect(rateLimit(`${prefix}-a`, 1, 1_000).ok).toBe(false);
    expect(rateLimit(`${prefix}-b`, 1, 1_000).ok).toBe(true);
  });
});
