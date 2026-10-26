import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  accountSchema,
  forgotPasswordSchema,
  formString,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
} from "@/lib/validation/auth";

describe("signInSchema", () => {
  it("normalizes email and accepts a password", () => {
    const result = signInSchema.safeParse({
      email: "  FLOW@Example.COM ",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("flow@example.com");
  });

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["email"]);
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({
      email: "flow@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["password"]);
  });
});

describe("signUpSchema", () => {
  it("accepts valid input and trims the name", () => {
    const result = signUpSchema.safeParse({
      name: "  Jane Doe  ",
      email: "JANE@Example.COM",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Jane Doe");
    expect(result.data?.email).toBe("jane@example.com");
  });

  it("requires at least 8 password characters", () => {
    const result = signUpSchema.safeParse({
      name: "",
      email: "jane@example.com",
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === "password")).toBe(
      true,
    );
  });

  it("rejects password confirmation mismatches on the confirm field", () => {
    const result = signUpSchema.safeParse({
      name: "",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password124",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
    expect(result.error?.issues[0]?.message).toBe("Passwords do not match.");
  });
});

describe("forgotPasswordSchema", () => {
  it("normalizes the email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: " User@Example.COM ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("user@example.com");
  });
});

describe("resetPasswordSchema", () => {
  it("requires a token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["token"]);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "reset-token",
      password: "password123",
      confirmPassword: "password124",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("accountSchema", () => {
  it("allows empty optional fields", () => {
    const result = accountSchema.safeParse({ name: "", username: "" });

    expect(result.success).toBe(true);
  });

  it("rejects a short username", () => {
    const result = accountSchema.safeParse({ name: "", username: "ab" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Username must be at least 3 characters long.",
    );
  });

  it("rejects invalid username characters", () => {
    const result = accountSchema.safeParse({ name: "", username: "bad name" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Username can only contain letters, numbers, and underscores.",
    );
  });
});

describe("toFieldErrors", () => {
  it("groups issues by field", () => {
    const result = signUpSchema.safeParse({
      name: "",
      email: "bad",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);

    const fieldErrors = toFieldErrors(result.error!);
    expect(fieldErrors.email).toBeTruthy();
    expect(fieldErrors.password).toBeTruthy();
    expect(fieldErrors.confirmPassword).toEqual(["Passwords do not match."]);
  });

  it("uses the form key for root issues", () => {
    const schema = z
      .object({ email: z.string() })
      .refine(() => false, "Root problem");
    const result = schema.safeParse({ email: "a@b.com" });

    expect(result.success).toBe(false);
    expect(toFieldErrors(result.error!).form).toEqual(["Root problem"]);
  });
});

describe("formString", () => {
  it("returns string form values", () => {
    const formData = new FormData();
    formData.set("email", "a@b.com");

    expect(formString(formData, "email")).toBe("a@b.com");
  });

  it("returns an empty string for missing values", () => {
    expect(formString(new FormData(), "email")).toBe("");
  });

  it("returns an empty string for non-string values", () => {
    const formData = new FormData();
    formData.set("file", new File(["x"], "x.txt"));

    expect(formString(formData, "file")).toBe("");
  });
});
