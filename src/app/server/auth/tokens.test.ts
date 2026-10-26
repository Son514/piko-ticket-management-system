import { describe, expect, it } from "vitest";

import { generateToken, hashToken } from "@/app/server/auth/tokens";

describe("session tokens", () => {
  it("generates URL-safe 32-byte tokens", () => {
    const token = generateToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("generates distinct tokens", () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it("hashes tokens deterministically as SHA-256 hex", () => {
    const token = "example-token";

    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(hashToken("other-token"));
  });
});
