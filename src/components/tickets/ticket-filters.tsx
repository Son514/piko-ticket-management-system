import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
  TICKET_SORTS,
  TICKET_SORT_LABELS,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
} from "@/lib/tickets";
import type { StaffOption } from "@/app/server/tickets";
import type { TicketFilters } from "@/lib/validation/ticket-filters";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

export function TicketFiltersForm({
  filters,
  staff,
  showAssignee,
}: {
  filters: TicketFilters;
  staff: StaffOption[];
  showAssignee: boolean;
}) {
  const hasFilters =
    Boolean(filters.q) ||
    filters.status !== undefined ||
    filters.priority !== undefined ||
    filters.assignee !== undefined ||
    filters.sort !== "newest";

  return (
    <form
      method="get"
      action="/tickets"
      className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs md:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-2">
        <label htmlFor="ticket-search" className="mb-1 block text-sm font-medium">
          Search
        </label>
        <Input
          id="ticket-search"
          name="q"
          type="search"
          placeholder="Title or description"
          defaultValue={filters.q ?? ""}
        />
      </div>

      <div>
        <label htmlFor="ticket-status" className="mb-1 block text-sm font-medium">
          Status
        </label>
        <select
          id="ticket-status"
          name="status"
          defaultValue={filters.status ?? ""}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TICKET_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ticket-priority" className="mb-1 block text-sm font-medium">
          Priority
        </label>
        <select
          id="ticket-priority"
          name="priority"
          defaultValue={filters.priority ?? ""}
          className={selectClass}
        >
          <option value="">All priorities</option>
          {TICKET_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TICKET_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      {showAssignee ? (
        <div>
          <label htmlFor="ticket-assignee" className="mb-1 block text-sm font-medium">
            Assignee
          </label>
          <select
            id="ticket-assignee"
            name="assignee"
            defaultValue={
              filters.assignee === undefined ? "" : String(filters.assignee)
            }
            className={selectClass}
          >
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="ticket-sort" className="mb-1 block text-sm font-medium">
          Sort
        </label>
        <select
          id="ticket-sort"
          name="sort"
          defaultValue={filters.sort}
          className={selectClass}
        >
          {TICKET_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {TICKET_SORT_LABELS[sort]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit">Apply</Button>
        {hasFilters ? (
          <Link href="/tickets" className={buttonVariants({ variant: "outline" })}>
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
