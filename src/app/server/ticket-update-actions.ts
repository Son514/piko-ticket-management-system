"use server";

import { revalidatePath } from "next/cache";

import { updateTicketSchema } from "@/lib/validation/ticket-update";
import { connectDatabase, db } from "@/prisma/db";
import { requireRole } from "./auth/session";
import type { AuthState } from "./auth/types";

export async function updateTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await requireRole("agent", "admin");

  const parsed = updateTicketSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
    assigneeId: formData.get("assigneeId"),
  });

  if (!parsed.success) {
    return { error: "Invalid ticket update request." };
  }

  const { ticketId, status, assigneeId } = parsed.data;

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

    if (
      !assignee ||
      !assignee.isActive ||
      (assignee.role !== "agent" && assignee.role !== "admin")
    ) {
      return { error: "Choose an active agent or admin." };
    }
  }

  await db.orm.public.Post.where({ id: ticketId }).updateAll({
    status,
    assigneeId,
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);

  return { success: "Ticket updated." };
}
