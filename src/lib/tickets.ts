export const TICKET_CATEGORIES = [
  "general",
  "account",
  "billing",
  "technical",
  "feature",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  general: "General",
  account: "Account",
  billing: "Billing",
  technical: "Technical",
  feature: "Feature request",
};

export const TICKET_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_SORTS = [
  "newest",
  "oldest",
  "priority_high",
  "priority_low",
] as const;

export type TicketSort = (typeof TICKET_SORTS)[number];

export const TICKET_SORT_LABELS: Record<TicketSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  priority_high: "Priority: high to low",
  priority_low: "Priority: low to high",
};

export const TICKETS_PAGE_SIZE = 10;

export const PRIORITY_RANK: Record<TicketPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export type SortableTicket = {
  priority: TicketPriority;
  createdAt: string;
};

export function sortTickets<T extends SortableTicket>(
  tickets: readonly T[],
  sort: TicketSort,
): T[] {
  return [...tickets].sort((left, right) => {
    if (sort === "newest") {
      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    }
    if (sort === "oldest") {
      return Date.parse(left.createdAt) - Date.parse(right.createdAt);
    }

    const rank = PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority];
    if (rank !== 0) return sort === "priority_high" ? rank : -rank;

    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
}

export function getPageCount(
  total: number,
  pageSize: number = TICKETS_PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export function normalizePage(page: number, pageCount: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.trunc(page)), Math.max(1, pageCount));
}

export type PageItem = number | "ellipsis";

export function getPageRange(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount]);
  for (let offset = -1; offset <= 1; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= pageCount) pages.add(candidate);
  }

  const sorted = [...pages].sort((left, right) => left - right);
  const result: PageItem[] = [];

  for (const current of sorted) {
    const previous = result.at(-1);
    if (
      typeof previous === "number" &&
      current - previous > 1
    ) {
      result.push("ellipsis");
    }
    result.push(current);
  }

  return result;
}

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
] as const;

export const ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/png,image/jpeg,image/webp,text/plain";

export type AttachmentLike = {
  name: string;
  type: string;
  size: number;
};

/**
 * Multipart parsing can append parameters such as `;charset=utf-8` to the
 * content type. Compare and store the base media type only.
 */
export function normalizeAttachmentType(type: string): string {
  return type.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function validateAttachmentFile(
  file: AttachmentLike,
): string | undefined {
  if (file.size <= 0) return undefined;

  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Attachment must be 5 MB or smaller.";
  }

  const type = normalizeAttachmentType(file.type);
  if (
    !ALLOWED_ATTACHMENT_TYPES.includes(
      type as (typeof ALLOWED_ATTACHMENT_TYPES)[number],
    )
  ) {
    return "Attachment must be a PDF, PNG, JPG, WEBP, or TXT file.";
  }

  if (file.name.length > 255) {
    return "Attachment filename is too long.";
  }

  return undefined;
}
