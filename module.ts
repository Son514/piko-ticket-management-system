import { module } from "@prisma/composer";
import { envSecret } from "@prisma/composer-prisma-cloud";
import { postgres } from "@prisma/composer-prisma-cloud/orm";

import { appContract } from "./src/prisma/composer.ts";
import app from "./service.ts";

export default module("piko-ticket-management-system", ({ provision }) => {
  const database = provision(
    postgres({
      name: "database",
      contract: appContract,
      config: "./prisma.config.ts",
    }),
    { id: "database" },
  );

  // SMTP values live in the Prisma project's environment (Preview and
  // Production). They are bound as secrets so the deploy preflight reads them
  // from the platform and the values stay out of the serialized input.
  provision(app, {
    deps: { database },
    input: {
      smtpHost: envSecret("SMTP_HOST"),
      smtpPort: envSecret("SMTP_PORT"),
      smtpUser: envSecret("SMTP_USER"),
      smtpPass: envSecret("SMTP_PASS"),
      emailFrom: envSecret("EMAIL_FROM"),
    },
  });
});
