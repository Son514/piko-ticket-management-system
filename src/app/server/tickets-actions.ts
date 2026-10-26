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
import {
  buildAttachmentKey,
  deleteAttachmentObject,
  putAttachmentObject,
  readS3Config,
} from "./storage";

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
        bytes: new Uint8Array(await file.arrayBuffer()),
      }
    : null;

  const s3 = readS3Config();
  let storageKey: string | null = null;

  if (attachment && s3) {
    storageKey = buildAttachmentKey(attachment.filename);
    try {
      await putAttachmentObject(
        s3,
        storageKey,
        attachment.bytes,
        attachment.contentType,
      );
    } catch (error) {
      console.error("[tickets] attachment upload failed", error);
      return {
        error: "We could not upload your attachment. Please try again.",
      };
    }
  } else if (attachment) {
    console.warn(
      "[storage] S3 is not configured; storing the attachment in Postgres.",
    );
  }

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
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size,
          ...(storageKey
            ? { storageKey }
            : { data: attachment.bytes }),
        });
      }
    });
  } catch (error) {
    console.error("[tickets] create failed", error);

    if (storageKey && s3) {
      await deleteAttachmentObject(s3, storageKey);
    }

    return { error: "We could not create your ticket. Please try again." };
  }

  revalidatePath("/tickets");
  redirect("/tickets");
}
