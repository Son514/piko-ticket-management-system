import { describe, expect, it } from "vitest";

import {
  isAdmin,
  isStaff,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLES,
} from "@/lib/roles";

describe("roles", () => {
  it("lists the supported roles", () => {
    expect(ROLES).toEqual(["customer", "agent", "admin"]);
  });

  it("has a label and description for every role", () => {
    for (const role of ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(ROLE_DESCRIPTIONS[role]).toBeTruthy();
    }
  });

  it("identifies staff roles", () => {
    expect(isStaff("customer")).toBe(false);
    expect(isStaff("agent")).toBe(true);
    expect(isStaff("admin")).toBe(true);
  });

  it("identifies admins", () => {
    expect(isAdmin("customer")).toBe(false);
    expect(isAdmin("agent")).toBe(false);
    expect(isAdmin("admin")).toBe(true);
  });
});
