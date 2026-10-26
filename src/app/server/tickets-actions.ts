"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  normalizeAttachmentType,
  validateAttachmentFile,
} from "@/lib/tickets";
import { formString, toFieldErrors } from "@/lib/validation/auth";
import { ticketFieldsSchema } from "@/lib/validation/tickets";
import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";
import type { AuthState } from "./auth/types";

export async function createTicketAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const parsed = ticketFieldsSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    category: formString(formData, "category"),
    priority: formString(formData, "priority"),
  });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const { title, description, category, priority } = parsed.data;

  const attachmentEntry = formData.get("attachment");
  const file =
    attachmentEntry instanceof File && attachmentEntry.size > 0
      ? attachmentEntry
      : null;

  if (file) {
    const attachmentError = validateAttachmentFile(file);
    if (attachmentError) {
      return { fieldErrors: { attachment: [attachmentError] } };
    }
  }

  const attachment = file
    ? {
        filename: file.name.replace(/[\r\n/\\]/g, "_").slice(0, 255),
        contentType: normalizeAttachmentType(file.type),
        size: file.size,
        data: new Uint8Array(await file.arrayBuffer()),
      }
    : null;

  try {
    await connectDatabase();

    await db.transaction(async (tx) => {
      const ticket = await tx.orm.public.Post.select("id").create({
        title,
        content: description,
        category,
        priority,
        authorId: user.id,
      });

      if (attachment) {
        await tx.orm.public.Attachment.create({
          ticketId: ticket.id,
          ...attachment,
        });
      }
    });
  } catch (error) {
    console.error("[tickets] create failed", error);
    return { error: "We could not create your ticket. Please try again." };
  }

  revalidatePath("/tickets");
  redirect("/tickets");
}
