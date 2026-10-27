import { expect, test } from "@playwright/test";

import { login, logout } from "./helpers";

test.describe("authentication", () => {
  test("redirects unauthenticated users from protected routes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  });

  test("customer can sign in and sign out", async ({ page }) => {
    await login(page, "customer");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "My tickets" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Users" }),
    ).toHaveCount(0);
    await logout(page);
  });

  test("admin sees the Users navigation", async ({ page }) => {
    await login(page, "admin");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Users" }),
    ).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("carol@prisma.io");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });
});
