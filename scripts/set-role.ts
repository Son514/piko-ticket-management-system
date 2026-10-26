import { connectDatabase, db } from "../src/prisma/db.ts";
import { ROLES, type Role } from "../src/lib/roles.ts";

const [rawEmail, rawRole] = process.argv.slice(2);

if (!rawEmail || !rawRole) {
  console.error("Usage: bun run role:set <email> <customer|agent|admin>");
  process.exit(1);
}

const role = rawRole as Role;
if (!ROLES.includes(role)) {
  console.error(`Invalid role "${rawRole}". Choose one of: ${ROLES.join(", ")}`);
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();

await connectDatabase();

const user = await db.orm.public.User
  .select("id", "email", "role", "isActive")
  .where({ email })
  .first();

if (!user) {
  console.error(`No user found for ${email}. Sign up first, then run this again.`);
  process.exit(1);
}

await db.orm.public.User.where({ id: user.id }).updateAll({
  role,
  isActive: true,
  deactivatedAt: null,
});

console.log(`Updated ${user.email}: role=${role}, active=true`);
process.exit(0);
