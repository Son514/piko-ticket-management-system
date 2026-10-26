"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { connectDatabase, db } from "@/prisma/db";
import { seed } from "@/prisma/seed";
import { getAppConfig } from "../config";
import { sendPasswordResetEmail } from "../email";
import { RESET_TOKEN_TTL_MS, safeNextPath } from "./constants";
import { getDummyPasswordHash, hashPassword, verifyPassword } from "./password";
import { rateLimit } from "./rate-limit";
import { findValidPasswordResetToken } from "./reset";
import { createSession, destroySession } from "./session";
import { generateToken, hashToken } from "./tokens";
import type { AuthState } from "./types";
import {
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
} from "./validation";

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
  const email = normalizeEmail(formData.get("email"));
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const next = safeNextPath(formData.get("next")) ?? "/dashboard";

  const fieldErrors: Record<string, string[]> = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = [emailError];

  const nameError = validateName(name);
  if (nameError) fieldErrors.name = [nameError];

  const usernameError = validateUsername(username);
  if (usernameError) fieldErrors.username = [usernameError];

  const passwordError = validatePassword(password);
  if (passwordError) fieldErrors.password = [passwordError];

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email, name, username } };
  }

  const limit = rateLimit(`signup:${await getClientIp()}`, 10, FIFTEEN_MINUTES);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);

  await connectDatabase();

  const existing = await db.orm.public.User.select("id").where({ email }).first();
  if (existing) {
    return {
      error: "An account with this email already exists.",
      values: { email, name, username },
    };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await db.orm.public.User.select("id").create({
      email,
      name: name || null,
      username: username || null,
      passwordHash,
    });

    await createSession(user.id);
  } catch (error) {
    console.error("[auth] sign-up failed", error);
    return {
      error: "We could not create your account. Please try again.",
      values: { email, name, username },
    };
  }

  redirect(next);
}

export async function signInAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next")) ?? "/dashboard";

  const fieldErrors: Record<string, string[]> = {};
  if (!email) fieldErrors.email = ["Enter your email address."];
  if (!password) fieldErrors.password = ["Enter your password."];

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { email } };
  }

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
    .select("id", "email", "passwordHash")
    .where({ email })
    .first();

  if (!user || !user.passwordHash) {
    // Keep the response time comparable whether or not the account exists.
    await verifyPassword(password, await getDummyPasswordHash());
    return { error: "Invalid email or password.", values: { email } };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password.", values: { email } };
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
  const email = normalizeEmail(formData.get("email"));
  const emailError = validateEmail(email);

  if (emailError) {
    return { fieldErrors: { email: [emailError] }, values: { email } };
  }

  const limit = rateLimit(
    `reset-request:${email}:${await getClientIp()}`,
    5,
    FIFTEEN_MINUTES,
  );
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);

  const success: AuthState = {
    success: "If an account exists for that email, we sent a password reset link.",
    values: { email },
  };

  try {
    await connectDatabase();

    const user = await db.orm.public.User
      .select("id", "email", "name")
      .where({ email })
      .first();

    if (!user) return success;

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
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string[]> = {};
  const passwordError = validatePassword(password);
  if (passwordError) fieldErrors.password = [passwordError];

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  if (!token) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

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
