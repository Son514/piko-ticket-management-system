import { expect, test } from "@playwright/test";

import {
  createTicket,
  login,
  ticketRows,
  unique,
} from "./helpers";

test.describe("tickets", () => {
  test("customer creates a ticket with an attachment", async ({ page }) => {
    const title = unique("E2E attachment");
    const attachmentName = `${title}.txt`;

    await login(page, "customer");
    await createTicket(page, {
      title,
      description: "Playwright attachment verification.",
      category: "technical",
      priority: "high",
      attachment: {
        name: attachmentName,
        mimeType: "text/plain",
        buffer: Buffer.from("playwright attachment body"),
      },
    });

    await page.goto(`/tickets?q=${encodeURIComponent(title)}`);
    await page.getByRole("link", { name: title, exact: true }).click();
    await expect(page).toHaveURL(/\/tickets\/\d+$/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Technical")).toBeVisible();
    await expect(page.getByText("High")).toBeVisible();

    const link = page.getByRole("link", { name: attachmentName });
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();

    const response = await page.request.get(
      new URL(href!, page.url()).toString(),
    );
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("playwright attachment body");
  });

  test("search, filters, sorting, and pagination", async ({ page }) => {
    const prefix = unique("E2E page");
    const priorities = ["low", "medium", "high", "urgent"] as const;

    await login(page, "customer");

    for (let index = 1; index <= 11; index += 1) {
      await createTicket(page, {
        title: `${prefix} ${index}`,
        description: `Pagination and filter ticket ${index}.`,
        priority: priorities[(index - 1) % priorities.length],
      });
    }

    await page.goto(`/tickets?q=${encodeURIComponent(prefix)}`);
    await expect(ticketRows(page)).toHaveCount(10);
    await expect(page.getByText("Showing 10 on page 1 of 2.")).toBeVisible();

    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(ticketRows(page)).toHaveCount(1);

    await page.goto(`/tickets?q=${encodeURIComponent(prefix)}`);
    await page.getByLabel("Priority", { exact: true }).selectOption("high");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(ticketRows(page)).toHaveCount(3);

    await page.goto(`/tickets?q=${encodeURIComponent(prefix)}`);
    await page.getByLabel("Sort", { exact: true }).selectOption("priority_high");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(ticketRows(page).first()).toContainText("Urgent");

    await page.goto(
      `/tickets?q=${encodeURIComponent(prefix)}&page=2`,
    );
    await page
      .getByLabel("Search", { exact: true })
      .fill(`${prefix} 11`);
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).not.toHaveURL(/page=2/);
    await expect(ticketRows(page)).toHaveCount(1);
  });

  test("customer closes and reopens their own ticket", async ({ page }) => {
    const title = unique("E2E close");

    await login(page, "customer");
    await createTicket(page, {
      title,
      description: "Close and reopen flow verification.",
    });

    await page.goto(`/tickets?q=${encodeURIComponent(title)}`);
    await page.getByRole("link", { name: title }).click();
    await expect(page).toHaveURL(/\/tickets\/\d+$/);

    await page.getByRole("button", { name: "Close ticket" }).click();
    await expect(
      page.getByRole("button", { name: "Reopen ticket" }),
    ).toBeVisible();
    await page.getByText("Closed").first().waitFor();

    await page.getByRole("button", { name: "Reopen ticket" }).click();
    await expect(
      page.getByRole("button", { name: "Close ticket" }),
    ).toBeVisible();
    await page.getByText("Open").first().waitFor();
  });
});
