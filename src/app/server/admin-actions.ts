"use server";

import { revalidatePath } from "next/cache";

import {
  setUserActiveSchema,
  updateUserRoleSchema,
} from "@/lib/validation/admin";
import { connectDatabase, db } from "@/prisma/db";
import { requireAdmin } from "./auth/session";
import type { AuthState } from "./auth/types";

async function activeAdminCount(): Promise<number> {
  const { count } = await db.orm.public.User
    .where({ role: "admin" })
    .where((user) => user.isActive.eq(true))
    .aggregate((aggregate) => ({ count: aggregate.count() }));

  return count;
}

export async function updateUserRoleAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user: admin } = await requireAdmin();

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: "Invalid role update request." };
  }

  const { userId, role } = parsed.data;

  await connectDatabase();

  const target = await db.orm.public.User
    .select("id", "email", "role", "isActive")
    .where({ id: userId })
    .first();

  if (!target) return { error: "User not found." };

  if (target.id === admin.id && role !== target.role) {
    return { error: "You cannot change your own role." };
  }

  if (
    target.role === "admin" &&
    target.isActive &&
    role !== "admin" &&
    (await activeAdminCount()) <= 1
  ) {
    return { error: "At least one active admin is required." };
  }

  await db.orm.public.User.where({ id: userId }).updateAll({ role });

  revalidatePath("/admin/users");

  return { success: `Role updated for ${target.email}.` };
}

export async function setUserActiveAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user: admin } = await requireAdmin();

  const parsed = setUserActiveSchema.safeParse({
    userId: formData.get("userId"),
    active: formData.get("active"),
  });
  if (!parsed.success) {
    return { error: "Invalid account status request." };
  }

  const { userId, active } = parsed.data;

  if (targetIsSelf(admin.id, userId) && !active) {
    return { error: "You cannot deactivate your own account." };
  }

  await connectDatabase();

  const target = await db.orm.public.User
    .select("id", "email", "role", "isActive")
    .where({ id: userId })
    .first();

  if (!target) return { error: "User not found." };

  if (
    !active &&
    target.role === "admin" &&
    target.isActive &&
    (await activeAdminCount()) <= 1
  ) {
    return { error: "At least one active admin is required." };
  }

  if (target.isActive === active) {
    return {
      success: `${target.email} is already ${active ? "active" : "deactivated"}.`,
    };
  }

  await db.orm.public.User.where({ id: userId }).updateAll({
    isActive: active,
    deactivatedAt: active ? null : new Date().toISOString(),
  });

  if (!active) {
    // Deactivation must take effect on the user's next request immediately.
    await db.orm.public.Session.where({ userId }).deleteAll();
  }

  revalidatePath("/admin/users");

  return {
    success: `${target.email} has been ${active ? "activated" : "deactivated"}.`,
  };
}

function targetIsSelf(adminId: number, userId: number): boolean {
  return adminId === userId;
}
