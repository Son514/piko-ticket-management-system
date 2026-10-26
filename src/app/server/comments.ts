import "server-only";

import { canViewInternalComments } from "@/lib/comment-permissions";
import type { CommentVisibility } from "@/lib/comments";
import type { Role } from "@/lib/roles";
import { isStaff } from "@/lib/roles";
import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";

export type CommentSummary = {
  id: number;
  body: string;
  visibility: CommentVisibility;
  editedAt: string | null;
  createdAt: string;
  author: {
    id: number;
    name: string | null;
    email: string;
    role: Role;
  };
};

type CommentRow = {
  id: number;
  body: string;
  visibility: CommentVisibility;
  editedAt: string | null;
  createdAt: string;
  author: {
    id: number;
    name: string | null;
    email: string;
    role: Role;
  } | null;
};

export async function listComments(ticketId: number): Promise<CommentSummary[]> {
  const { user } = await requireUser();

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select("id", "authorId")
    .where({ id: ticketId })
    .first();

  if (!ticket) return [];
  if (!isStaff(user.role) && ticket.authorId !== user.id) return [];

  let filtered = db.orm.public.Comment
    .where({ ticketId })
    .where((comment) => comment.id.gt(0));

  if (!canViewInternalComments(user.role)) {
    filtered = filtered.where({ visibility: "public" });
  }

  const rows = await filtered
    .select("id", "body", "visibility", "editedAt", "createdAt")
    .include("author", (author) =>
      author.select("id", "name", "email", "role"),
    )
    .orderBy((comment) => comment.createdAt.asc())
    .all();

  return rows.map((comment: CommentRow) => {
    if (!comment.author) {
      throw new Error(`Comment ${comment.id} has no author`);
    }

    return {
      id: comment.id,
      body: comment.body,
      visibility: comment.visibility,
      editedAt: comment.editedAt,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
        role: comment.author.role,
      },
    };
  });
}
