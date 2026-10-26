"use client";

import { useActionState, type ComponentProps } from "react";

import type { AuthState } from "@/app/server/auth/types";
import { initialAuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

type TicketAction = (
  state: AuthState,
  formData: FormData,
) => Promise<AuthState>;

export function TicketActionButton({
  ticketId,
  action,
  label,
  pendingLabel,
  variant = "outline",
}: {
  ticketId: number;
  action: TicketAction;
  label: string;
  pendingLabel: string;
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAuthState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <Button type="submit" variant={variant} disabled={pending}>
        {pending ? pendingLabel : label}
      </Button>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
      {state.success ? (
        <p role="status" className="text-xs text-muted-foreground">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
