"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cn } from "cn";

import { signUpAction } from "@/app/server/auth/actions";
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

export function SignupForm({
  className,
  next,
  ...props
}: React.ComponentProps<"div"> & {
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(signUpAction, initialAuthState);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={formAction} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Start managing tickets with Piko
                </p>
              </div>

              {state.error ? <FieldError>{state.error}</FieldError> : null}

              <input type="hidden" name="next" value={next ?? ""} />

              <Field data-invalid={state.fieldErrors?.name ? true : undefined}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  defaultValue={state.values?.name ?? ""}
                  aria-invalid={state.fieldErrors?.name ? true : undefined}
                />
                {state.fieldErrors?.name?.map((message) => (
                  <FieldError key={message}>{message}</FieldError>
                ))}
              </Field>

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
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
                {state.fieldErrors?.email?.map((message) => (
                  <FieldError key={message}>{message}</FieldError>
                ))}
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field data-invalid={state.fieldErrors?.password ? true : undefined}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
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
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating account..." : "Create Account"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-muted md:flex md:flex-col md:justify-between md:p-8 md:text-primary-foreground">
            <p className="text-sm font-semibold tracking-wide">Piko</p>
            <div>
              <p className="text-2xl font-semibold">One place for every request.</p>
              <p className="mt-2 text-sm opacity-80">
                Keep conversations, priorities, and resolutions together.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By creating an account, you agree to keep your account credentials secure.
      </FieldDescription>
    </div>
  );
}
