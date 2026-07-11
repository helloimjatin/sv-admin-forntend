"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  StatCard,
  Badge,
  Modal,
  TableCard,
} from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { DevicePreview } from "@/components/notifications/DevicePreview";
import {
  notificationCampaigns,
  notificationAnalyticsSummary,
  NotificationCampaign,
  NotificationStatus,
  AUDIENCE_OPTIONS,
  STATUS_OPTIONS,
  deleteNotificationCampaign,
  duplicateNotificationCampaign,
  cancelScheduledNotification,
  resendNotification,
} from "@/data/notificationData";
import { useApp } from "@/context/AppContext";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import {
  Send,
  CheckCircle,
  Eye,
  MousePointerClick,
  XCircle,
  TrendingUp,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

type SortKey = keyof Pick<
  NotificationCampaign,
  "notification_id" | "title" | "delivery_type" | "scheduled_at" | "audience" | "estimated_recipients" | "status" | "created_by" | "created_at"
>;

const TABLE_HEADERS: { key: SortKey | "description" | "actions"; label: string; sortable?: boolean }[] = [
  { key: "notification_id", label: "Notification ID", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "description", label: "Description Preview" },
  { key: "delivery_type", label: "Delivery Type", sortable: true },
  { key: "scheduled_at", label: "Scheduled Date & Time", sortable: true },
  { key: "audience", label: "Audience", sortable: true },
  { key: "estimated_recipients", label: "Est. Recipients", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "created_by", label: "Created By", sortable: true },
  { key: "created_at", label: "Created Date", sortable: true },
  { key: "actions", label: "Actions" },
];

function statusVariant(status: NotificationStatus): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  const map: Record<NotificationStatus, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
    draft: "default",
    scheduled: "info",
    sending: "purple",
    sent: "success",
    failed: "danger",
    cancelled: "warning",
  };
  return map[status];
}

