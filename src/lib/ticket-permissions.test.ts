import { describe, expect, it } from "vitest";

import {
  canAssignTicket,
  canCloseTicket,
  canReopenTicket,
  canSelfAssignTicket,
  canUpdateTicketDetails,
} from "@/lib/ticket-permissions";

const customer = { id: 10, role: "customer" as const };
const agent = { id: 20, role: "agent" as const };
const otherAgent = { id: 21, role: "agent" as const };
const admin = { id: 30, role: "admin" as const };

const openTicket = {
  authorId: 10,
  status: "open" as const,
  assigneeId: null,
};

describe("ticket permissions", () => {
  it("allows agents and admins to update status/priority", () => {
    expect(canUpdateTicketDetails("customer")).toBe(false);
    expect(canUpdateTicketDetails("agent")).toBe(true);
    expect(canUpdateTicketDetails("admin")).toBe(true);
  });

  it("allows only admins to assign", () => {
    expect(canAssignTicket("agent")).toBe(false);
    expect(canAssignTicket("admin")).toBe(true);
  });

  it("lets agents self-assign only unassigned or self-assigned tickets", () => {
    expect(canSelfAssignTicket(openTicket, agent)).toBe(true);
    expect(
      canSelfAssignTicket({ ...openTicket, assigneeId: agent.id }, agent),
    ).toBe(true);
    expect(
      canSelfAssignTicket({ ...openTicket, assigneeId: otherAgent.id }, agent),
    ).toBe(false);
    expect(canSelfAssignTicket(openTicket, admin)).toBe(false);
  });

  it("lets customers close only their own non-closed tickets", () => {
    expect(canCloseTicket(openTicket, customer)).toBe(true);
    expect(
      canCloseTicket({ ...openTicket, authorId: 11 }, customer),
    ).toBe(false);
    expect(
      canCloseTicket({ ...openTicket, status: "closed" }, customer),
    ).toBe(false);
    expect(canCloseTicket(openTicket, agent)).toBe(false);
  });

  it("lets customers reopen their own closed/resolved tickets", () => {
    for (const status of ["closed", "resolved"] as const) {
      expect(
        canReopenTicket({ ...openTicket, status }, customer),
      ).toBe(true);
      expect(
        canReopenTicket({ ...openTicket, status, authorId: 11 }, customer),
      ).toBe(false);
    }
    expect(canReopenTicket(openTicket, customer)).toBe(false);
  });

  it("lets agents reopen any closed/resolved ticket", () => {
    expect(
      canReopenTicket({ ...openTicket, status: "closed" }, agent),
    ).toBe(true);
    expect(
      canReopenTicket({ ...openTicket, status: "resolved", authorId: 11 }, agent),
    ).toBe(true);
    expect(canReopenTicket(openTicket, agent)).toBe(false);
    expect(canReopenTicket({ ...openTicket, status: "closed" }, admin)).toBe(
      false,
    );
  });
});
