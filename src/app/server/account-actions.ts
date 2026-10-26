"use server";

import { revalidatePath } from "next/cache";

import { accountSchema, formString, toFieldErrors } from "@/lib/validation/auth";
import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";
import type { AuthState } from "./auth/types";

export async function updateAccountAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const raw = {
    name: formString(formData, "name"),
    username: formString(formData, "username"),
  };
  const values = {
    name: raw.name.trim(),
    username: raw.username.trim(),
  };

  const parsed = accountSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const { name, username } = parsed.data;

  await connectDatabase();

  await db.orm.public.User.where({ id: user.id }).updateAll({
    name: name || null,
    username: username || null,
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");

  return {
    success: "Your profile has been updated.",
    values,
  };
}
