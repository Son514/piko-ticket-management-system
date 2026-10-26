"use client";

import { updateTicketAction } from "@/app/server/ticket-update-actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useNativeFormAction } from "@/lib/forms/use-native-form-action";
import {
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

export function TicketManageForm({
  ticketId,
  status,
  priority,
}: {
  ticketId: number;
  status: TicketStatus;
  priority: TicketPriority;
}) {
  const { state, onSubmit, pending } = useNativeFormAction(updateTicketAction);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
        <label htmlFor="manage-priority" className="mb-1 block text-sm font-medium">
          Priority
        </label>
        <select
          id="manage-priority"
          name="priority"
          defaultValue={priority}
          disabled={pending}
          className={selectClass}
        >
          {TICKET_PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {TICKET_PRIORITY_LABELS[option]}
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
