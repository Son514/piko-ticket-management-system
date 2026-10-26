import Link from "next/link";

import { requireUser } from "@/app/server/auth/session";
import { listTickets } from "@/app/server/tickets";
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
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  type TicketPriority,
} from "@/lib/tickets";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  urgent: "bg-destructive/10 text-destructive",
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TicketsPage() {
  const { user } = await requireUser();
  const tickets = await listTickets();
  const staffView = isStaff(user.role);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Tickets</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {staffView ? "Ticket queue" : "My tickets"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staffView
              ? "Every ticket in the workspace, newest first."
              : "Tickets created by your account."}
          </p>
        </div>
        <Link
          href="/tickets/new"
          className={buttonVariants({ variant: "default" })}
        >
          New ticket
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tickets.length} total</CardTitle>
          <CardDescription>
            {staffView
              ? "Agents and administrators can see the whole queue."
              : "You can only see tickets that belong to you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{ticket.title}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {TICKET_CATEGORY_LABELS[ticket.category]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}
                      >
                        {TICKET_PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </div>
                    {ticket.content ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {ticket.content}
                      </p>
                    ) : null}
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
                    {staffView ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {ticket.author.name ?? ticket.author.email}
                        {ticket.author.name ? ` · ${ticket.author.email}` : ""}
                      </p>
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
    </div>
  );
}
