import { z } from "zod";

import { ROLES } from "@/lib/roles";

export const updateUserRoleSchema = z.object({
  userId: z.coerce.number().int().positive(),
  role: z.enum(ROLES),
});

export const setUserActiveSchema = z.object({
  userId: z.coerce.number().int().positive(),
  active: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;
export type SetUserActiveValues = z.infer<typeof setUserActiveSchema>;
