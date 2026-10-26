export const ROLES = ["customer", "agent", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  agent: "Agent",
  admin: "Admin",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  customer: "Can view their own tickets and account.",
  agent: "Can view the full ticket queue.",
  admin: "Can manage tickets, users, roles, and account access.",
};

export function isStaff(role: Role): boolean {
  return role === "agent" || role === "admin";
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}
