import Link from "next/link";

import { signOutAction } from "@/app/server/auth/actions";
import { requireUser } from "@/app/server/auth/session";
import { Button } from "@/components/ui/button";
import { isStaff, ROLE_LABELS } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  const staff = isStaff(user.role);
  const ticketsLabel =
    user.role === "admin"
      ? "All tickets"
      : staff
        ? "Ticket queue"
        : "My tickets";

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
              <Link href="/tickets" className="transition-colors hover:text-foreground">
                {ticketsLabel}
              </Link>
              {user.role === "admin" ? (
                <Link href="/admin/users" className="transition-colors hover:text-foreground">
                  Users
                </Link>
              ) : null}
              <Link href="/account" className="transition-colors hover:text-foreground">
                Account
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
              {ROLE_LABELS[user.role]}
            </span>
            <span className="hidden text-sm text-muted-foreground md:inline">
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
