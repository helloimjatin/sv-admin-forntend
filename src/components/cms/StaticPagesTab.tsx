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
  const { addToast, bumpRefresh, refreshKey } = useApp();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const staticPagesList = useMemo(() => [
    { title: "Privacy Policy", url: "https://sehatvaani.com/privacy", status: "Published" },
    { title: "Terms & Conditions", url: "https://sehatvaani.com/terms", status: "Published" },
    { title: "About Us", url: "https://sehatvaani.com/about", status: "Published" },
    { title: "Contact Us", url: "https://sehatvaani.com/contact", status: "Published" },
    { title: "FAQ", url: "https://sehatvaani.com/faq", status: "Draft" },
    { title: "Delete Account", url: "https://sehatvaani.com/delete-account", status: "Published" },
    { title: "Refund Policy", url: "https://sehatvaani.com/refunds", status: "Draft" },
  ], []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [refreshKey]);

  const filtered = useMemo(() => {
    return staticPagesList.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, staticPagesList]);

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
          <button type="button" onClick={() => setQuery(search)} className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase shrink-0">Search</button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-low border-y border-outline-variant/50">
                  <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Page Title</th>
                  <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Website URL</th>
                  <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Status</th>
                  <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-low h-14">
                    <td className="p-4 font-medium">{p.title}</td>
                    <td className="p-4 font-mono text-xs text-primary">{p.url}</td>
                    <td className="p-4">
                      <Badge variant={p.status === "Published" ? "success" : "default"}>{p.status}</Badge>
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
        )}
      </TableCard>
    </div>
  );
}
