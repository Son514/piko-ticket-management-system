import {
  TICKET_PRIORITIES,
  TICKET_SORTS,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketSort,
  type TicketStatus,
} from "@/lib/tickets";

export type TicketSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type TicketFilters = {
  q?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: number | "unassigned";
  sort: TicketSort;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseEnum<T extends string>(
  value: string | undefined,
  values: readonly T[],
): T | undefined {
  if (!value) return undefined;
  return values.includes(value as T) ? (value as T) : undefined;
}

export function parsePage(value: string | string[] | undefined): number {
  const raw = first(value);
  const page = raw === undefined ? 1 : Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function parseTicketFilters(
  params: TicketSearchParams,
): TicketFilters {
  const q = first(params.q)?.trim();

  const assigneeValue = first(params.assignee);
  const assignee =
    assigneeValue === "unassigned"
      ? "unassigned"
      : assigneeValue && /^\d+$/.test(assigneeValue)
        ? Number(assigneeValue)
        : undefined;

  return {
    q: q ? q.slice(0, 100) : undefined,
    status: parseEnum(first(params.status), TICKET_STATUSES),
    priority: parseEnum(first(params.priority), TICKET_PRIORITIES),
    assignee:
      assignee === "unassigned" ||
      (typeof assignee === "number" && Number.isInteger(assignee) && assignee > 0)
        ? assignee
        : undefined,
    sort: parseEnum(first(params.sort), TICKET_SORTS) ?? "newest",
  };
}

export function buildTicketsQuery(
  filters: TicketFilters,
  page?: number,
): string {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assignee !== undefined) {
    params.set("assignee", String(filters.assignee));
  }
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page !== undefined && page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/tickets?${query}` : "/tickets";
}
