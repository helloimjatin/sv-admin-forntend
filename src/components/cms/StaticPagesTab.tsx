"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  staticPages,
  StaticPage,
  PageStatus,
  PAGE_STATUS_OPTIONS,
  PAGE_CATEGORIES,
  getSeoStatus,
  getPublicUrl,
  duplicateStaticPage,
  publishPage,
  unpublishPage,
  archivePage,
  softDeletePage,
} from "@/data/cmsData";
import { Badge, Modal, TableCard } from "@/components/ui/Primitives";
import { PagePreview } from "@/components/cms/PagePreview";
import { useApp } from "@/context/AppContext";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { ChevronLeft, ChevronRight, FileText, ArrowUpDown } from "lucide-react";

type SortKey = "created_at" | "updated_at" | "title";

function statusVariant(s: PageStatus): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  const m: Record<PageStatus, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
    draft: "default",
    published: "success",
    scheduled: "info",
    archived: "warning",
    disabled: "danger",
  };
  return m[s];
}

function seoVariant(s: ReturnType<typeof getSeoStatus>): "success" | "warning" | "danger" {
  return s === "complete" ? "success" : s === "partial" ? "warning" : "danger";
}

export function StaticPagesTab() {
  const { addToast, adminEmail, bumpRefresh, refreshKey } = useApp();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<StaticPage | null>(null);
  const [viewItem, setViewItem] = useState<StaticPage | null>(null);
  const [deleteItem, setDeleteItem] = useState<StaticPage | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [refreshKey]);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [openMenuId]);

  const filtered = useMemo(() => {
    let list = staticPages.filter((p) => !p.deleted_at);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.seo_keywords.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [query, statusFilter, categoryFilter, sortKey, sortDir, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const selectClass = "rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

  const copyUrl = (p: StaticPage) => {
    navigator.clipboard.writeText(getPublicUrl(p.slug, p.language));
    addToast("Public URL copied", "info");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setQuery(search), setPage(1))}
            placeholder="Search title, slug, keywords…"
            aria-label="Search pages"
            className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button type="button" onClick={() => { setQuery(search); setPage(1); }} className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase shrink-0">Search</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectClass} aria-label="Filter by status">
            {PAGE_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className={selectClass} aria-label="Filter by category">
            <option value="all">All Categories</option>
            {PAGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={selectClass} aria-label="Sort by">
            <option value="updated_at">Sort: Updated</option>
            <option value="created_at">Sort: Created</option>
            <option value="title">Sort: Title</option>
          </select>
          <button type="button" onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")} className={cn(selectClass, "flex items-center justify-center gap-1")}>
            <ArrowUpDown className="h-4 w-4" /> {sortDir === "asc" ? "Ascending" : "Descending"}
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
            <FileText className="h-12 w-12 text-text-muted opacity-50 mb-3" />
            <p className="font-semibold">{query ? "No matching pages" : "No static pages yet"}</p>
            <p className="text-sm text-text-muted mt-1">{query ? "Try different filters." : "Create your first CMS page."}</p>
            {!query && (
              <Link href="/cms/pages/create" className="mt-4 bg-primary text-white text-xs font-semibold uppercase px-5 py-2 rounded-lg">Create New Page</Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-low border-y border-outline-variant/50">
                    {["Title", "Slug", "Category", "Visibility", "Status", "SEO", "Updated", "Author", "Actions"].map((h) => (
                      <th key={h} className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-14">
                      <td className="p-4 font-medium min-w-[140px]">{p.title}</td>
                      <td className="p-4 font-mono text-xs text-primary">{p.slug}</td>
                      <td className="p-4 whitespace-nowrap">{p.category}</td>
                      <td className="p-4 capitalize text-xs">{p.visibility}</td>
                      <td className="p-4"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                      <td className="p-4"><Badge variant={seoVariant(getSeoStatus(p))}>{getSeoStatus(p)}</Badge></td>
                      <td className="p-4 text-text-muted whitespace-nowrap">{formatDate(p.updated_at)}</td>
                      <td className="p-4 whitespace-nowrap text-xs">{p.created_by}</td>
                      <td className="p-4">
                        <div className="relative">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }} className="rounded-lg border border-outline-variant px-2 py-1 text-xs font-semibold" aria-haspopup="menu" aria-expanded={openMenuId === p.id}>Actions ▾</button>
                          {openMenuId === p.id && (
                            <div className="absolute right-0 top-full mt-1 z-20 min-w-[170px] rounded-lg border border-outline-variant bg-surface-card shadow-xl py-1" role="menu" onClick={(e) => e.stopPropagation()}>
                              {[
                                { label: "View", action: () => setViewItem(p) },
                                { label: "Edit", href: `/cms/pages/create?edit=${p.id}` },
                                { label: "Preview", action: () => setPreviewItem(p) },
                                { label: "Duplicate", action: () => { duplicateStaticPage(p.id, adminEmail); addToast("Page duplicated"); bumpRefresh(); } },
                                { label: "Publish", action: () => { publishPage(p.id, adminEmail); addToast("Published"); bumpRefresh(); }, hide: p.status === "published" },
                                { label: "Unpublish", action: () => { unpublishPage(p.id, adminEmail); addToast("Unpublished", "info"); bumpRefresh(); }, hide: p.status !== "published" },
                                { label: "Archive", action: () => { archivePage(p.id, adminEmail); addToast("Archived", "info"); bumpRefresh(); } },
                                { label: "Copy Public URL", action: () => copyUrl(p) },
                                { label: "Delete", action: () => setDeleteItem(p), danger: true },
                              ].filter((a) => !a.hide).map((a) =>
                                "href" in a && a.href ? (
                                  <Link key={a.label} href={a.href} role="menuitem" onClick={() => setOpenMenuId(null)} className="block px-4 py-2 text-xs font-semibold hover:bg-surface-elevated">{a.label}</Link>
                                ) : (
                                  <button key={a.label} type="button" role="menuitem" onClick={() => { a.action?.(); setOpenMenuId(null); }} className={cn("w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-elevated", a.danger && "text-red-600")}>{a.label}</button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30 mt-2 px-2">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <label htmlFor="cms-rows">Rows</label>
                <select id="cms-rows" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className={selectClass}>
                  {[5, 10, 25].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="hidden sm:inline">{(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}</span>
              </div>
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-outline-variant p-2 disabled:opacity-40" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm font-semibold">Page {page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-outline-variant p-2 disabled:opacity-40" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
              </nav>
            </div>
          </>
        )}
      </TableCard>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Page Details" size="lg">
        {viewItem && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Title", viewItem.title], ["Slug", viewItem.slug], ["Status", viewItem.status], ["Category", viewItem.category], ["Language", viewItem.language], ["Version", `v${viewItem.version}`], ["Created", formatDateTime(viewItem.created_at)], ["Updated", formatDateTime(viewItem.updated_at)]].map(([k, v]) => (
              <div key={k}><p className="text-text-muted text-xs">{k}</p><p className="font-medium">{v}</p></div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} title="Page Preview" size="xl">
        {previewItem && <PagePreview page={previewItem} />}
      </Modal>

      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Page">
        <p className="text-sm text-text-muted mb-4">Soft-delete <strong>{deleteItem?.title}</strong>?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setDeleteItem(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={() => { if (deleteItem) { softDeletePage(deleteItem.id, adminEmail); addToast("Deleted", "info"); setDeleteItem(null); bumpRefresh(); } }} className="flex-1 rounded-lg bg-red-600 text-white py-2.5 text-sm font-semibold">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
