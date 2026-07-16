"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Modal,
  PageHeader,
} from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SortableTh, TablePagination, compareValues } from "@/components/ui/TableControls";
import {
  ACCOUNT_STATUSES,
  ManagedUser,
  getManagedUsers,
  softDeleteManagedUser,
  statusBadgeVariant,
} from "@/data/userManagementData";
import { plans } from "@/data/mockData";
import { exportManagedUsers } from "@/lib/userManagementService";
import { useApp } from "@/context/AppContext";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";

type SortKey = "full_name" | "mobile" | "subscription_plan" | "status" | "last_login" | "created_at";

const TABLE_HEADERS: { key: SortKey | "actions"; label: string; sortable?: boolean }[] = [
  { key: "full_name", label: "User", sortable: true },
  { key: "mobile", label: "Contact", sortable: true },
  { key: "subscription_plan", label: "Plan", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "last_login", label: "Last Login", sortable: true },
  { key: "created_at", label: "Registered", sortable: true },
  { key: "actions", label: "Actions" },
];

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-inherit rounded px-0.5">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

function sortValue(u: ManagedUser, key: SortKey) {
  if (key === "last_login") return u.last_login || "";
  return u[key] ?? "";
}

export function UsersPanel() {
  const { addToast, bumpRefresh, refreshKey, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [confirm, setConfirm] = useState<{ type: string; user?: ManagedUser; ids?: number[] } | null>(null);
  const [notifyUser, setNotifyUser] = useState<ManagedUser | null>(null);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyChannel, setNotifyChannel] = useState<"push" | "email" | "sms" | "whatsapp">("push");
  const [loginHistoryUser, setLoginHistoryUser] = useState<ManagedUser | null>(null);
  const [devicesUser, setDevicesUser] = useState<ManagedUser | null>(null);

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
    let list = getManagedUsers();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.user_id.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.mobile.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
          u.health_id.toLowerCase().includes(q) ||
          u.aadhaar_masked.toLowerCase().includes(q)
      );
    }
    if (planFilter !== "all") list = list.filter((u) => String(u.subscription_plan_id) === planFilter);
    if (statusFilter !== "all") list = list.filter((u) => u.status === statusFilter);

    return [...list].sort((a, b) => compareValues(sortValue(a, sortKey), sortValue(b, sortKey), sortDir));
  }, [query, planFilter, statusFilter, sortKey, sortDir, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [query, planFilter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function sendComm() {
    if (!notifyUser || !notifyMsg.trim()) {
      addToast("Enter a message", "error");
      return;
    }
    addToast(`${notifyChannel.toUpperCase()} queued for ${notifyUser.full_name}`, "success");
    setNotifyUser(null);
    setNotifyMsg("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <PageHeader title="User Management" />
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Search, filter, and manage patient accounts, verification, subscriptions, and devices.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              exportManagedUsers(filtered);
              addToast("Export ready", "success");
            }}
            className="rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated inline-flex items-center gap-1"
          >
            <MaterialIcon name="download" size={16} /> Export Users
          </button>
        </div>
      </div>

      <div className="sticky top-0 z-10 rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex flex-1 gap-2">
            <input
              id="user-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
              placeholder="Search by Name, Mobile Number or User ID"
              className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
              aria-label="Search users"
            />
            <button
              type="button"
              onClick={() => { setQuery(search); setPage(1); }}
              className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              Search
            </button>
          </div>
          <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" aria-label="Filter by plan">
            <option value="all">All plans</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" aria-label="Filter by status">
            <option value="all">All statuses</option>
            {ACCOUNT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-outline-variant/50 bg-surface-card">
        <div className="px-4 py-3 border-b border-outline-variant/50">
          <p className="text-sm font-semibold">{filtered.length} users</p>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-lg shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialIcon name="group_off" size={40} className="text-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No users found</h3>
            <p className="text-sm text-text-muted mt-1">Try adjusting search or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse" role="table">
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
                  {paginated.map((u) => (
                    <tr key={u.id} className="border-b border-outline-variant/30 hover:bg-surface-elevated/40 h-14">
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="h-9 w-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(u.full_name)}
                          </div>
                          <div>
                            <span className="font-semibold hover:text-primary">
                              {highlight(u.full_name, query)}
                            </span>
                            <p className="text-[11px] font-mono text-text-muted">{highlight(u.user_id, query)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 min-w-[160px]">
                        <p className="text-xs">{highlight(u.mobile, query)}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={u.subscription_plan_id > 1 ? "purple" : "default"}>{u.subscription_plan}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusBadgeVariant(u.status)}>
                          {u.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap">{u.last_login ? formatDateTime(u.last_login) : "Never"}</td>
                      <td className="p-4 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                      <td className="p-4">
                        <Link href={`/profile/${u.id}`} className="inline-flex rounded bg-primary text-white text-xs font-semibold px-3 py-1.5 hover:bg-primary-container">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              id="users-rows-per-page"
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={filtered.length}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1); }}
            />
          </>
        )}
      </div>

      <Modal open={!!notifyUser} onClose={() => setNotifyUser(null)} title={`Message ${notifyUser?.full_name || ""}`} size="md">
        <div className="space-y-3">
          <select value={notifyChannel} onChange={(e) => setNotifyChannel(e.target.value as typeof notifyChannel)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm">
            <option value="push">Push Notification</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <textarea
            value={notifyMsg}
            onChange={(e) => setNotifyMsg(e.target.value)}
            rows={4}
            placeholder="Write your message…"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setNotifyUser(null)} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase">Cancel</button>
            <button type="button" onClick={sendComm} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold uppercase">Send</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!loginHistoryUser} onClose={() => setLoginHistoryUser(null)} title="Login History" size="lg">
        {loginHistoryUser && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-text-muted border-b border-outline-variant/50">
                  <th className="py-2">Time</th><th className="py-2">IP</th><th className="py-2">Device</th><th className="py-2">Location</th><th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {loginHistoryUser.login_history.map((l) => (
                  <tr key={l.id} className="border-b border-outline-variant/30">
                    <td className="py-2 text-xs">{formatDateTime(l.timestamp)}</td>
                    <td className="py-2 font-mono text-xs">{l.ip}</td>
                    <td className="py-2 text-xs">{l.device}</td>
                    <td className="py-2 text-xs">{l.location}</td>
                    <td className="py-2"><Badge variant={l.success ? "success" : "danger"}>{l.success ? "OK" : "Failed"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal open={!!devicesUser} onClose={() => setDevicesUser(null)} title="Devices" size="lg">
        {devicesUser && (
          <div className="space-y-3">
            {devicesUser.devices.length === 0 ? (
              <p className="text-sm text-text-muted">No devices registered.</p>
            ) : (
              devicesUser.devices.map((d) => (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-outline-variant/50 p-3">
                  <div>
                    <p className="font-semibold text-sm">{d.device_type}</p>
                    <p className="text-xs text-text-muted">{d.os_version} · App {d.app_version} · Last {formatDateTime(d.last_active)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.is_active ? "success" : "default"}>{d.is_active ? "Active" : "Logged out"}</Badge>
                  </div>
                </div>
              ))
            )}
            <p className="text-xs text-text-muted">Manage force-logout from the user profile page.</p>
          </div>
        )}
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Confirm action" size="sm">
        {confirm && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              {confirm.type === "delete"
                ? `Soft-delete ${confirm.user?.full_name}? They can be restored from audit.`
                : `Soft-delete ${confirm.ids?.length} selected users?`}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirm(null)} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (confirm.type === "delete" && confirm.user) softDeleteManagedUser(confirm.user.id, editor);
                  addToast("User deleted", "success");
                  bumpRefresh();
                  setConfirm(null);
                }}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
