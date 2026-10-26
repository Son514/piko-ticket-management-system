import { describe, expect, it } from "vitest";

import { updateTicketSchema } from "@/lib/validation/ticket-update";

describe("updateTicketSchema", () => {
  it("parses a status and numeric assignee", () => {
    expect(
      updateTicketSchema.parse({
        ticketId: "7",
        status: "in_progress",
        assigneeId: "3",
      }),
    ).toEqual({
      ticketId: 7,
      status: "in_progress",
      assigneeId: 3,
    });
  });

  it("treats empty and unassigned values as null", () => {
    for (const value of ["", "unassigned", undefined]) {
      expect(
        updateTicketSchema.parse({
          ticketId: "7",
          status: "open",
          assigneeId: value,
        }).assigneeId,
      ).toBeNull();
    }
  });

  it("rejects invalid statuses and assignees", () => {
    expect(
      updateTicketSchema.safeParse({
        ticketId: "7",
        status: "archived",
        assigneeId: "",
      }).success,
    ).toBe(false);

    expect(
      updateTicketSchema.safeParse({
        ticketId: "7",
        status: "open",
        assigneeId: "abc",
      }).success,
    ).toBe(false);
  });
});
