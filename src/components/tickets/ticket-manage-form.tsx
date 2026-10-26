"use client";

import { useActionState } from "react";

import { updateTicketAction } from "@/app/server/ticket-update-actions";
import type { StaffOption } from "@/app/server/tickets";
import { initialAuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from "@/lib/tickets";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

export function TicketManageForm({
  ticketId,
  status,
  assigneeId,
  staff,
}: {
  ticketId: number;
  status: TicketStatus;
  assigneeId: number | null;
  staff: StaffOption[];
}) {
  const [state, formAction, pending] = useActionState(
    updateTicketAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="ticketId" value={ticketId} />

      <div>
        <label htmlFor="manage-status" className="mb-1 block text-sm font-medium">
          Status
        </label>
        <select
          id="manage-status"
          name="status"
          defaultValue={status}
          disabled={pending}
          className={selectClass}
        >
          {TICKET_STATUSES.map((option) => (
            <option key={option} value={option}>
              {TICKET_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="manage-assignee" className="mb-1 block text-sm font-medium">
          Assignee
        </label>
        <select
          id="manage-assignee"
          name="assigneeId"
          defaultValue={assigneeId === null ? "" : String(assigneeId)}
          disabled={pending}
          className={selectClass}
        >
          <option value="">Unassigned</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>

      {state.error ? <FieldError>{state.error}</FieldError> : null}
      {state.success ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
