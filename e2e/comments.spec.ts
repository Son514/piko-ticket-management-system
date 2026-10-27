import { expect, test } from "@playwright/test";

import {
  commentItem,
  createTicket,
  login,
  unique,
} from "./helpers";

test.describe("comments and internal notes", () => {
  test("public replies, internal notes, editing, and deleting", async ({
    browser,
  }) => {
    const title = unique("E2E comments");
    const suffix = unique("text");
    const customerReply = `Customer public reply ${suffix}`;
    const customerEdited = `Customer public reply edited ${suffix}`;
    const agentReply = `Agent public reply ${suffix}`;
    const agentEdited = `Agent public reply edited ${suffix}`;
    const internalNote = `Agent internal note ${suffix}`;

    const customerContext = await browser.newContext();
    const customer = await customerContext.newPage();
    await login(customer, "customer");
    await createTicket(customer, {
      title,
      description: "Comment thread verification.",
    });
    await customer.goto(`/tickets?q=${encodeURIComponent(title)}`);
    await customer.getByRole("link", { name: title }).click();
    await expect(customer).toHaveURL(/\/tickets\/\d+$/);
    const ticketUrl = customer.url();

    await expect(customer.getByLabel("Visibility")).toHaveCount(0);
    await customer.locator("#comment-body").fill(customerReply);
    await customer.getByRole("button", { name: "Add reply" }).click();
    await expect(customer.getByText(customerReply)).toBeVisible();

    const agentContext = await browser.newContext();
    const agent = await agentContext.newPage();
    await login(agent, "agent");
    await agent.goto(ticketUrl);
    await expect(agent.getByText(customerReply)).toBeVisible();
    await expect(
      commentItem(agent, customerReply).getByRole("button", { name: "Edit" }),
    ).toHaveCount(0);

    await agent.getByLabel("Visibility").selectOption("internal");
    await agent.locator("#comment-body").fill(internalNote);
    await agent.getByRole("button", { name: "Add internal note" }).click();
    await expect(agent.getByText(internalNote)).toBeVisible();

    await agent.getByLabel("Visibility").selectOption("public");
    await agent.locator("#comment-body").fill(agentReply);
    await agent.getByRole("button", { name: "Add reply" }).click();
    await expect(agent.getByText(agentReply)).toBeVisible();

    const ownAgentComment = commentItem(agent, agentReply);
    await ownAgentComment.getByRole("button", { name: "Edit" }).click();
    const agentEditForm = agent
      .locator("li")
      .filter({ has: agent.locator("textarea") });
    await agentEditForm.locator("textarea").fill(agentEdited);
    await agentEditForm.getByRole("button", { name: "Save" }).click();
    await expect(agent.getByText(agentEdited)).toBeVisible();
    await expect(agent.getByText("· edited").first()).toBeVisible();

    const adminContext = await browser.newContext();
    const admin = await adminContext.newPage();
    await login(admin, "admin");
    await admin.goto(ticketUrl);
    for (const text of [customerReply, agentEdited, internalNote]) {
      await expect(admin.getByText(text)).toBeVisible();
    }

    await customer.reload();
    await expect(customer.getByText(customerReply)).toBeVisible();
    await expect(customer.getByText(agentEdited)).toBeVisible();
    expect(await customer.getByText(internalNote).count()).toBe(0);
    await expect(
      commentItem(customer, agentEdited).getByRole("button", { name: "Edit" }),
    ).toHaveCount(0);

    const ownCustomerComment = commentItem(customer, customerReply);
    await ownCustomerComment.getByRole("button", { name: "Edit" }).click();
    const customerEditForm = customer
      .locator("li")
      .filter({ has: customer.locator("textarea") });
    await customerEditForm.locator("textarea").fill(customerEdited);
    await customerEditForm.getByRole("button", { name: "Save" }).click();
    await expect(customer.getByText(customerEdited)).toBeVisible();

    customer.once("dialog", (dialog) => dialog.accept());
    await commentItem(customer, customerEdited)
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(customer.getByText(customerEdited)).toHaveCount(0);

    agent.once("dialog", (dialog) => dialog.accept());
    await commentItem(agent, agentEdited)
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(agent.getByText(agentEdited)).toHaveCount(0);

    await customerContext.close();
    await agentContext.close();
    await adminContext.close();
  });
});
