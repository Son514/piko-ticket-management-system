"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { updateAccountAction } from "@/app/server/account-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthForm } from "@/lib/forms/use-auth-form";
import { accountSchema, type AccountValues } from "@/lib/validation/auth";

export function AccountForm({
  name,
  username,
}: {
  name: string;
  username: string;
}) {
  const { form, state, onSubmit, pending } =
    useAuthForm<AccountValues>(updateAccountAction, {
      resolver: zodResolver(accountSchema),
      defaultValues: { name, username },
      mode: "onTouched",
    });
  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} noValidate>
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

        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            {...form.register("name")}
          />
          {errors.name?.message ? (
            <FieldError>{errors.name.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={errors.username ? true : undefined}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="jane_doe"
            aria-invalid={errors.username ? true : undefined}
            {...form.register("username")}
          />
          <FieldDescription>
            3–32 characters. Letters, numbers, and underscores only.
          </FieldDescription>
          {errors.username?.message ? (
            <FieldError>{errors.username.message}</FieldError>
          ) : null}
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
