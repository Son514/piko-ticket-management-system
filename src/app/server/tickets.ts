import "server-only";

import { connectDatabase, db } from "@/prisma/db";
import { isStaff } from "@/lib/roles";
import { requireUser } from "./auth/session";

export type TicketSummary = {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  author: {
    id: number;
    name: string | null;
    email: string;
  };
};

export async function listTickets(): Promise<TicketSummary[]> {
  const { user } = await requireUser();

  await connectDatabase();

  if (!isStaff(user.role)) {
    const posts = await db.orm.public.Post
      .select("id", "title", "content", "createdAt")
      .where({ authorId: user.id })
      .orderBy((post) => post.createdAt.desc())
      .all();

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }));
  }

  const posts = await db.orm.public.Post
    .select("id", "title", "content", "createdAt")
    .include("author", (author) => author.select("id", "name", "email"))
    .orderBy((post) => post.createdAt.desc())
    .limit(100)
    .all();

  return posts.map((post) => {
    if (!post.author) {
      throw new Error(`Ticket ${post.id} has no author`);
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
    };
  });
}
