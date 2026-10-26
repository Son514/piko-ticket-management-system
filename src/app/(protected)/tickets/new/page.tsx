import { requireUser } from "@/app/server/auth/session";
import { TicketForm } from "@/components/tickets/ticket-form";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Tickets</p>
        <h1 className="text-2xl font-semibold tracking-tight">New ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the issue and choose how urgently it needs attention.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <TicketForm />
        </CardContent>
      </Card>
    </div>
  );
}
