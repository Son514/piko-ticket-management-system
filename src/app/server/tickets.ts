import "server-only";

import { and, or } from "@prisma/orm-postgres/orm-client";

import type { Role } from "@/lib/roles";
import { isStaff } from "@/lib/roles";
import {
  getPageCount,
  normalizePage,
  sortTickets,
  TICKETS_PAGE_SIZE,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";
import type { TicketFilters } from "@/lib/validation/ticket-filters";
import { connectDatabase, db } from "@/prisma/db";
import { requireUser } from "./auth/session";

export type TicketAttachment = {
  id: number;
  filename: string;
  contentType: string;
  size: number;
};

export type TicketSummary = {
  id: number;
  title: string;
  content: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  author: {
    id: number;
    name: string | null;
    email: string;
  };
  assignee: {
    id: number;
    name: string | null;
    email: string;
  } | null;
};

export type TicketListResult = {
  tickets: TicketSummary[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type StaffOption = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
};

type TicketRow = {
  id: number;
  title: string;
  content: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  author: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  assignee: {
    id: number;
    name: string | null;
    email: string;
  } | null;
};

function toSummary(ticket: TicketRow): TicketSummary {
  if (!ticket.author) {
    throw new Error(`Ticket ${ticket.id} has no author`);
  }

  return {
    id: ticket.id,
    title: ticket.title,
    content: ticket.content,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    attachments: ticket.attachments,
    author: {
      id: ticket.author.id,
      name: ticket.author.name,
      email: ticket.author.email,
    },
    assignee: ticket.assignee
      ? {
          id: ticket.assignee.id,
          name: ticket.assignee.name,
          email: ticket.assignee.email,
        }
      : null,
  };
}

export async function listTickets(
  filters: TicketFilters,
  requestedPage = 1,
): Promise<TicketListResult> {
  const { user } = await requireUser();

  await connectDatabase();

  let filtered = db.orm.public.Post.where((post) => post.id.gt(0));

  if (!isStaff(user.role)) {
    filtered = filtered.where({ authorId: user.id });
  }

  if (filters.status) {
    filtered = filtered.where({ status: filters.status });
  }

  if (filters.priority) {
    filtered = filtered.where({ priority: filters.priority });
  }

  if (filters.assignee === "unassigned") {
    filtered = filtered.where((post) => post.assigneeId.isNull());
  } else if (typeof filters.assignee === "number") {
    filtered = filtered.where({ assigneeId: filters.assignee });
  }

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    filtered = filtered.where((post) =>
      or(post.title.ilike(pattern), post.content.ilike(pattern)),
    );
  }

  const { count } = await filtered.aggregate((aggregate) => ({
    count: aggregate.count(),
  }));

  const pageCount = getPageCount(count, TICKETS_PAGE_SIZE);
  const page = normalizePage(requestedPage, pageCount);
  const offset = (page - 1) * TICKETS_PAGE_SIZE;

  const selected = filtered
    .select(
      "id",
      "title",
      "content",
      "category",
      "priority",
      "status",
      "createdAt",
      "updatedAt",
    )
    .include("author", (author) => author.select("id", "name", "email"))
    .include("assignee", (assignee) => assignee.select("id", "name", "email"))
    .include("attachments", (attachment) =>
      attachment.select("id", "filename", "contentType", "size"),
    );

  let rows: TicketRow[];

  if (filters.sort === "priority_high" || filters.sort === "priority_low") {
    const allRows = await selected.all();
    rows = sortTickets(allRows, filters.sort).slice(
      offset,
      offset + TICKETS_PAGE_SIZE,
    );
  } else {
    rows = await selected
      .orderBy((post) =>
        filters.sort === "oldest"
          ? post.createdAt.asc()
          : post.createdAt.desc(),
      )
      .limit(TICKETS_PAGE_SIZE)
      .offset(offset)
      .all();
  }

  return {
    tickets: rows.map(toSummary),
    total: count,
    page,
    pageSize: TICKETS_PAGE_SIZE,
    pageCount,
  };
}

export async function getTicketById(
  id: number,
): Promise<TicketSummary | null> {
  const { user } = await requireUser();

  await connectDatabase();

  const ticket = await db.orm.public.Post
    .select(
      "id",
      "title",
      "content",
      "category",
      "priority",
      "status",
      "createdAt",
      "updatedAt",
    )
    .include("author", (author) => author.select("id", "name", "email"))
    .include("assignee", (assignee) => assignee.select("id", "name", "email"))
    .include("attachments", (attachment) =>
      attachment.select("id", "filename", "contentType", "size"),
    )
    .where({ id })
    .first();

  if (!ticket || !ticket.author) return null;

  if (!isStaff(user.role) && ticket.author.id !== user.id) {
    return null;
  }

  return toSummary(ticket);
}

export async function listAssignableStaff(): Promise<StaffOption[]> {
  const { user } = await requireUser();
  if (!isStaff(user.role)) return [];

  await connectDatabase();

  return db.orm.public.User
    .select("id", "name", "email", "role")
    .where((staff) =>
      and(
        staff.isActive.eq(true),
        or(staff.role.eq("agent"), staff.role.eq("admin")),
      ),
    )
    .orderBy((staff) => staff.email.asc())
    .all();
}
