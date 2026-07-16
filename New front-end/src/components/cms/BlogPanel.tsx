"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, TableCard } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SortableTh, TablePagination, compareValues } from "@/components/ui/TableControls";
import {
  BLOG_CATEGORIES,
  BLOG_STATUS_OPTIONS,
  BlogPost,
  getBlogPosts,
} from "@/data/blogData";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

type SortKey = "title" | "category" | "status" | "published_at" | "author";

const TABLE_HEADERS: { key: SortKey | "excerpt" | "actions"; label: string; sortable?: boolean }[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "excerpt", label: "Excerpt" },
  { key: "status", label: "Status", sortable: true },
  { key: "published_at", label: "Published", sortable: true },
  { key: "author", label: "Author", sortable: true },
  { key: "actions", label: "Actions" },
];

function truncate(text: string, max = 56) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function sortValue(post: BlogPost, key: SortKey) {
  if (key === "published_at") return post.published_at || post.created_at;
  return post[key] ?? "";
}

export function BlogPanel() {
  const { refreshKey } = useApp();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
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
    let list = getBlogPosts();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    return [...list].sort((a, b) => compareValues(sortValue(a, sortKey), sortValue(b, sortKey), sortDir));
  }, [query, categoryFilter, statusFilter, sortKey, sortDir, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
            placeholder="Search articles by title, excerpt, or author..."
            aria-label="Search blog articles"
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
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            {BLOG_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <TableCard title="Blog Articles">
        {loading ? (
          <div className="space-y-3 p-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <MaterialIcon name="article" size={40} className="text-text-muted mb-3" />
            <p className="font-semibold">No matching articles</p>
            <p className="text-sm text-text-muted mt-1">Create a new blog post to appear on the website.</p>
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
                  {paginated.map((post) => (
                    <tr key={post.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-14">
                      <td className="p-4">
                        <div className="font-medium">{post.title}</div>
                        {post.featured_on_homepage && (
                          <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">Homepage</span>
                        )}
                      </td>
                      <td className="p-4 text-text-muted">{post.category}</td>
                      <td className="p-4 text-text-muted max-w-xs">{truncate(post.excerpt)}</td>
                      <td className="p-4">
                        <Badge variant={post.status === "active" ? "success" : "default"}>
                          {post.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-muted whitespace-nowrap">
                        {post.published_at ? formatDate(post.published_at) : "—"}
                      </td>
                      <td className="p-4 text-text-muted">{post.author}</td>
                      <td className="p-4">
                        <Link
                          href={`/cms/blog/create?edit=${post.id}`}
                          className="rounded border border-outline-variant px-3 py-1.5 text-xs font-semibold hover:bg-surface-elevated inline-block"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              id="blog-rows-per-page"
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
