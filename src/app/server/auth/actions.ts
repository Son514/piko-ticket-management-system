"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { connectDatabase, db } from "@/prisma/db";
import { seed } from "@/prisma/seed";
import {
  formString,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
} from "@/lib/validation/auth";
import { getAppConfig } from "../config";
import { sendPasswordResetEmail } from "../email";
import { RESET_TOKEN_TTL_MS, safeNextPath } from "./constants";
import { getDummyPasswordHash, hashPassword, verifyPassword } from "./password";
import { rateLimit } from "./rate-limit";
import { findValidPasswordResetToken } from "./reset";
import { createSession, destroySession } from "./session";
import { generateToken, hashToken } from "./tokens";
import type { AuthState } from "./types";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

async function getBaseUrl(): Promise<string> {
  const configured = getAppConfig().appUrl?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function tooManyAttempts(retryAfterSeconds: number): AuthState {
  return {
    error: `Too many attempts. Try again in ${retryAfterSeconds} second${
      retryAfterSeconds === 1 ? "" : "s"
    }.`,
  };
}

export async function signUpAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  };
  const next = safeNextPath(formData.get("next")) ?? "/dashboard";
  const values = {
    email: raw.email.trim().toLowerCase(),
    name: raw.name.trim(),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { email, name, password } = parsed.data;

  const limit = rateLimit(`signup:${await getClientIp()}`, 10, FIFTEEN_MINUTES);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);

  await connectDatabase();

  const existing = await db.orm.public.User.select("id").where({ email }).first();
  if (existing) {
    return {
      fieldErrors: { email: ["An account with this email already exists."] },
      values,
    };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await db.orm.public.User.select("id").create({
      email,
      name: name || null,
      username: null,
      passwordHash,
      role: "customer",
      isActive: true,
    });

    await createSession(user.id);
  } catch (error) {
    console.error("[auth] sign-up failed", error);
    return {
      error: "We could not create your account. Please try again.",
      values,
    };
  }

  redirect(next);
}

export async function signInAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const rawEmail = formString(formData, "email");
  const rawPassword = formString(formData, "password");
  const next = safeNextPath(formData.get("next")) ?? "/dashboard";
  const values = { email: rawEmail.trim().toLowerCase() };

  const parsed = signInSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { email, password } = parsed.data;

  const limit = rateLimit(
    `signin:${email}:${await getClientIp()}`,
    10,
    FIFTEEN_MINUTES,
  );
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);

  try {
    await seed();
  } catch (error) {
    // Demo seeding should never be able to block a real sign-in.
    console.error("[auth] seed failed", error);
  }

  const user = await db.orm.public.User
    .select("id", "email", "passwordHash", "isActive")
    .where({ email })
    .first();

  if (!user || !user.passwordHash) {
    // Keep the response time comparable whether or not the account exists.
    await verifyPassword(password, await getDummyPasswordHash());
    return { error: "Invalid email or password.", values };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password.", values };
  }

  if (!user.isActive) {
    return {
      error: "This account has been deactivated. Contact an administrator.",
      values,
    };
  }

  await createSession(user.id);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const rawEmail = formString(formData, "email");
  const values = { email: rawEmail.trim().toLowerCase() };

  const parsed = forgotPasswordSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { email } = parsed.data;

  const limit = rateLimit(
    `reset-request:${email}:${await getClientIp()}`,
    5,
    FIFTEEN_MINUTES,
  );
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);

  const success: AuthState = {
    success: "If an account exists for that email, we sent a password reset link.",
    values,
  };

  try {
    await connectDatabase();

    const user = await db.orm.public.User
      .select("id", "email", "name", "isActive")
      .where({ email })
      .first();

    if (!user || !user.isActive) return success;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

    await db.orm.public.PasswordResetToken.where({ userId: user.id }).deleteAll();
    await db.orm.public.PasswordResetToken.create({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt,
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  } catch (error) {
    // Never reveal whether the address exists or whether delivery failed.
    console.error("[auth] password reset request failed", error);
  }

  return success;
}

export async function resetPasswordAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formString(formData, "token"),
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const { token, password } = parsed.data;

  const resetToken = await findValidPasswordResetToken(token);
  if (!resetToken) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  try {
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await db.transaction(async (tx) => {
      await tx.orm.public.User
        .where({ id: resetToken.userId })
        .updateAll({ passwordHash });

      await tx.orm.public.PasswordResetToken
        .where({ id: resetToken.id })
        .updateAll({ usedAt: now });

      // Changing a password revokes every existing session.
      await tx.orm.public.Session.where({ userId: resetToken.userId }).deleteAll();
    });
  } catch (error) {
    console.error("[auth] password reset failed", error);
    return { error: "We could not reset your password. Please try again." };
  }

  redirect("/login?reset=1");
}
