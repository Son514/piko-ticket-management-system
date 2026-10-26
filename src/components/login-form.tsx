"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";

import { signInAction } from "@/app/server/auth/actions";
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
import { signInSchema, type SignInValues } from "@/lib/validation/auth";

export function LoginForm({
  className,
  next,
  reset,
  ...props
}: React.ComponentProps<"div"> & {
  next?: string;
  reset?: boolean;
}) {
  const { form, state, onSubmit, pending } = useAuthForm<SignInValues>(
    signInAction,
    {
      resolver: zodResolver(signInSchema),
      defaultValues: { email: "", password: "" },
      mode: "onTouched",
    },
  );
  const errors = form.formState.errors;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={onSubmit}
            noValidate
            className="p-6 md:p-8"
          >
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

              {state.error ? <FieldError>{state.error}</FieldError> : null}

              <input type="hidden" name="next" value={next ?? ""} />

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

              <Field data-invalid={errors.password ? true : undefined}>
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
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  {...form.register("password")}
                />
                {errors.password?.message ? (
                  <FieldError>{errors.password.message}</FieldError>
                ) : null}
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
