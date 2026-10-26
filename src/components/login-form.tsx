"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cn } from "cn";

import { signInAction } from "@/app/server/auth/actions";
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

export function LoginForm({
  className,
  next,
  reset,
  ...props
}: React.ComponentProps<"div"> & {
  next?: string;
  reset?: boolean;
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialAuthState);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={formAction} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to your Piko account
                </p>
              </div>

              {reset ? (
                <p
                  role="status"
                  className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                >
                  Your password has been reset. Sign in with your new password.
                </p>
              ) : null}

              {state.error ? (
                <FieldError>{state.error}</FieldError>
              ) : null}

              <input type="hidden" name="next" value={next ?? ""} />

              <Field data-invalid={state.fieldErrors?.email ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  defaultValue={state.values?.email ?? ""}
                  aria-invalid={state.fieldErrors?.email ? true : undefined}
                  required
                />
                {state.fieldErrors?.email?.map((message) => (
                  <FieldError key={message}>{message}</FieldError>
                ))}
              </Field>

              <Field data-invalid={state.fieldErrors?.password ? true : undefined}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={state.fieldErrors?.password ? true : undefined}
                  required
                />
                {state.fieldErrors?.password?.map((message) => (
                  <FieldError key={message}>{message}</FieldError>
                ))}
              </Field>

              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Signing in..." : "Sign in"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-muted md:flex md:flex-col md:justify-between md:p-8 md:text-primary-foreground">
            <p className="text-sm font-semibold tracking-wide">Piko</p>
            <div>
              <p className="text-2xl font-semibold">Support that keeps moving.</p>
              <p className="mt-2 text-sm opacity-80">
                Manage tickets, track requests, and keep your team aligned.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By signing in, you agree to keep your account credentials secure.
      </FieldDescription>
    </div>
  );
}
