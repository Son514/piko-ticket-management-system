import { requireUser } from "@/app/server/auth/session";
import { AccountForm } from "@/components/account-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default async function AccountPage() {
  const { user } = await requireUser();

  const createdAt = new Date(user.createdAt);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Account</p>
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              This information is visible to other members of your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm name={user.name ?? ""} username={user.username ?? ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Read-only account information.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium break-all">{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">
                  {Number.isNaN(createdAt.getTime())
                    ? "—"
                    : formatter.format(createdAt)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
