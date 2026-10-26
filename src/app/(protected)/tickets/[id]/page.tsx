import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/app/server/auth/session";
import { getTicketById, listAssignableStaff } from "@/app/server/tickets";
import { TicketBadges } from "@/components/tickets/ticket-badges";
import { TicketManageForm } from "@/components/tickets/ticket-manage-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isStaff } from "@/lib/roles";

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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const { user } = await requireUser();
  const ticket = await getTicketById(id);
  if (!ticket) notFound();

  const staffView = isStaff(user.role);
  const staff = staffView ? await listAssignableStaff() : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/tickets"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            ← Back to tickets
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {ticket.title}
          </h1>
          <div className="mt-3">
            <TicketBadges
              category={ticket.category}
              priority={ticket.priority}
              status={ticket.status}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Ticket #{ticket.id}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6">
                {ticket.content}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                Files uploaded with this ticket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticket.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attachments.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {ticket.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <a
                        href={`/api/attachments/${attachment.id}`}
                        className="text-sm underline underline-offset-4 hover:text-muted-foreground"
                      >
                        {attachment.filename}
                      </a>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatBytes(attachment.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Author</dt>
                  <dd className="font-medium">
                    {ticket.author.name ?? ticket.author.email}
                  </dd>
                  <dd className="text-xs text-muted-foreground break-all">
                    {ticket.author.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Assignee</dt>
                  <dd className="font-medium">
                    {ticket.assignee
                      ? (ticket.assignee.name ?? ticket.assignee.email)
                      : "Unassigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">{formatDate(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd className="font-medium">{formatDate(ticket.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {staffView ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage</CardTitle>
                <CardDescription>
                  Update the ticket status or assign it to a staff member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TicketManageForm
                  ticketId={ticket.id}
                  status={ticket.status}
                  assigneeId={ticket.assignee?.id ?? null}
                  staff={staff}
                />
              </CardContent>
            </Card>
          ) : null}

          <Link
            href="/tickets"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to list
          </Link>
        </div>
      </div>
    </div>
  );
}
