import { z } from "zod";

import { TICKET_STATUSES } from "@/lib/tickets";

export const updateTicketSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
  status: z.enum(TICKET_STATUSES, {
    error: "Choose a valid status.",
  }),
  assigneeId: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === "unassigned"
        ? null
        : Number(value),
    z.number().int().positive().nullable(),
  ),
});

export type UpdateTicketValues = z.infer<typeof updateTicketSchema>;
