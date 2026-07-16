"use client";

import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const selectClass =
  "rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors";

type PaginationProps = {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  id?: string;
};

export function TablePagination({
  page,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  id = "rows-per-page",
}: PaginationProps) {
  const safeTotal = Math.max(totalItems, 0);
  const start = safeTotal === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, safeTotal);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30 mt-2 px-2">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <label htmlFor={id}>Rows per page</label>
        <select
          id={id}
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className={selectClass}
        >
          {[5, 10, 25, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="hidden sm:inline">
          Showing {start}–{end} of {safeTotal}
        </span>
      </div>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-outline-variant p-2 disabled:opacity-40 hover:bg-surface-elevated"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold px-2" aria-current="page">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-outline-variant p-2 disabled:opacity-40 hover:bg-surface-elevated"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

type SortableThProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export function SortableTh({ label, onClick, className }: SortableThProps) {
  return (
    <th className={cn("p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap", className)}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        aria-label={`Sort by ${label}`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}

export function compareValues(a: unknown, b: unknown, dir: "asc" | "desc") {
  const av = a ?? "";
  const bv = b ?? "";
  const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
  return dir === "asc" ? cmp : -cmp;
}
