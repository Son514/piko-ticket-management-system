"use server";

import { revalidatePath } from "next/cache";

import {
  canAssignTicket,
  canCloseTicket,
  canReopenTicket,
  canSelfAssignTicket,
} from "@/lib/ticket-permissions";
import {
  assignTicketSchema,
  ticketActionSchema,
  updateTicketSchema,
} from "@/lib/validation/ticket-update";
import { connectDatabase, db } from "@/prisma/db";
import { requireRole, requireUser } from "./auth/session";
import type { AuthState } from "./auth/types";

function revalidateTicket(ticketId: number): void {
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
}

export async function updateTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await requireRole("agent", "admin");

  const parsed = updateTicketSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return { error: "Invalid ticket update request." };
  }

  const { ticketId, status, priority } = parsed.data;

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select("id")
    .where({ id: ticketId })
    .first();

  if (!ticket) return { error: "Ticket not found." };

  await db.orm.public.Post.where({ id: ticketId }).updateAll({
    status,
    priority,
  });

  revalidateTicket(ticketId);

  return { success: "Ticket updated." };
}

export async function assignTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireRole("admin");

  if (!canAssignTicket(user.role)) {
    return { error: "Only admins can assign tickets." };
  }

  const parsed = assignTicketSchema.safeParse({
    ticketId: formData.get("ticketId"),
    assigneeId: formData.get("assigneeId"),
  });

  if (!parsed.success) {
    return { error: "Invalid assignment request." };
  }

  const { ticketId, assigneeId } = parsed.data;

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select("id")
    .where({ id: ticketId })
    .first();

  if (!ticket) return { error: "Ticket not found." };

  if (assigneeId !== null) {
    const assignee = await db.orm.public.User
      .select("id", "role", "isActive")
      .where({ id: assigneeId })
      .first();

    if (!assignee || !assignee.isActive || assignee.role !== "agent") {
      return { error: "Choose an active agent." };
    }
  }

  await db.orm.public.Post.where({ id: ticketId }).updateAll({
    assigneeId,
  });

  revalidateTicket(ticketId);

  return {
    success: assigneeId === null ? "Ticket unassigned." : "Ticket assigned.",
  };
}

export async function selfAssignTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireRole("agent");

  const parsed = ticketActionSchema.safeParse({
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return { error: "Invalid ticket request." };
  }

  const { ticketId } = parsed.data;

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select("id", "authorId", "status", "assigneeId")
    .where({ id: ticketId })
    .first();

  if (!ticket) return { error: "Ticket not found." };

  if (!canSelfAssignTicket(ticket, user)) {
    return { error: "Only unassigned tickets can be self-assigned." };
  }

  if (ticket.assigneeId === user.id) {
    return { success: "Ticket is already assigned to you." };
  }

  await db.orm.public.Post.where({ id: ticketId }).updateAll({
    assigneeId: user.id,
  });

  revalidateTicket(ticketId);

  return { success: "Ticket assigned to you." };
}

export async function closeTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const parsed = ticketActionSchema.safeParse({
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return { error: "Invalid ticket request." };
  }

  const { ticketId } = parsed.data;

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select("id", "authorId", "status", "assigneeId")
    .where({ id: ticketId })
    .first();

  if (!ticket) return { error: "Ticket not found." };

  if (ticket.status === "closed") {
    return { success: "Ticket is already closed." };
  }

  if (!canCloseTicket(ticket, user)) {
    return { error: "You can only close your own tickets." };
  }

  await db.orm.public.Post.where({ id: ticketId }).updateAll({
    status: "closed",
  });

  revalidateTicket(ticketId);

  return { success: "Ticket closed." };
}

export async function reopenTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const parsed = ticketActionSchema.safeParse({
    ticketId: formData.get("ticketId"),
  });

  if (!parsed.success) {
    return { error: "Invalid ticket request." };
  }

  const { ticketId } = parsed.data;

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select("id", "authorId", "status", "assigneeId")
    .where({ id: ticketId })
    .first();

  if (!ticket) return { error: "Ticket not found." };

  if (!canReopenTicket(ticket, user)) {
    return { error: "Only closed or resolved tickets can be reopened." };
  }

  await db.orm.public.Post.where({ id: ticketId }).updateAll({
    status: "open",
  });

  revalidateTicket(ticketId);

  return { success: "Ticket reopened." };
}
