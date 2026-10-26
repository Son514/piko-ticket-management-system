"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";

import { signUpAction } from "@/app/server/auth/actions";
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
import { signUpSchema, type SignUpValues } from "@/lib/validation/auth";

export function SignupForm({
  className,
  next,
  ...props
}: React.ComponentProps<"div"> & {
  next?: string;
}) {
  const { form, state, onSubmit, pending } = useAuthForm<SignUpValues>(
    signUpAction,
    {
      resolver: zodResolver(signUpSchema),
      defaultValues: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
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
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Start managing tickets with Piko
                </p>
              </div>

              {state.error ? <FieldError>{state.error}</FieldError> : null}

              <input type="hidden" name="next" value={next ?? ""} />

              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  aria-invalid={errors.name ? true : undefined}
                  {...form.register("name")}
                />
                {errors.name?.message ? (
                  <FieldError>{errors.name.message}</FieldError>
                ) : null}
              </Field>

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
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
                {errors.email?.message ? (
                  <FieldError>{errors.email.message}</FieldError>
                ) : null}
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field data-invalid={errors.password ? true : undefined}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
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
