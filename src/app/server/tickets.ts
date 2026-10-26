import "server-only";

import { isStaff } from "@/lib/roles";
import type { TicketCategory, TicketPriority } from "@/lib/tickets";
import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";

export type TicketAttachment = {
  id: number;
  filename: string;
  contentType: string;
  size: number;
};

export type TicketSummary = {
  id: number;
  title: string;
  content: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  createdAt: string;
  attachments: TicketAttachment[];
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
      .select("id", "title", "content", "category", "priority", "createdAt")
      .include("attachments", (attachment) =>
        attachment.select("id", "filename", "contentType", "size"),
      )
      .where({ authorId: user.id })
      .orderBy((post) => post.createdAt.desc())
      .all();

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      priority: post.priority,
      createdAt: post.createdAt,
      attachments: post.attachments,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }));
  }

  const posts = await db.orm.public.Post
    .select("id", "title", "content", "category", "priority", "createdAt")
    .include("author", (author) => author.select("id", "name", "email"))
    .include("attachments", (attachment) =>
      attachment.select("id", "filename", "contentType", "size"),
    )
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
      category: post.category,
      priority: post.priority,
      createdAt: post.createdAt,
      attachments: post.attachments,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
    };
  });
}
