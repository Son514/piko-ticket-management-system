import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { getAppConfig } from "./config";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  pass: string | undefined;
  from: string;
};

function readSmtpConfig(): SmtpConfig {
  const config = getAppConfig();
  const host = config.smtpHost?.trim() || "smtp.gmail.com";
  const port = Number(config.smtpPort ?? 465);
  const user = config.smtpUser?.trim() || undefined;
  const pass = config.smtpPass?.replace(/\s+/g, "") || undefined;

  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    secure: port === 465,
    user,
    pass,
    from: config.emailFrom?.trim() || user || "no-reply@localhost",
  };
}

let transporter: Transporter | undefined;

function getTransporter(config: SmtpConfig): Transporter {
  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? {
            user: config.user,
            pass: config.pass,
          }
        : undefined,
  });

  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name?: string | null;
  resetUrl: string;
}): Promise<void> {
  const config = readSmtpConfig();

  if (!config.user || !config.pass) {
    // `prisma dev` runs a production build over HTTP, so NODE_ENV is not a
    // reliable "is this a real deployment?" signal. Only log the link when
    // the app is clearly running locally.
    const origin = (getAppConfig().appUrl ?? process.env.COMPOSER_APP_ORIGIN ?? "")
      .replace(/^"|"$/g, "");
    const isLocal =
      process.env.NODE_ENV === "development" ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1");

    if (!isLocal) {
      throw new Error("[auth] SMTP is not configured");
    }

    console.warn(
      `[auth] SMTP is not configured. Password reset link for ${to}: ${resetUrl}`,
    );
    return;
  }

  const displayName = name?.trim() || "there";
  const safeName = escapeHtml(displayName);
  const safeUrl = escapeHtml(resetUrl);

  const text = [
    `Hi ${displayName},`,
    "",
    "We received a request to reset your Piko password.",
    "Open the link below to choose a new password. The link expires in 1 hour.",
    "",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #18181b;">
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your Piko password.</p>
      <p>
        <a href="${safeUrl}" style="display: inline-block; border-radius: 6px; background: #18181b; color: #ffffff; padding: 10px 16px; text-decoration: none;">
          Reset your password
        </a>
      </p>
      <p>The link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      <p style="color: #71717a; font-size: 13px;">If the button does not work, copy this link into your browser:<br />${safeUrl}</p>
    </div>
  `.trim();

  await getTransporter(config).sendMail({
    from: config.from,
    to,
    subject: "Reset your Piko password",
    text,
    html,
  });
}
