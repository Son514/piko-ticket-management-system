"use client";

import { useActionState } from "react";

import { assignTicketAction } from "@/app/server/ticket-update-actions";
import type { StaffOption } from "@/app/server/tickets";
import { initialAuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

export function AdminAssignForm({
  ticketId,
  assigneeId,
  agents,
}: {
  ticketId: number;
  assigneeId: number | null;
  agents: StaffOption[];
}) {
  const [state, formAction, pending] = useActionState(
    assignTicketAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />

      <div>
        <label htmlFor="assign-agent" className="mb-1 block text-sm font-medium">
          Assign to agent
        </label>
        <select
          id="assign-agent"
          name="assigneeId"
          defaultValue={assigneeId === null ? "" : String(assigneeId)}
          disabled={pending}
          className={selectClass}
        >
          <option value="">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name ?? agent.email}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Assigning..." : "Update assignment"}
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
