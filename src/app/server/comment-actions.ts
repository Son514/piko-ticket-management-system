"use server";

import { revalidatePath } from "next/cache";

import {
  canAddPublicReply,
  canCreateInternalNote,
  canDeleteComment,
  canEditComment,
} from "@/lib/comment-permissions";
import {
  addCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from "@/lib/validation/comments";
import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";
import type { AuthState } from "./auth/types";

async function getAccessibleTicket(
  ticketId: number,
  userId: number,
  role: "customer" | "agent" | "admin",
) {
  const ticket = await db.orm.public.Post
    .select("id", "authorId")
    .where({ id: ticketId })
    .first();

  if (!ticket) return null;
  if (role === "customer" && ticket.authorId !== userId) return null;

  return ticket;
}

export async function addCommentAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const parsed = addCommentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    return { error: "Write a valid comment." };
  }

  const { ticketId, body, visibility } = parsed.data;

  if (!canAddPublicReply(user.role)) {
    return { error: "You cannot comment on this ticket." };
  }

  if (visibility === "internal" && !canCreateInternalNote(user.role)) {
    return { error: "Only agents and admins can add internal notes." };
  }

  await connectDatabase();

  const ticket = await getAccessibleTicket(ticketId, user.id, user.role);
  if (!ticket) return { error: "Ticket not found." };

  await db.orm.public.Comment.create({
    ticketId,
    authorId: user.id,
    body,
    visibility,
  });

  revalidatePath(`/tickets/${ticketId}`);

  return {
    success:
      visibility === "internal" ? "Internal note added." : "Reply added.",
  };
}

export async function updateCommentAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const parsed = updateCommentSchema.safeParse({
    commentId: formData.get("commentId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: "Write a valid comment." };
  }

  const { commentId, body } = parsed.data;

  await connectDatabase();

  const comment = await db.orm.public.Comment
    .select("id", "authorId", "ticketId")
    .where({ id: commentId })
    .first();

  if (!comment) return { error: "Comment not found." };

  if (!canEditComment(comment, user)) {
    return { error: "You can only edit your own comments." };
  }

  await db.orm.public.Comment.where({ id: commentId }).updateAll({
    body,
    editedAt: new Date().toISOString(),
  });

  revalidatePath(`/tickets/${comment.ticketId}`);

  return { success: "Comment updated." };
}

export async function deleteCommentAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const parsed = deleteCommentSchema.safeParse({
    commentId: formData.get("commentId"),
  });

  if (!parsed.success) {
    return { error: "Invalid comment request." };
  }

  const { commentId } = parsed.data;

  await connectDatabase();

  const comment = await db.orm.public.Comment
    .select("id", "authorId", "ticketId")
    .where({ id: commentId })
    .first();

  if (!comment) return { error: "Comment not found." };

  if (!canDeleteComment(comment, user)) {
    return { error: "You can only delete your own comments." };
  }

  await db.orm.public.Comment.where({ id: commentId }).deleteAll();

  revalidatePath(`/tickets/${comment.ticketId}`);

  return { success: "Comment deleted." };
}