function statusLabel(status: NotificationStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function truncate(text: string, max = 48) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function NotificationsPage() {
  const { addToast, bumpRefresh, refreshKey, adminEmail } = useApp();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [viewItem, setViewItem] = useState<NotificationCampaign | null>(null);
  const [previewItem, setPreviewItem] = useState<NotificationCampaign | null>(null);
  const [deleteItem, setDeleteItem] = useState<NotificationCampaign | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [refreshKey]);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [openMenuId]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = [...notificationCampaigns];

    if (statusFilter !== "all") list = list.filter((n) => n.status === statusFilter);
    if (audienceFilter !== "all") list = list.filter((n) => n.audience_type === audienceFilter);
    if (deliveryFilter !== "all") list = list.filter((n) => n.delivery_type === deliveryFilter);

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((n) => new Date(n.created_at).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000;
      list = list.filter((n) => new Date(n.created_at).getTime() <= to);
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) =>
          n.notification_id.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.audience.toLowerCase().includes(q) ||
          n.created_by.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [statusFilter, audienceFilter, deliveryFilter, dateFrom, dateTo, query, sortKey, sortDir, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const analytics = notificationAnalyticsSummary;

  const selectClass =
    "rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors";

  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Notifications" subtitle="Push campaigns and delivery analytics">
        <div className="space-y-6" key={refreshKey}>
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-text-muted max-w-2xl">
              Create, schedule, and monitor healthcare push notifications across patient segments. Track delivery performance and manage campaign lifecycles.
            </p>
            <Link
              href="/notifications/create"
              className="bg-primary text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors shrink-0 flex items-center gap-2 self-start"
              aria-label="Create new notification"
            >
              <MaterialIcon name="add" size={18} />
              Create Notification
            </Link>
          </div>

          {/* Analytics */}
          <section aria-labelledby="analytics-heading">
            <h2 id="analytics-heading" className="sr-only">Notification Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <StatCard label="Total Sent" value={analytics.total_sent.toLocaleString()} icon={Send} color="brand" loading={loading} />
              <StatCard label="Delivered" value={analytics.delivered.toLocaleString()} icon={CheckCircle} color="green" loading={loading} />
              <StatCard label="Opened" value={analytics.opened.toLocaleString()} icon={Eye} color="sky" loading={loading} />
              <StatCard label="CTR" value={`${analytics.ctr}%`} icon={MousePointerClick} color="violet" loading={loading} />
              <StatCard label="Failed" value={analytics.failed.toLocaleString()} icon={XCircle} color="red" loading={loading} />
              <StatCard label="Delivery Rate" value={`${analytics.delivery_rate}%`} icon={TrendingUp} color="teal" loading={loading} />
              <StatCard
                label="Last Delivery"
                value={formatDate(analytics.last_delivery_at)}
                icon={Clock}
                color="amber"
                loading={loading}
                valueClassName="!text-xl"
                trend={analytics.last_delivery_at ? new Date(analytics.last_delivery_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : undefined}
              />
            </div>
          </section>

          {/* Filters */}
          <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
                  placeholder="Search by ID, title, audience, creator..."
                  aria-label="Search notifications"
                  className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => { setQuery(search); setPage(1); }}
                  className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={cn(selectClass, "w-full")} aria-label="Filter by status">
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">Audience</label>
                <select value={audienceFilter} onChange={(e) => { setAudienceFilter(e.target.value); setPage(1); }} className={cn(selectClass, "w-full")} aria-label="Filter by audience">
                  <option value="all">All Audiences</option>
                  {AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">Delivery Type</label>
                <select value={deliveryFilter} onChange={(e) => { setDeliveryFilter(e.target.value); setPage(1); }} className={cn(selectClass, "w-full")} aria-label="Filter by delivery type">
                  <option value="all">All Types</option>
                  <option value="instant">Instant</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className={cn(selectClass, "w-full")} aria-label="Filter from date" />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-text-muted block mb-1">To Date</label>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className={cn(selectClass, "w-full")} aria-label="Filter to date" />
              </div>
            </div>
          </div>

          {/* Table */}
          <TableCard title="Notification Campaigns">
            {loading ? (
              <div className="space-y-3 p-2" aria-busy="true" aria-label="Loading notifications">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg shimmer" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Bell className="h-12 w-12 text-text-muted mb-3 opacity-50" />
                {query || statusFilter !== "all" || audienceFilter !== "all" || deliveryFilter !== "all" || dateFrom || dateTo ? (
                  <>
                    <p className="font-semibold">No matching notifications</p>
                    <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">No notifications yet</p>
                    <p className="text-sm text-text-muted mt-1">Create your first campaign to reach patients and doctors.</p>
                    <Link href="/notifications/create" className="mt-4 bg-primary text-white text-xs font-semibold uppercase px-5 py-2 rounded-lg inline-block">Create Notification</Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-sm" role="table">
                    <thead>
                      <tr className="bg-surface-low border-y border-outline-variant/50">
                        {TABLE_HEADERS.map((h) => (
                          <th key={h.key} className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">
                            {h.sortable ? (
                              <button
                                type="button"
                                onClick={() => toggleSort(h.key as SortKey)}
                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                aria-label={`Sort by ${h.label}`}
                              >
                                {h.label}
                                <ArrowUpDown className="h-3 w-3" />
                              </button>
                            ) : (
                              h.label
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((n) => (
                        <tr key={n.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-14">
                          <td className="p-4 font-mono text-xs text-primary font-semibold whitespace-nowrap">{n.notification_id}</td>
                          <td className="p-4 font-medium max-w-[180px]">
                            <span className="block truncate" title={n.title}>{n.title}</span>
                          </td>
                          <td className="p-4 text-text-muted max-w-[200px]">
                            <span className="block truncate" title={n.description}>{truncate(n.description)}</span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <Badge variant={n.delivery_type === "instant" ? "info" : "purple"}>
                              {n.delivery_type === "instant" ? "Instant" : "Scheduled"}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-muted whitespace-nowrap">{n.scheduled_at ? formatDateTime(n.scheduled_at) : "—"}</td>
                          <td className="p-4 max-w-[140px]">
                            <span className="block truncate" title={n.audience}>{n.audience}</span>
                          </td>
                          <td className="p-4 font-mono text-xs whitespace-nowrap">{n.estimated_recipients.toLocaleString()}</td>
                          <td className="p-4 whitespace-nowrap"><Badge variant={statusVariant(n.status)}>{statusLabel(n.status)}</Badge></td>
                          <td className="p-4 whitespace-nowrap max-w-[120px]">
                            <span className="block truncate" title={n.created_by}>{n.created_by}</span>
                          </td>
                          <td className="p-4 text-text-muted whitespace-nowrap">{formatDate(n.created_at)}</td>
                          <td className="p-4 whitespace-nowrap relative overflow-visible">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === n.id ? null : n.id); }}
                                className="rounded-lg border border-outline-variant px-2 py-1 text-xs font-semibold hover:bg-surface-elevated"
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === n.id}
                                aria-label={`Actions for ${n.title}`}
                              >
                                Actions ▾
                              </button>
                              {openMenuId === n.id && (
                                <div
                                  className="absolute right-0 bottom-full mb-1 z-40 min-w-[160px] rounded-lg border border-outline-variant bg-surface-card shadow-xl py-1"
                                  role="menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {[
                                    { label: "View", action: () => setViewItem(n) },
                                    { label: "Edit", href: `/notifications/create?edit=${n.id}`, hide: n.status === "sent" || n.status === "sending" },
                                    { label: "Duplicate", action: () => { duplicateNotificationCampaign(n.id, adminEmail); addToast("Notification duplicated as draft"); bumpRefresh(); } },
                                    { label: "Preview", action: () => setPreviewItem(n) },
                                    { label: "Cancel Schedule", action: () => { cancelScheduledNotification(n.id); addToast("Schedule cancelled", "info"); bumpRefresh(); }, hide: n.status !== "scheduled" },
                                    { label: "Resend", action: () => { resendNotification(n.id); addToast("Resending notification…"); bumpRefresh(); }, hide: n.status !== "sent" && n.status !== "failed" },
                                    { label: "Delete", action: () => setDeleteItem(n), danger: true },
                                  ]
                                    .filter((a) => !a.hide)
                                    .map((a) =>
                                      "href" in a && a.href ? (
                                        <Link
                                          key={a.label}
                                          href={a.href}
                                          role="menuitem"
                                          onClick={() => setOpenMenuId(null)}
                                          className="block w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-elevated"
                                        >
                                          {a.label}
                                        </Link>
                                      ) : (
                                        <button
                                          key={a.label}
                                          type="button"
                                          role="menuitem"
                                          onClick={() => { a.action?.(); setOpenMenuId(null); }}
                                          className={cn(
                                            "w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-elevated",
                                            a.danger && "text-red-600"
                                          )}
                                        >
                                          {a.label}
                                        </button>
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

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30 mt-2 px-2">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <label htmlFor="rows-per-page">Rows per page</label>
                    <select
                      id="rows-per-page"
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                      className={selectClass}
                    >
                      {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="hidden sm:inline">
                      Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
                    </span>
                  </div>
                  <nav className="flex items-center gap-2" aria-label="Pagination">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg border border-outline-variant p-2 disabled:opacity-40 hover:bg-surface-elevated"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold px-2" aria-current="page">Page {page} of {totalPages}</span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-outline-variant p-2 disabled:opacity-40 hover:bg-surface-elevated"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </>
            )}
          </TableCard>
        </div>

        <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Notification Details" size="lg">
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  ["ID", viewItem.notification_id],
                  ["Status", statusLabel(viewItem.status)],
                  ["Title", viewItem.title],
                  ["Subtitle", viewItem.subtitle || "—"],
                  ["Category", viewItem.category],
                  ["Audience", viewItem.audience],
                  ["Recipients", viewItem.estimated_recipients.toLocaleString()],
                  ["Delivery", viewItem.delivery_type],
                  ["Scheduled", viewItem.scheduled_at ? formatDateTime(viewItem.scheduled_at) : "—"],
                  ["Created By", viewItem.created_by],
                  ["Created", formatDateTime(viewItem.created_at)],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-text-muted text-xs">{k}</p><p className="font-medium">{v}</p></div>
                ))}
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">Description</p>
                <p className="text-sm">{viewItem.description}</p>
              </div>
              {viewItem.analytics && (
                <div className="rounded-lg border border-outline-variant/50 bg-surface-low p-4">
                  <p className="text-xs font-semibold uppercase text-text-muted mb-3">Campaign Analytics</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-text-muted text-xs">Sent</p><p className="font-bold">{viewItem.analytics.total_sent}</p></div>
                    <div><p className="text-text-muted text-xs">Delivered</p><p className="font-bold">{viewItem.analytics.delivered}</p></div>
                    <div><p className="text-text-muted text-xs">Opened</p><p className="font-bold">{viewItem.analytics.opened}</p></div>
                    <div><p className="text-text-muted text-xs">CTR</p><p className="font-bold">{viewItem.analytics.ctr}%</p></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} title="Notification Preview" size="xl">
          {previewItem && (
            <DevicePreview
              layout="row"
              title={previewItem.title}
              subtitle={previewItem.subtitle}
              body={previewItem.body ?? previewItem.description}
              actionButton={previewItem.action_button}
              imageUrl={previewItem.image_url ?? undefined}
            />
          )}
        </Modal>

        <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Notification">
          <p className="text-sm text-text-muted mb-4">
            Permanently delete <strong>{deleteItem?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setDeleteItem(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (deleteItem) {
                  deleteNotificationCampaign(deleteItem.id);
                  addToast("Notification deleted", "info");
                  setDeleteItem(null);
                  bumpRefresh();
                }
              }}
              className="flex-1 rounded-lg bg-red-600 text-white py-2.5 text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        </Modal>
      </DashboardLayout>
    </AuthGuard>
  );
}
