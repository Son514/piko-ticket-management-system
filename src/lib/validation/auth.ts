import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254, "Email is too long.")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password must be at most 128 characters long.");

const signInPassword = z
  .string()
  .min(1, "Enter your password.")
  .max(128, "Password is too long.");

const name = z
  .string()
  .trim()
  .max(80, "Name must be at most 80 characters long.");

const username = z
  .string()
  .trim()
  .max(32, "Username must be at most 32 characters long.")
  .refine(
    (value) => value === "" || value.length >= 3,
    "Username must be at least 3 characters long.",
  )
  .refine(
    (value) => value === "" || /^[a-zA-Z0-9_]+$/.test(value),
    "Username can only contain letters, numbers, and underscores.",
  );

export const signInSchema = z.object({
  email,
  password: signInPassword,
});

export const signUpSchema = z
  .object({
    name,
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is invalid or has expired."),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const accountSchema = z.object({
  name,
  username,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type AccountValues = z.infer<typeof accountSchema>;

export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? String(issue.path[0]) : "form";
    fieldErrors[field] ??= [];
    fieldErrors[field].push(issue.message);
  }

  return fieldErrors;
}

export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
