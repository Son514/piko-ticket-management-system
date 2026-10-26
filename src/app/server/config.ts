import "server-only";

import service from "../../../service.ts";

type ComposerInput = {
  appUrl?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: { expose(): string };
  emailFrom?: string;
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

function exposeSecret(secret: ComposerInput["smtpPass"]): string | undefined {
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
 */
export function getAppConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const input = readComposerInput();

  cachedConfig = {
    appUrl: input?.appUrl ?? process.env.APP_URL,
    smtpHost: input?.smtpHost ?? process.env.SMTP_HOST,
    smtpPort: input?.smtpPort ?? process.env.SMTP_PORT,
    smtpUser: input?.smtpUser ?? process.env.SMTP_USER,
    smtpPass: exposeSecret(input?.smtpPass) ?? process.env.SMTP_PASS,
    emailFrom: input?.emailFrom ?? process.env.EMAIL_FROM,
  };

  return cachedConfig;
}
