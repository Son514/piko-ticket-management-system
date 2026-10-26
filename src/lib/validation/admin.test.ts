import { describe, expect, it } from "vitest";

import {
  setUserActiveSchema,
  updateUserRoleSchema,
} from "@/lib/validation/admin";

describe("updateUserRoleSchema", () => {
  it("coerces a form userId and accepts each role", () => {
    for (const role of ["customer", "agent", "admin"] as const) {
      const result = updateUserRoleSchema.safeParse({
        userId: "42",
        role,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ userId: 42, role });
    }
  });

  it("rejects an invalid role", () => {
    const result = updateUserRoleSchema.safeParse({
      userId: "42",
      role: "owner",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a non-positive userId", () => {
    const result = updateUserRoleSchema.safeParse({
      userId: "0",
      role: "customer",
    });

    expect(result.success).toBe(false);
  });
});

describe("setUserActiveSchema", () => {
  it("transforms true and false strings", () => {
    expect(
      setUserActiveSchema.parse({ userId: "1", active: "true" }),
    ).toEqual({ userId: 1, active: true });
    expect(
      setUserActiveSchema.parse({ userId: "1", active: "false" }),
    ).toEqual({ userId: 1, active: false });
  });

  it("rejects other active values", () => {
    const result = setUserActiveSchema.safeParse({
      userId: "1",
      active: "yes",
    });

    expect(result.success).toBe(false);
  });
});
