import { describe, expect, it } from "vitest";

import {
  getPageCount,
  getPageRange,
  MAX_ATTACHMENT_BYTES,
  normalizeAttachmentType,
  normalizePage,
  sortTickets,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
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
    for (const status of TICKET_STATUSES) {
      expect(TICKET_STATUS_LABELS[status]).toBeTruthy();
    }
  });
});

describe("ticket sorting", () => {
  const tickets = [
    { id: 1, priority: "low" as const, createdAt: "2026-01-01T00:00:00Z" },
    { id: 2, priority: "urgent" as const, createdAt: "2026-01-02T00:00:00Z" },
    { id: 3, priority: "high" as const, createdAt: "2026-01-03T00:00:00Z" },
    { id: 4, priority: "medium" as const, createdAt: "2026-01-04T00:00:00Z" },
  ];

  it("sorts by newest and oldest", () => {
    expect(sortTickets(tickets, "newest").map((ticket) => ticket.id)).toEqual([
      4, 3, 2, 1,
    ]);
    expect(sortTickets(tickets, "oldest").map((ticket) => ticket.id)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("sorts by priority direction", () => {
    expect(
      sortTickets(tickets, "priority_high").map((ticket) => ticket.id),
    ).toEqual([2, 3, 4, 1]);
    expect(
      sortTickets(tickets, "priority_low").map((ticket) => ticket.id),
    ).toEqual([1, 4, 3, 2]);
  });
});

describe("pagination helpers", () => {
  it("calculates page counts", () => {
    expect(getPageCount(0)).toBe(1);
    expect(getPageCount(10)).toBe(1);
    expect(getPageCount(11)).toBe(2);
    expect(getPageCount(21)).toBe(3);
  });

  it("normalizes invalid and out-of-range pages", () => {
    expect(normalizePage(0, 5)).toBe(1);
    expect(normalizePage(3, 5)).toBe(3);
    expect(normalizePage(99, 5)).toBe(5);
    expect(normalizePage(Number.NaN, 5)).toBe(1);
  });

  it("builds compact page ranges", () => {
    expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageRange(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
    expect(getPageRange(10, 10)).toEqual([
      1,
      "ellipsis",
      9,
      10,
    ]);
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
