"use server";

import { revalidatePath } from "next/cache";

import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";
import type { AuthState } from "./auth/types";
import { validateName, validateUsername } from "./auth/validation";

export async function updateAccountAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  const fieldErrors: Record<string, string[]> = {};
  const nameError = validateName(name);
  if (nameError) fieldErrors.name = [nameError];

  const usernameError = validateUsername(username);
  if (usernameError) fieldErrors.username = [usernameError];

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values: { name, username } };
  }

  await connectDatabase();

  await db.orm.public.User.where({ id: user.id }).updateAll({
    name: name || null,
    username: username || null,
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");

  return {
    success: "Your profile has been updated.",
    values: { name, username },
  };
}
