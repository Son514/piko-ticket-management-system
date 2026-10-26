import Link from "next/link";

import { signOutAction } from "@/app/server/auth/actions";
import { requireUser } from "@/app/server/auth/session";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              Piko
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/account" className="transition-colors hover:text-foreground">
                Account
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
