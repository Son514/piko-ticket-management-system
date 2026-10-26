"use client";

import { updateUserRoleAction } from "@/app/server/admin-actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useNativeFormAction } from "@/lib/forms/use-native-form-action";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles";

export function UserRoleForm({
  userId,
  role,
  isSelf,
}: {
  userId: number;
  role: Role;
  isSelf: boolean;
}) {
  const { state, onSubmit, pending } = useNativeFormAction(
    updateUserRoleAction,
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <select
          name="role"
          defaultValue={role}
          disabled={isSelf || pending}
          className="h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          aria-label="Role"
        >
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="outline" disabled={isSelf || pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
      {state.success ? (
        <p role="status" className="text-xs text-muted-foreground">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
