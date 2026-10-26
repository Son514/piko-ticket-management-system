"use client";

import { useActionState } from "react";

import { setUserActiveAction } from "@/app/server/admin-actions";
import { initialAuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function UserStatusForm({
  userId,
  isActive,
  isSelf,
}: {
  userId: number;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    setUserActiveAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        type="hidden"
        name="active"
        value={isActive ? "false" : "true"}
      />
      <Button
        type="submit"
        size="sm"
        variant={isActive ? "destructive" : "outline"}
        disabled={isSelf || pending}
      >
        {pending
          ? "Updating..."
          : isActive
            ? "Deactivate"
            : "Reactivate"}
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
