import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPageRange } from "@/lib/tickets";
import {
  buildTicketsQuery,
  type TicketFilters,
} from "@/lib/validation/ticket-filters";

export function TicketPagination({
  filters,
  page,
  pageCount,
  total,
}: {
  filters: TicketFilters;
  page: number;
  pageCount: number;
  total: number;
}) {
  if (total === 0) return null;

  const disabledClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "pointer-events-none opacity-50",
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total} ticket{total === 1 ? "" : "s"} · page {page} of {pageCount}
      </p>

      {pageCount > 1 ? (
        <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={buildTicketsQuery(filters, page - 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Previous
            </Link>
          ) : (
            <span className={disabledClass}>Previous</span>
          )}

          {getPageRange(page, pageCount).map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : item === page ? (
              <span
                key={item}
                aria-current="page"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={buildTicketsQuery(filters, item)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {item}
              </Link>
            ),
          )}

          {page < pageCount ? (
            <Link
              href={buildTicketsQuery(filters, page + 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Next
            </Link>
          ) : (
            <span className={disabledClass}>Next</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
