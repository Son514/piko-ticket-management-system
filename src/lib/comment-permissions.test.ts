import { describe, expect, it } from "vitest";

import {
  canAddPublicReply,
  canCreateInternalNote,
  canDeleteComment,
  canEditComment,
  canViewInternalComments,
} from "@/lib/comment-permissions";

const comment = { authorId: 10 };
const owner = { id: 10 };
const other = { id: 11 };

describe("comment permissions", () => {
  it("lets agents and admins view/create internal notes", () => {
    expect(canViewInternalComments("customer")).toBe(false);
    expect(canViewInternalComments("agent")).toBe(true);
    expect(canViewInternalComments("admin")).toBe(true);

    expect(canCreateInternalNote("customer")).toBe(false);
    expect(canCreateInternalNote("agent")).toBe(true);
    expect(canCreateInternalNote("admin")).toBe(true);
  });

  it("lets every authenticated role add public replies", () => {
    expect(canAddPublicReply("customer")).toBe(true);
    expect(canAddPublicReply("agent")).toBe(true);
    expect(canAddPublicReply("admin")).toBe(true);
  });

  it("allows edit/delete only by the author", () => {
    expect(canEditComment(comment, owner)).toBe(true);
    expect(canEditComment(comment, other)).toBe(false);
    expect(canDeleteComment(comment, owner)).toBe(true);
    expect(canDeleteComment(comment, other)).toBe(false);
  });
});
