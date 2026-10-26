import { describe, expect, it } from "vitest";

import {
  assignTicketSchema,
  ticketActionSchema,
  updateTicketSchema,
} from "@/lib/validation/ticket-update";

describe("updateTicketSchema", () => {
  it("parses a status and priority", () => {
    expect(
      updateTicketSchema.parse({
        ticketId: "7",
        status: "in_progress",
        priority: "urgent",
      }),
    ).toEqual({
      ticketId: 7,
      status: "in_progress",
      priority: "urgent",
    });
  });

  it("rejects invalid statuses and priorities", () => {
    expect(
      updateTicketSchema.safeParse({
        ticketId: "7",
        status: "archived",
        priority: "high",
      }).success,
    ).toBe(false);

    expect(
      updateTicketSchema.safeParse({
        ticketId: "7",
        status: "open",
        priority: "critical",
      }).success,
    ).toBe(false);
  });
});

describe("assignTicketSchema", () => {
  it("parses a numeric agent and null assignment", () => {
    expect(
      assignTicketSchema.parse({ ticketId: "4", assigneeId: "9" }),
    ).toEqual({ ticketId: 4, assigneeId: 9 });

    for (const value of ["", "unassigned", undefined]) {
      expect(
        assignTicketSchema.parse({ ticketId: "4", assigneeId: value })
          .assigneeId,
      ).toBeNull();
    }
  });

  it("rejects invalid IDs", () => {
    expect(
      assignTicketSchema.safeParse({ ticketId: "4", assigneeId: "abc" })
        .success,
    ).toBe(false);
  });
});

describe("ticketActionSchema", () => {
  it("coerces a ticket ID", () => {
    expect(ticketActionSchema.parse({ ticketId: "11" })).toEqual({
      ticketId: 11,
    });
    expect(ticketActionSchema.safeParse({ ticketId: "abc" }).success).toBe(
      false,
    );
  });
});
