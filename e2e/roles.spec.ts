import { expect, test } from "@playwright/test";

import {
  createTicket,
  login,
  signup,
  unique,
} from "./helpers";

test.describe("roles and assignment", () => {
  test("admin updates a role and the dropdown keeps the new value", async ({
    browser,
    page,
  }) => {
    const email = `${unique("e2e-role")}@example.com`;
    const password = "e2e-password-123";

    const signupContext = await browser.newContext();
    const signupPage = await signupContext.newPage();
    await signup(signupPage, {
      email,
      password,
      name: "E2E Role Target",
    });
    await signupContext.close();

    await login(page, "admin");
    await page.goto("/admin/users");

    const row = page.locator("li").filter({ hasText: email });
    await row.locator('select[name="role"]').selectOption("agent");
    await row.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(`Role updated for ${email}.`)).toBeVisible();
    await expect(
      page.locator("li").filter({ hasText: email }).locator('select[name="role"]'),
    ).toHaveValue("agent");

    const agentRow = page.locator("li").filter({ hasText: email });
    await agentRow.getByRole("button", { name: "Deactivate" }).click();
    await expect(
      page.getByText(`${email} has been deactivated.`),
    ).toBeVisible();
    await expect(
      page.locator("li").filter({ hasText: email }).getByRole("button", {
        name: "Reactivate",
      }),
    ).toBeVisible();

    await page
      .locator("li")
      .filter({ hasText: email })
      .getByRole("button", { name: "Reactivate" })
      .click();
    await expect(page.getByText(`${email} has been activated.`)).toBeVisible();
  });

  test("admin assigns a ticket to an agent", async ({ browser, page }) => {
    const title = unique("E2E admin assign");

    const customerContext = await browser.newContext();
    const customer = await customerContext.newPage();
    await login(customer, "customer");
    await createTicket(customer, {
      title,
      description: "Admin assignment verification.",
    });
    await customerContext.close();

    await login(page, "admin");
    await page.goto(`/tickets?q=${encodeURIComponent(title)}`);
    await page.getByRole("link", { name: title }).click();
    await expect(page).toHaveURL(/\/tickets\/\d+$/);

    const options = await page
      .getByLabel("Assign to agent")
      .locator("option")
      .allTextContents();
    expect(options).toContain("Bob");
    expect(options).not.toContain("Alice");

    await page.getByLabel("Assign to agent").selectOption({ label: "Bob" });
    await page.getByRole("button", { name: "Update assignment" }).click();
    await expect(page.getByText("Ticket assigned.")).toBeVisible();
    await expect(page.getByText("Bob").first()).toBeVisible();
  });

  test("agent self-assigns an unassigned ticket", async ({ browser, page }) => {
    const title = unique("E2E agent assign");

    const customerContext = await browser.newContext();
    const customer = await customerContext.newPage();
    await login(customer, "customer");
    await createTicket(customer, {
      title,
      description: "Agent self-assignment verification.",
    });
    await customerContext.close();

    await login(page, "agent");
    await page.goto(`/tickets?q=${encodeURIComponent(title)}`);
    await page.getByRole("link", { name: title }).click();
    await expect(page).toHaveURL(/\/tickets\/\d+$/);

    await expect(page.getByLabel("Assign to agent")).toHaveCount(0);
    await page.getByRole("button", { name: "Assign to me" }).click();
    await expect(
      page.getByRole("button", { name: "Assign to me" }),
    ).toHaveCount(0);
    await expect(page.getByText("Bob").first()).toBeVisible();
  });
});
