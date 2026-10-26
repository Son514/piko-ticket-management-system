import { module } from "@prisma/composer";
import { envParam, envSecret } from "@prisma/composer-prisma-cloud";
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

  provision(app, {
    deps: { database },
    input: {
      appUrl: envParam("APP_URL"),
      smtpHost: envParam("SMTP_HOST"),
      smtpPort: envParam("SMTP_PORT"),
      smtpUser: envParam("SMTP_USER"),
      smtpPass: envSecret("SMTP_PASS"),
      emailFrom: envParam("EMAIL_FROM"),
    },
  });
});
