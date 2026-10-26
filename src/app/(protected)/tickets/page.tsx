import { requireUser } from "@/app/server/auth/session";
import { listTickets } from "@/app/server/tickets";
import { isStaff } from "@/lib/roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

export default async function TicketsPage() {
  const { user } = await requireUser();
  const tickets = await listTickets();
  const staffView = isStaff(user.role);

  return (
    <div className="flex flex-col gap-6">
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
            <p className="text-sm text-muted-foreground">
              No tickets yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{ticket.title}</p>
                    {ticket.content ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {ticket.content}
                      </p>
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
