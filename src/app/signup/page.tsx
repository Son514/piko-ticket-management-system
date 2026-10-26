import { redirect } from "next/navigation";

import { getSession } from "@/app/server/auth/session";
import { SignupForm } from "@/components/signup-form";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm next={params.next} />
      </div>
    </div>
  );
}
