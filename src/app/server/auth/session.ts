import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { connectDatabase, db } from "@/prisma/db";
import { getAppConfig } from "../config";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, SESSION_TTL_MS } from "./constants";
import { generateToken, hashToken } from "./tokens";

export type SessionUser = {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CurrentSession = {
  session: {
    id: number;
    userId: number;
    expiresAt: string;
  };
  user: SessionUser;
};

/**
 * `next dev` and `prisma dev` both serve the app over plain HTTP, while the
 * Composer build runs with NODE_ENV=production. Derive the flag from the
 * request instead of NODE_ENV so local sessions still work.
 */
async function shouldUseSecureCookie(): Promise<boolean> {
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProto) return forwardedProto === "https";

  const appUrl = getAppConfig().appUrl?.trim();
  if (appUrl) return appUrl.startsWith("https://");

  return false;
}

async function getSessionCookieOptions() {
  return {
    ...SESSION_COOKIE_OPTIONS,
    secure: await shouldUseSecureCookie(),
  };
}

export async function createSession(userId: number): Promise<void> {
  await connectDatabase();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await db.orm.public.Session.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, await getSessionCookieOptions());
}

export const getSession = cache(async (): Promise<CurrentSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await connectDatabase();

  const session = await db.orm.public.Session
    .select("id", "userId", "expiresAt")
    .where({ tokenHash: hashToken(token) })
    .first();

  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.orm.public.Session.where({ id: session.id }).deleteAll();
    return null;
  }

  const user = await db.orm.public.User
    .select("id", "email", "username", "name", "createdAt", "updatedAt")
    .where({ id: session.userId })
    .first();

  if (!user) {
    await db.orm.public.Session.where({ id: session.id }).deleteAll();
    return null;
  }

  return {
    session: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    },
    user,
  };
});

export async function requireUser(): Promise<CurrentSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  cookieStore.set(SESSION_COOKIE, "", {
    ...(await getSessionCookieOptions()),
    maxAge: 0,
  });

  if (!token) return;

  await connectDatabase();
  await db.orm.public.Session.where({ tokenHash: hashToken(token) }).deleteAll();
}

export async function destroyAllSessions(userId: number): Promise<void> {
  await connectDatabase();
  await db.orm.public.Session.where({ userId }).deleteAll();
}
