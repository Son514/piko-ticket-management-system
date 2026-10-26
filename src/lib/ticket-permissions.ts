import type { Role } from "@/lib/roles";
import type { TicketStatus } from "@/lib/tickets";

type TicketState = {
  authorId: number;
  status: TicketStatus;
  assigneeId: number | null;
};

type Actor = {
  id: number;
  role: Role;
};

export function canUpdateTicketDetails(role: Role): boolean {
  return role === "agent" || role === "admin";
}

export function canAssignTicket(role: Role): boolean {
  return role === "admin";
}

export function canSelfAssignTicket(ticket: TicketState, actor: Actor): boolean {
  return (
    actor.role === "agent" &&
    (ticket.assigneeId === null || ticket.assigneeId === actor.id)
  );
}

export function canCloseTicket(ticket: TicketState, actor: Actor): boolean {
  return (
    actor.role === "customer" &&
    ticket.authorId === actor.id &&
    ticket.status !== "closed"
  );
}

export function canReopenTicket(ticket: TicketState, actor: Actor): boolean {
  if (ticket.status !== "closed" && ticket.status !== "resolved") {
    return false;
  }

  if (actor.role === "customer") {
    return ticket.authorId === actor.id;
  }

  return actor.role === "agent";
}
