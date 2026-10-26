import { listAdminUsers } from "@/app/server/admin";
import { requireAdmin } from "@/app/server/auth/session";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { UserStatusForm } from "@/components/admin/user-status-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE_LABELS, type Role } from "@/lib/roles";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const ROLE_STYLES: Record<Role, string> = {
  customer: "bg-muted text-muted-foreground",
  agent: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  admin: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

export default async function AdminUsersPage() {
  const { user: currentUser } = await requireAdmin();
  const users = await listAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage workspace roles and account access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{users.length} users</CardTitle>
          <CardDescription>
            Deactivating a user revokes their sessions immediately and blocks new
            sign-ins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y">
            {users.map((user) => {
              const isSelf = user.id === currentUser.id;

              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-4 py-5 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {user.name ?? user.email}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role]}`}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Deactivated"}
                      </span>
                      {isSelf ? (
                        <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground break-all">
                      {user.email}
                      {user.username ? ` · @${user.username}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Joined {formatDate(user.createdAt)}
                      {user.deactivatedAt
                        ? ` · Deactivated ${formatDate(user.deactivatedAt)}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <UserRoleForm
                      userId={user.id}
                      role={user.role}
                      isSelf={isSelf}
                    />
                    <UserStatusForm
                      userId={user.id}
                      isActive={user.isActive}
                      isSelf={isSelf}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
