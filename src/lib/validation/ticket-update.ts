import { z } from "zod";

import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets";

export const updateTicketSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
  status: z.enum(TICKET_STATUSES, {
    error: "Choose a valid status.",
  }),
  priority: z.enum(TICKET_PRIORITIES, {
    error: "Choose a valid priority.",
  }),
});

export const assignTicketSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
  assigneeId: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === "unassigned"
        ? null
        : Number(value),
    z.number().int().positive().nullable(),
  ),
});

export const ticketActionSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
});

export type UpdateTicketValues = z.infer<typeof updateTicketSchema>;
export type AssignTicketValues = z.infer<typeof assignTicketSchema>;
export type TicketActionValues = z.infer<typeof ticketActionSchema>;
