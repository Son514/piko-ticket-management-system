import { seed } from "../src/prisma/seed.ts";

process.env.APP_URL ??= "http://localhost:3100";

await seed();
console.log("E2E database seeded.");
process.exit(0);
