import { describe, expect, it } from "vitest";

import {
  addCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from "@/lib/validation/comments";

describe("addCommentSchema", () => {
  it("accepts public and internal comments and trims the body", () => {
    const publicComment = addCommentSchema.parse({
      ticketId: "4",
      body: "  A public reply.  ",
      visibility: "public",
    });
    const internalComment = addCommentSchema.parse({
      ticketId: "4",
      body: "An internal note.",
      visibility: "internal",
    });

    expect(publicComment.body).toBe("A public reply.");
    expect(internalComment.visibility).toBe("internal");
  });

  it("rejects empty and invalid comments", () => {
    expect(
      addCommentSchema.safeParse({
        ticketId: "4",
        body: "   ",
        visibility: "public",
      }).success,
    ).toBe(false);

    expect(
      addCommentSchema.safeParse({
        ticketId: "4",
        body: "hello",
        visibility: "private",
      }).success,
    ).toBe(false);
  });
});

describe("updateCommentSchema", () => {
  it("requires a body and coerces the comment ID", () => {
    expect(
      updateCommentSchema.parse({ commentId: "3", body: " Updated " }),
    ).toEqual({ commentId: 3, body: "Updated" });
  });
});

describe("deleteCommentSchema", () => {
  it("coerces the comment ID", () => {
    expect(deleteCommentSchema.parse({ commentId: "8" })).toEqual({
      commentId: 8,
    });
    expect(deleteCommentSchema.safeParse({ commentId: "x" }).success).toBe(
      false,
    );
  });
});
