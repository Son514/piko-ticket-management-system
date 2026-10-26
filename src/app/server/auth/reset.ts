import "server-only";

import { connectDatabase, db } from "@/prisma/db";
import { hashToken } from "./tokens";

export type ValidPasswordResetToken = {
  id: number;
  userId: number;
  expiresAt: string;
};

/**
 * Look up a reset token without consuming it. The reset page uses this to
 * decide whether to render the form; the action re-checks it before use.
 */
export async function findValidPasswordResetToken(
  token: string | undefined,
): Promise<ValidPasswordResetToken | null> {
  if (!token) return null;

  await connectDatabase();

  return db.orm.public.PasswordResetToken
    .select("id", "userId", "expiresAt")
    .where({ tokenHash: hashToken(token) })
    .where((resetToken) => resetToken.usedAt.isNull())
    .where((resetToken) => resetToken.expiresAt.gt(new Date().toISOString()))
    .first();
}
