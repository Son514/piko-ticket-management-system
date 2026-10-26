"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPasswordAction } from "@/app/server/auth/actions";
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
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validation/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const { form, state, onSubmit, pending } =
    useAuthForm<ResetPasswordValues>(resetPasswordAction, {
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: { token, password: "", confirmPassword: "" },
      mode: "onTouched",
    });
  const errors = form.formState.errors;

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

          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <input type="hidden" name="token" value={token} />

              <Field data-invalid={errors.password ? true : undefined}>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? true : undefined}
                  {...form.register("password")}
                />
                {errors.password?.message ? (
                  <FieldError>{errors.password.message}</FieldError>
                ) : null}
              </Field>

              <Field data-invalid={errors.confirmPassword ? true : undefined}>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  {...form.register("confirmPassword")}
                />
                {errors.confirmPassword?.message ? (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                ) : null}
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
