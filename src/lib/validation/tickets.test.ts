import { describe, expect, it } from "vitest";

import {
  createTicketSchema,
  ticketFieldsSchema,
  validateAttachmentInput,
} from "@/lib/validation/tickets";

const validTicket = {
  title: "Cannot sign in",
  description: "I keep getting an invalid password error today.",
  category: "account",
  priority: "high",
};

describe("ticketFieldsSchema", () => {
  it("accepts a valid ticket and trims text", () => {
    const result = ticketFieldsSchema.safeParse({
      ...validTicket,
      title: "  Cannot sign in  ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Cannot sign in");
  });

  it("rejects an empty title", () => {
    const result = ticketFieldsSchema.safeParse({
      ...validTicket,
      title: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["title"]);
  });

  it("rejects a short description", () => {
    const result = ticketFieldsSchema.safeParse({
      ...validTicket,
      description: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["description"]);
  });

  it("rejects invalid category and priority values", () => {
    const category = ticketFieldsSchema.safeParse({
      ...validTicket,
      category: "other",
    });
    const priority = ticketFieldsSchema.safeParse({
      ...validTicket,
      priority: "critical",
    });

    expect(category.success).toBe(false);
    expect(priority.success).toBe(false);
  });
});

describe("createTicketSchema", () => {
  it("accepts an optional attachment", () => {
    expect(createTicketSchema.safeParse(validTicket).success).toBe(true);
  });
});

describe("validateAttachmentInput", () => {
  it("treats an empty input as valid", () => {
    expect(validateAttachmentInput(undefined)).toBe(true);
  });

  it("accepts an allowed file", () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    expect(validateAttachmentInput(file)).toBe(true);
  });

  it("returns a message for an unsupported file", () => {
    const file = new File(["<script>"], "page.html", { type: "text/html" });
    expect(validateAttachmentInput(file)).toBe(
      "Attachment must be a PDF, PNG, JPG, WEBP, or TXT file.",
    );
  });
});
