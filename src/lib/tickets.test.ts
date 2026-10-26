import { describe, expect, it } from "vitest";

import {
  MAX_ATTACHMENT_BYTES,
  normalizeAttachmentType,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  validateAttachmentFile,
} from "@/lib/tickets";

describe("ticket options", () => {
  it("has labels for every category and priority", () => {
    for (const category of TICKET_CATEGORIES) {
      expect(TICKET_CATEGORY_LABELS[category]).toBeTruthy();
    }
    for (const priority of TICKET_PRIORITIES) {
      expect(TICKET_PRIORITY_LABELS[priority]).toBeTruthy();
    }
  });
});

describe("validateAttachmentFile", () => {
  const valid = {
    name: "screenshot.png",
    type: "image/png",
    size: 1024,
  };

  it("accepts allowed files", () => {
    expect(validateAttachmentFile(valid)).toBeUndefined();
    expect(
      validateAttachmentFile({
        name: "notes.txt",
        type: "text/plain",
        size: 128,
      }),
    ).toBeUndefined();
  });

  it("accepts multipart content types with parameters", () => {
    expect(
      validateAttachmentFile({
        name: "notes.txt",
        type: "text/plain;charset=utf-8",
        size: 128,
      }),
    ).toBeUndefined();
  });

  it("normalizes content types", () => {
    expect(normalizeAttachmentType("Text/Plain; charset=utf-8")).toBe(
      "text/plain",
    );
  });

  it("treats an empty file as no attachment", () => {
    expect(
      validateAttachmentFile({ name: "", type: "", size: 0 }),
    ).toBeUndefined();
  });

  it("rejects files over 5 MB", () => {
    expect(
      validateAttachmentFile({
        ...valid,
        size: MAX_ATTACHMENT_BYTES + 1,
      }),
    ).toBe("Attachment must be 5 MB or smaller.");
  });

  it("rejects unsupported types", () => {
    expect(
      validateAttachmentFile({
        name: "page.html",
        type: "text/html",
        size: 512,
      }),
    ).toBe("Attachment must be a PDF, PNG, JPG, WEBP, or TXT file.");
  });

  it("rejects overly long filenames", () => {
    expect(
      validateAttachmentFile({
        ...valid,
        name: `${"a".repeat(256)}.png`,
      }),
    ).toBe("Attachment filename is too long.");
  });
});
