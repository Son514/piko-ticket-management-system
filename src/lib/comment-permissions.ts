import type { Role } from "@/lib/roles";

export function canViewInternalComments(role: Role): boolean {
  return role === "agent" || role === "admin";
}

export function canCreateInternalNote(role: Role): boolean {
  return role === "agent" || role === "admin";
}

export function canAddPublicReply(role: Role): boolean {
  return role === "customer" || role === "agent" || role === "admin";
}

export function canEditComment(
  comment: { authorId: number },
  actor: { id: number },
): boolean {
  return comment.authorId === actor.id;
}

export function canDeleteComment(
  comment: { authorId: number },
  actor: { id: number },
): boolean {
  return comment.authorId === actor.id;
}
