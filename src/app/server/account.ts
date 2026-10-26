import "server-only";

import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";

export async function listAccountPosts() {
  const { user } = await requireUser();

  await connectDatabase();

  return db.orm.public.Post
    .select("id", "title", "content", "createdAt", "updatedAt")
    .where({ authorId: user.id })
    .orderBy((post) => post.createdAt.desc())
    .all();
}
