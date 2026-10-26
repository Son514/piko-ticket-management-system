import Link from "next/link";

import { requireUser } from "@/app/server/auth/session";
import { listAssignableStaff, listTickets } from "@/app/server/tickets";
import { TicketBadges } from "@/components/tickets/ticket-badges";
import { TicketFiltersForm } from "@/components/tickets/ticket-filters";
import { TicketPagination } from "@/components/tickets/ticket-pagination";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isStaff } from "@/lib/roles";
import {
  parsePage,
  parseTicketFilters,
  type TicketSearchParams,
} from "@/lib/validation/ticket-filters";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<TicketSearchParams>;
}) {
  const { user } = await requireUser();
  const params = await searchParams;
  const filters = parseTicketFilters(params);
  const requestedPage = parsePage(params.page);
  const staffView = isStaff(user.role);
  const staff = staffView ? await listAssignableStaff() : [];
  const result = await listTickets(filters, requestedPage);

  const heading =
    user.role === "admin"
      ? "All tickets"
      : user.role === "agent"
        ? "Agent ticket queue"
        : "My tickets";

  const description =
    user.role === "admin"
      ? "Every ticket in the workspace."
      : user.role === "agent"
        ? "Every ticket in the workspace, with filters for queue triage."
        : "Tickets created by your account.";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Tickets</p>
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href="/tickets/new"
          className={buttonVariants({ variant: "default" })}
        >
          New ticket
        </Link>
      </div>

      <TicketFiltersForm
        filters={filters}
        staff={staff}
        showAssignee={staffView}
      />

      <Card>
        <CardHeader>
          <CardTitle>{result.total} total</CardTitle>
          <CardDescription>
            {result.total === 0
              ? "No tickets match the current view."
              : `Showing ${result.tickets.length} on page ${result.page} of ${result.pageCount}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tickets found.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {result.tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <TicketBadges
                        category={ticket.category}
                        priority={ticket.priority}
                        status={ticket.status}
                      />
                    </div>
                    {ticket.content ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {ticket.content}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Assignee:{" "}
                        {ticket.assignee
                          ? (ticket.assignee.name ?? ticket.assignee.email)
                          : "Unassigned"}
                      </span>
                      {staffView ? (
                        <span>
                          Author: {ticket.author.name ?? ticket.author.email}
                        </span>
                      ) : null}
                    </div>
                    {ticket.attachments.length > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-3">
                        {ticket.attachments.map((attachment) => (
                          <li key={attachment.id}>
                            <a
                              href={`/api/attachments/${attachment.id}`}
                              className="text-xs underline underline-offset-4 hover:text-foreground"
                            >
                              {attachment.filename}
                            </a>
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({formatBytes(attachment.size)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <time
                    dateTime={ticket.createdAt}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatDate(ticket.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TicketPagination
        filters={filters}
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
      />
    </div>
  );
}
