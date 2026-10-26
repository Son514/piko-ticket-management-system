import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  urgent: "bg-destructive/10 text-destructive",
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  waiting: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  resolved: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  closed: "bg-muted text-muted-foreground",
};

export function TicketBadges({
  category,
  priority,
  status,
}: {
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {TICKET_CATEGORY_LABELS[category]}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
      >
        {TICKET_PRIORITY_LABELS[priority]}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
      >
        {TICKET_STATUS_LABELS[status]}
      </span>
    </div>
  );
}
