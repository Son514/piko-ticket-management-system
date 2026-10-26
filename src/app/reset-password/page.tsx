import Link from "next/link";

import { findValidPasswordResetToken } from "@/app/server/auth/reset";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Card, CardContent } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const resetToken = await findValidPasswordResetToken(params.token);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-md">
        {params.token && resetToken ? (
          <ResetPasswordForm token={params.token} />
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 text-center">
              <h1 className="text-2xl font-bold">This link has expired</h1>
              <p className="text-sm text-muted-foreground">
                Password reset links are valid for one hour and can only be used
                once.
              </p>
              <FieldDescription>
                <Link href="/forgot-password" className="underline underline-offset-4">
                  Request a new reset link
                </Link>
              </FieldDescription>
              <FieldDescription>
                <Link href="/login" className="underline underline-offset-4">
                  Back to sign in
                </Link>
              </FieldDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
