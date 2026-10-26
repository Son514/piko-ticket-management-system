import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/app/server/auth/constants";

describe("safeNextPath", () => {
  it("allows internal absolute paths", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/admin/users?tab=roles#top")).toBe(
      "/admin/users?tab=roles#top",
    );
  });

  it("rejects external URLs", () => {
    expect(safeNextPath("https://evil.example")).toBeUndefined();
    expect(safeNextPath("http://evil.example")).toBeUndefined();
  });

  it("rejects scheme-relative and backslash redirects", () => {
    expect(safeNextPath("//evil.example")).toBeUndefined();
    expect(safeNextPath("/\\evil.example")).toBeUndefined();
  });

  it("rejects non-string values", () => {
    expect(safeNextPath(undefined)).toBeUndefined();
    expect(safeNextPath(null)).toBeUndefined();
    expect(safeNextPath(42)).toBeUndefined();
  });

  it("rejects control characters", () => {
    expect(safeNextPath("/dash\u0000board")).toBeUndefined();
    expect(safeNextPath("/dash\nboard")).toBeUndefined();
  });
});
