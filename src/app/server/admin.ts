import "server-only";

import { connectDatabase, db } from "@/prisma/db";
import { requireAdmin } from "./auth/session";

export async function listAdminUsers() {
  await requireAdmin();

  await connectDatabase();

  return db.orm.public.User
    .select(
      "id",
      "email",
      "username",
      "name",
      "role",
      "isActive",
      "deactivatedAt",
      "createdAt",
    )
    .orderBy((user) => user.createdAt.desc())
    .limit(200)
    .all();
}

export type AdminUser = Awaited<ReturnType<typeof listAdminUsers>>[number];
