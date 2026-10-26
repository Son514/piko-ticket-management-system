import { z } from "zod";

import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  validateAttachmentFile,
} from "@/lib/tickets";

export const ticketFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long.")
    .max(120, "Title must be at most 120 characters long."),
  description: z
    .string()
    .trim()
    .min(10, "Describe the issue in at least 10 characters.")
    .max(5000, "Description must be at most 5000 characters long."),
  category: z.enum(TICKET_CATEGORIES, {
    error: "Choose a valid category.",
  }),
  priority: z.enum(TICKET_PRIORITIES, {
    error: "Choose a valid priority.",
  }),
});

export const createTicketSchema = ticketFieldsSchema.extend({
  attachment: z.any().optional(),
});

export type TicketFieldsValues = z.infer<typeof ticketFieldsSchema>;
export type CreateTicketValues = z.infer<typeof createTicketSchema>;

/**
 * RHF `register(..., { validate })` helper for a file input. An empty file
 * input is treated as "no attachment".
 */
export function validateAttachmentInput(value: unknown): string | true {
  let candidate: unknown = value;

  if (typeof FileList !== "undefined" && value instanceof FileList) {
    candidate = value[0];
  } else if (Array.isArray(value)) {
    candidate = value[0];
  }

  if (
    !candidate ||
    typeof candidate !== "object" ||
    !("name" in candidate) ||
    !("type" in candidate) ||
    !("size" in candidate)
  ) {
    return true;
  }

  const file = candidate as { name: string; type: string; size: number };
  if (file.size <= 0) return true;

  return validateAttachmentFile(file) ?? true;
}
