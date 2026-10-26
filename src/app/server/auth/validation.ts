export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function validateEmail(email: string): string | undefined {
  if (!email) return "Enter your email address.";
  if (email.length > 254) return "Email is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) return "Password must be at least 8 characters long.";
  if (password.length > 128) return "Password must be at most 128 characters long.";
  return undefined;
}

export function validateName(name: string): string | undefined {
  if (name.length > 80) return "Name must be at most 80 characters long.";
  return undefined;
}

export function validateUsername(username: string): string | undefined {
  if (!username) return undefined;
  if (username.length < 3) return "Username must be at least 3 characters long.";
  if (username.length > 32) return "Username must be at most 32 characters long.";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }
  return undefined;
}
