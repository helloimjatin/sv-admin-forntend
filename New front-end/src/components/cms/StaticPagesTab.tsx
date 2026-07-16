"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, TableCard } from "@/components/ui/Primitives";
import { SortableTh, TablePagination, compareValues } from "@/components/ui/TableControls";
import { useApp } from "@/context/AppContext";

type StaticPageRow = { title: string; url: string; status: string };
type SortKey = "title" | "url" | "status";

const TABLE_HEADERS: { key: SortKey | "actions"; label: string; sortable?: boolean }[] = [
  { key: "title", label: "Page Title", sortable: true },
  { key: "url", label: "Website URL", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions" },
];

export function StaticPagesTab() {
  const { addToast, refreshKey } = useApp();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const staticPagesList = useMemo<StaticPageRow[]>(
    () => [
      { title: "Privacy Policy", url: "https://sehatvaani.com/privacy", status: "Active" },
      { title: "Terms & Conditions", url: "https://sehatvaani.com/terms", status: "Active" },
      { title: "About Us", url: "https://sehatvaani.com/about", status: "Active" },
      { title: "Contact Us", url: "https://sehatvaani.com/contact", status: "Active" },
      { title: "FAQ", url: "https://sehatvaani.com/faq", status: "Inactive" },
      { title: "Delete Account", url: "https://sehatvaani.com/delete-account", status: "Active" },
      { title: "Refund Policy", url: "https://sehatvaani.com/refunds", status: "Inactive" },
    ],
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [refreshKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const list = staticPagesList.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
    return [...list].sort((a, b) => compareValues(a[sortKey], b[sortKey], sortDir));
  }, [query, staticPagesList, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
            placeholder="Search by Title..."
            aria-label="Search pages"
            className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => { setQuery(search); setPage(1); }}
            className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      <TableCard title="Static Pages">
        {loading ? (
          <div className="space-y-3 p-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="font-semibold">No matching pages</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm" role="table">
                <thead>
                  <tr className="bg-surface-low border-y border-outline-variant/50">
                    {TABLE_HEADERS.map((h) =>
                      h.sortable ? (
                        <SortableTh key={h.key} label={h.label} onClick={() => toggleSort(h.key as SortKey)} />
                      ) : (
                        <th key={h.key} className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                          {h.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.url} className="border-b border-outline-variant/30 hover:bg-surface-low h-14">
                      <td className="p-4 font-medium">{p.title}</td>
                      <td className="p-4 font-mono text-xs text-primary">{p.url}</td>
                      <td className="p-4">
                        <Badge variant={p.status === "Active" ? "success" : "default"}>{p.status}</Badge>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => addToast(`Editing ${p.title} configuration...`, "info")}
                          className="rounded border border-outline-variant px-3 py-1.5 text-xs font-semibold hover:bg-surface-elevated"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              id="static-pages-rows-per-page"
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={filtered.length}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
            />
          </>
        )}
      </TableCard>
    </div>
  );
}
