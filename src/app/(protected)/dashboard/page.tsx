import Link from "next/link";

import { listAccountPosts } from "@/app/server/account";
import { requireUser } from "@/app/server/auth/session";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isStaff, ROLE_LABELS } from "@/lib/roles";
import { listUsers } from "@/prisma/users";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

export default async function DashboardPage() {
  const { user } = await requireUser();
  const staff = isStaff(user.role);
  const [posts, team] = await Promise.all([
    listAccountPosts(),
    staff ? listUsers(5).catch(() => []) : Promise.resolve([]),
  ]);

  const displayName = user.name?.trim() || user.email;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {displayName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/tickets"
            className={buttonVariants({ variant: "outline" })}
          >
            {staff ? "Ticket queue" : "My tickets"}
          </Link>
          <Link
            href="/account"
            className={buttonVariants({ variant: "outline" })}
          >
            Edit profile
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Email</CardDescription>
            <CardTitle className="truncate text-base">{user.email}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Role</CardDescription>
            <CardTitle className="text-base">{ROLE_LABELS[user.role]}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Member since</CardDescription>
            <CardTitle className="text-base">{formatDate(user.createdAt)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Your tickets</CardDescription>
            <CardTitle className="text-base">{posts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your tickets</CardTitle>
          <CardDescription>
            Tickets assigned to your account appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You do not have any tickets yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {posts.map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    {post.content ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {post.content}
                      </p>
                    ) : null}
                  </div>
                  <time
                    dateTime={post.createdAt}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {staff ? (
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>People with access to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members yet.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {team.map((member) => (
                  <li key={member.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium">{member.name ?? member.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.username ? `@${member.username}` : member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {ROLE_LABELS[member.role]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined {formatDate(member.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
