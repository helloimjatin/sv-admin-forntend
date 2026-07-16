"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, TableCard } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SortableTh, TablePagination, compareValues } from "@/components/ui/TableControls";
import {
  VIDEO_STATUS_OPTIONS,
  VideoItem,
  getVideoCategories,
  getVideos,
} from "@/data/videosData";
import { useApp } from "@/context/AppContext";

type SortKey = "title" | "category" | "status" | "duration";

const TABLE_HEADERS: { key: SortKey | "description" | "actions"; label: string; sortable?: boolean }[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "description", label: "Description" },
  { key: "duration", label: "Duration", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions" },
];

function truncate(text: string, max = 56) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function sortValue(video: VideoItem, key: SortKey) {
  return video[key] ?? "";
}

export function VideosPanel() {
  const { refreshKey } = useApp();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
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
    let list = getVideos();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.slug.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") list = list.filter((v) => v.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter((v) => v.status === statusFilter);
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
            placeholder="Search videos by title or description..."
            aria-label="Search videos"
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
            {getVideoCategories().map((c) => (
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
            {VIDEO_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <TableCard title="Video Library">
        {loading ? (
          <div className="space-y-3 p-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <MaterialIcon name="videocam" size={40} className="text-text-muted mb-3" />
            <p className="font-semibold">No matching videos</p>
            <p className="text-sm text-text-muted mt-1">Add a video to populate the website library.</p>
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
                  {paginated.map((video) => (
                    <tr key={video.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-14">
                      <td className="p-4">
                        <div className="font-medium">{video.title}</div>
                        {video.featured_on_homepage && (
                          <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">Homepage</span>
                        )}
                      </td>
                      <td className="p-4 text-text-muted">{video.category}</td>
                      <td className="p-4 text-text-muted max-w-xs">{truncate(video.description)}</td>
                      <td className="p-4 text-text-muted whitespace-nowrap">{video.duration || "—"}</td>
                      <td className="p-4">
                        <Badge variant={video.status === "active" ? "success" : "default"}>
                          {video.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/cms/videos/create?edit=${video.id}`}
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
              id="videos-rows-per-page"
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
