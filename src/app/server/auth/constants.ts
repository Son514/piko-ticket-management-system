export const SESSION_COOKIE = "piko_session";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
export const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};

/**
 * Only allow same-origin, absolute-path redirects. This keeps the `next`
 * query parameter from turning into an open redirect.
 */
export function safeNextPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/")) return undefined;
  // `//host` and `/\host` are both treated as scheme-relative by browsers.
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  if (/[\u0000-\u001f]/.test(value)) return undefined;
  return value;
}
