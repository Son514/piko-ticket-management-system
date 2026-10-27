import { expect, type Page } from "@playwright/test";

export const USERS = {
  admin: { email: "alice@prisma.io", password: "password123" },
  agent: { email: "bob@prisma.io", password: "password123" },
  customer: { email: "carol@prisma.io", password: "password123" },
} as const;

export type UserRole = keyof typeof USERS;

export function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function login(page: Page, role: UserRole): Promise<void> {
  const user = USERS[role];
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

export async function signup(
  page: Page,
  {
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  },
): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
}

export async function createTicket(
  page: Page,
  {
    title,
    description,
    category = "general",
    priority = "medium",
    attachment,
  }: {
    title: string;
    description: string;
    category?: string;
    priority?: string;
    attachment?: {
      name: string;
      mimeType: string;
      buffer: Buffer;
    };
  },
): Promise<void> {
  await page.goto("/tickets/new");
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Description", { exact: true }).fill(description);
  await page.getByLabel("Category", { exact: true }).selectOption(category);
  await page.getByLabel("Priority", { exact: true }).selectOption(priority);

  if (attachment) {
    await page.locator("#attachment").setInputFiles(attachment);
  }

  await page.getByRole("button", { name: "Create ticket" }).click();
  await expect(page).toHaveURL(/\/tickets$/, { timeout: 15_000 });
}

export function ticketRows(page: Page) {
  return page.locator("main ul.divide-y > li");
}

export function commentItem(page: Page, text: string) {
  return page.locator("li").filter({ hasText: text }).first();
}
