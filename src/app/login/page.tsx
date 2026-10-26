import { redirect } from "next/navigation";

import { getSession } from "@/app/server/auth/session";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm next={params.next} reset={params.reset === "1"} />
      </div>
    </div>
  );
}
