import { z } from "zod";

import {
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_VISIBILITIES,
} from "@/lib/comments";

const body = z
  .string()
  .trim()
  .min(1, "Write a comment.")
  .max(
    COMMENT_BODY_MAX_LENGTH,
    `Comment must be at most ${COMMENT_BODY_MAX_LENGTH} characters long.`,
  );

export const addCommentSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
  body,
  visibility: z.enum(COMMENT_VISIBILITIES, {
    error: "Choose a valid comment type.",
  }),
});

export const updateCommentSchema = z.object({
  commentId: z.coerce.number().int().positive(),
  body,
});

export const deleteCommentSchema = z.object({
  commentId: z.coerce.number().int().positive(),
});

export type AddCommentValues = z.infer<typeof addCommentSchema>;
export type UpdateCommentValues = z.infer<typeof updateCommentSchema>;
export type DeleteCommentValues = z.infer<typeof deleteCommentSchema>;
