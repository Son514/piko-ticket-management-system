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

  // `envSecret` is always collected by the deploy preflight, even when the
  // schema field is optional. Include it only when the deploy shell actually
  // has the credential, so a deployment without SMTP configured still
  // succeeds; set the SMTP_PASS Actions secret to enable email delivery.
  const smtpPass = process.env.SMTP_PASS ? envSecret("SMTP_PASS") : undefined;

  provision(app, {
    deps: { database },
    input: {
      appUrl: envParam("APP_URL"),
      smtpHost: envParam("SMTP_HOST"),
      smtpPort: envParam("SMTP_PORT"),
      smtpUser: envParam("SMTP_USER"),
      ...(smtpPass ? { smtpPass } : {}),
      emailFrom: envParam("EMAIL_FROM"),
    },
  });
});
