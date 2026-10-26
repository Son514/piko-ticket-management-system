import "server-only";

import service from "../../../service.ts";

type SecretBox = { expose(): string };

type ComposerInput = {
  smtpHost?: SecretBox;
  smtpPort?: SecretBox;
  smtpUser?: SecretBox;
  smtpPass?: SecretBox;
  emailFrom?: SecretBox;
};

export type AppConfig = {
  appUrl?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  emailFrom?: string;
};

function readComposerInput(): ComposerInput | undefined {
  try {
    return service.input() as ComposerInput | undefined;
  } catch {
    // `next dev` runs outside a Composer runtime, so there is no input stash.
    return undefined;
  }
}

function exposeSecret(secret: SecretBox | undefined): string | undefined {
  if (!secret) return undefined;
  try {
    return secret.expose();
  } catch {
    // The platform variable was not provisioned.
    return undefined;
  }
}

let cachedConfig: AppConfig | undefined;

/**
 * Configuration comes from Composer's service input when the app runs under
 * `prisma dev`/`prisma deploy`, and from `.env` when it runs under plain
 * `next dev`.
 *
 * The reset-link origin is intentionally not taken from the Prisma input:
 * previews should derive their own origin from the request so links do not
 * point at production. `APP_URL` can still override it for local runs.
 */
export function getAppConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const input = readComposerInput();

  cachedConfig = {
    appUrl: process.env.APP_URL,
    smtpHost: exposeSecret(input?.smtpHost) ?? process.env.SMTP_HOST,
    smtpPort: exposeSecret(input?.smtpPort) ?? process.env.SMTP_PORT,
    smtpUser: exposeSecret(input?.smtpUser) ?? process.env.SMTP_USER,
    smtpPass: exposeSecret(input?.smtpPass) ?? process.env.SMTP_PASS,
    emailFrom: exposeSecret(input?.emailFrom) ?? process.env.EMAIL_FROM,
  };

  return cachedConfig;
}
