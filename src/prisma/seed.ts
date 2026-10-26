import { hashPassword } from "../app/server/auth/password.ts";
import { connectDatabase, db } from "./db.ts";

export const DEMO_PASSWORD = "password123";

const users = [
  { email: "alice@prisma.io", username: "alice", name: "Alice", role: "admin" },
  { email: "bob@prisma.io", username: "bob", name: "Bob", role: "agent" },
  { email: "carol@prisma.io", username: "carol", name: "Carol", role: "customer" },
] as const;

let pendingSeed: Promise<void> | undefined;

/**
 * Demo credentials are useful locally, but a known password must never be
 * seeded into a deployed database.
 */
function shouldSeedDemoPassword(): boolean {
  if (process.env.NODE_ENV === "development") return true;

  const origin = (process.env.COMPOSER_APP_ORIGIN ?? process.env.APP_URL ?? "")
    .replace(/^"|"$/g, "");

  return origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
}

async function runSeed(): Promise<void> {
  await connectDatabase();

  const passwordHash = shouldSeedDemoPassword()
    ? await hashPassword(DEMO_PASSWORD)
    : undefined;

  for (const user of users) {
    await db.orm.public.User.upsert({
      create: { ...user, ...(passwordHash ? { passwordHash } : {}) },
      update: {},
      conflictOn: { email: user.email },
    });

    if (!passwordHash) continue;

    // Give pre-auth rows a demo password without overwriting a password the
    // user has since changed.
    await db.orm.public.User
      .where({ email: user.email })
      .where((existing) => existing.passwordHash.isNull())
      .updateAll({ passwordHash });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
