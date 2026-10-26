"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";

import { requestPasswordResetAction } from "@/app/server/auth/actions";
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
import { useAuthForm } from "@/lib/forms/use-auth-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validation/auth";

export function ForgotPasswordForm() {
  const { form, state, onSubmit, pending } =
    useAuthForm<ForgotPasswordValues>(requestPasswordResetAction, {
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
      mode: "onTouched",
    });
  const errors = form.formState.errors;

  return (
    <Card>
      <CardContent className="p-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email and we&apos;ll send you a link to choose a new
              password.
            </p>
          </div>

          {state.success ? (
            <p
              role="status"
              className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              {state.success}
            </p>
          ) : null}

          {state.error ? <FieldError>{state.error}</FieldError> : null}

          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  {...form.register("email")}
                />
                {errors.email?.message ? (
                  <FieldError>{errors.email.message}</FieldError>
                ) : null}
              </Field>

              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Sending..." : "Send reset link"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <FieldDescription className="text-center">
            Remembered it?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
