"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction } from "@/app/server/auth/actions";
import { initialAuthState } from "@/app/server/auth/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialAuthState,
  );

  return (
    <Card>
      <CardContent className="p-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Choose a new password</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Pick a password you haven&apos;t used before.
            </p>
          </div>

          {state.error ? <FieldError>{state.error}</FieldError> : null}

          <form action={formAction}>
            <FieldGroup>
              <input type="hidden" name="token" value={token} />

              <Field data-invalid={state.fieldErrors?.password ? true : undefined}>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  aria-invalid={state.fieldErrors?.password ? true : undefined}
                  required
                />
                {state.fieldErrors?.password?.map((message) => (
                  <FieldError key={message}>{message}</FieldError>
                ))}
              </Field>

              <Field data-invalid={state.fieldErrors?.confirmPassword ? true : undefined}>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  aria-invalid={state.fieldErrors?.confirmPassword ? true : undefined}
                  required
                />
                {state.fieldErrors?.confirmPassword?.map((message) => (
                  <FieldError key={message}>{message}</FieldError>
                ))}
              </Field>

              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Updating password..." : "Update password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <FieldDescription className="text-center">
            <Link href="/forgot-password" className="underline underline-offset-4">
              Request a new link
            </Link>
          </FieldDescription>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
