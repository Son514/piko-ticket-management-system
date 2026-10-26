"use client";

import { useActionState } from "react";

import { updateAccountAction } from "@/app/server/account-actions";
import { initialAuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AccountForm({
  name,
  username,
}: {
  name: string;
  username: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateAccountAction,
    initialAuthState,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        {state.success ? (
          <p
            role="status"
            className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
          >
            {state.success}
          </p>
        ) : null}

        {state.error ? <FieldError>{state.error}</FieldError> : null}

        <Field data-invalid={state.fieldErrors?.name ? true : undefined}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            defaultValue={state.values?.name ?? name}
            aria-invalid={state.fieldErrors?.name ? true : undefined}
          />
          {state.fieldErrors?.name?.map((message) => (
            <FieldError key={message}>{message}</FieldError>
          ))}
        </Field>

        <Field data-invalid={state.fieldErrors?.username ? true : undefined}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="jane_doe"
            defaultValue={state.values?.username ?? username}
            aria-invalid={state.fieldErrors?.username ? true : undefined}
          />
          <FieldDescription>
            3–32 characters. Letters, numbers, and underscores only.
          </FieldDescription>
          {state.fieldErrors?.username?.map((message) => (
            <FieldError key={message}>{message}</FieldError>
          ))}
        </Field>

        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
