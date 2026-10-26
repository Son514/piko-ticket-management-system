import { describe, expect, it } from "vitest";

import {
  buildTicketsQuery,
  parsePage,
  parseTicketFilters,
} from "@/lib/validation/ticket-filters";

describe("parseTicketFilters", () => {
  it("uses defaults for an empty query", () => {
    expect(parseTicketFilters({})).toEqual({ sort: "newest" });
  });

  it("trims and limits the search query", () => {
    const filters = parseTicketFilters({ q: `  ${"a".repeat(120)}  ` });

    expect(filters.q).toHaveLength(100);
  });

  it("accepts valid status and priority values", () => {
    const filters = parseTicketFilters({
      status: "in_progress",
      priority: "urgent",
    });

    expect(filters.status).toBe("in_progress");
    expect(filters.priority).toBe("urgent");
  });

  it("ignores invalid enum values", () => {
    const filters = parseTicketFilters({
      status: "archived",
      priority: "critical",
    });

    expect(filters.status).toBeUndefined();
    expect(filters.priority).toBeUndefined();
  });

  it("parses unassigned and numeric assignees", () => {
    expect(parseTicketFilters({ assignee: "unassigned" }).assignee).toBe(
      "unassigned",
    );
    expect(parseTicketFilters({ assignee: "42" }).assignee).toBe(42);
    expect(parseTicketFilters({ assignee: "abc" }).assignee).toBeUndefined();
    expect(parseTicketFilters({ assignee: "0" }).assignee).toBeUndefined();
  });

  it("falls back to newest for an invalid sort", () => {
    expect(parseTicketFilters({ sort: "priority" }).sort).toBe("newest");
    expect(parseTicketFilters({ sort: "oldest" }).sort).toBe("oldest");
  });
});

describe("parsePage", () => {
  it("parses positive integers", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });
});

describe("buildTicketsQuery", () => {
  it("returns the bare list URL for defaults", () => {
    expect(buildTicketsQuery({ sort: "newest" })).toBe("/tickets");
    expect(buildTicketsQuery({ sort: "newest" }, 1)).toBe("/tickets");
  });

  it("preserves filters and pages", () => {
    const query = buildTicketsQuery(
      {
        q: "printer",
        status: "open",
        priority: "high",
        assignee: 12,
        sort: "priority_high",
      },
      2,
    );
    const url = new URL(query, "http://localhost");

    expect(url.pathname).toBe("/tickets");
    expect(url.searchParams.get("q")).toBe("printer");
    expect(url.searchParams.get("status")).toBe("open");
    expect(url.searchParams.get("priority")).toBe("high");
    expect(url.searchParams.get("assignee")).toBe("12");
    expect(url.searchParams.get("sort")).toBe("priority_high");
    expect(url.searchParams.get("page")).toBe("2");
  });
});
