"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Modal,
  PageHeader,
  StatCard,
} from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  ACCOUNT_STATUSES,
  AccountStatus,
  DOCTORS,
  ManagedUser,
  TAG_OPTIONS,
  bulkAddTags,
  bulkAssignDoctor,
  bulkAssignPlan,
  bulkSetStatus,
  getManagedUsers,
  getUserStats,
  setUserStatus,
  softDeleteManagedUser,
  statusBadgeVariant,
} from "@/data/userManagementData";
import { plans } from "@/data/mockData";
import { downloadUserReport, exportManagedUsers } from "@/lib/userManagementService";
import { useApp } from "@/context/AppContext";
import { cn, formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { Users, UserCheck, UserX, ShieldAlert, Crown, ChevronLeft, ChevronRight } from "lucide-react";

type SortKey = "latest" | "oldest" | "name" | "last_login";

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

export function UsersPanel() {
  const router = useRouter();
  const { addToast, bumpRefresh, refreshKey, adminEmail, role } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";
  const isAdmin = role === "Super Admin" || role === "Admin";
  const isSuper = role === "Super Admin";

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [menuId, setMenuId] = useState<number | null>(null);

  const [confirm, setConfirm] = useState<{ type: string; user?: ManagedUser; ids?: number[] } | null>(null);
  const [notifyUser, setNotifyUser] = useState<ManagedUser | null>(null);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifyChannel, setNotifyChannel] = useState<"push" | "email" | "sms" | "whatsapp">("push");
  const [bulkPlanId, setBulkPlanId] = useState(2);
  const [bulkDoctor, setBulkDoctor] = useState(DOCTORS[0]);
  const [bulkTag, setBulkTag] = useState(TAG_OPTIONS[0]);
  const [bulkModal, setBulkModal] = useState<"plan" | "doctor" | "tags" | "notify" | null>(null);
  const [loginHistoryUser, setLoginHistoryUser] = useState<ManagedUser | null>(null);
  const [devicesUser, setDevicesUser] = useState<ManagedUser | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [refreshKey]);

  useEffect(() => {
    if (menuId == null) return;
    const close = () => setMenuId(null);
    const t = window.setTimeout(() => window.addEventListener("click", close), 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("click", close);
    };
  }, [menuId]);

  const stats = useMemo(() => getUserStats(), [refreshKey]);

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

    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.full_name.localeCompare(b.full_name);
      if (sortKey === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortKey === "last_login") {
        return (new Date(b.last_login || 0).getTime()) - (new Date(a.last_login || 0).getTime());
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [query, planFilter, statusFilter, sortKey, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * rowsPerPage, pageSafe * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [query, planFilter, statusFilter, rowsPerPage]);

  const allPageSelected = pageRows.length > 0 && pageRows.every((u) => selected.includes(u.id));

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelected((s) => s.filter((id) => !pageRows.some((u) => u.id === id)));
    } else {
      setSelected((s) => Array.from(new Set([...s, ...pageRows.map((u) => u.id)])));
    }
  }

  function runStatus(user: ManagedUser, status: AccountStatus) {
    setUserStatus(user.id, status, editor);
    addToast(`User marked ${status.replace("_", " ")}`, "success");
    bumpRefresh();
    setMenuId(null);
  }

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
              exportManagedUsers(selected.length ? filtered.filter((u) => selected.includes(u.id)) : filtered);
              addToast("Export ready", "success");
            }}
            className="rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated inline-flex items-center gap-1"
          >
            <MaterialIcon name="download" size={16} /> Export Users
          </button>
          {isAdmin && (
            <Link
              href="/users/new"
              className="rounded-lg bg-primary text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container inline-flex items-center gap-1"
            >
              <MaterialIcon name="person_add" size={16} /> Create User
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats.total} icon={Users} color="brand" loading={loading} />
        <StatCard label="Active / Trial" value={stats.active} icon={UserCheck} color="green" loading={loading} />
        <StatCard label="Blocked / Suspended" value={stats.blocked} icon={UserX} color="red" loading={loading} />
        <StatCard label="Pending Verify" value={stats.pending} icon={ShieldAlert} color="amber" loading={loading} />
        <StatCard label="Premium" value={stats.premium} icon={Crown} color="violet" loading={loading} />
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex flex-1 gap-2">
            <input
              id="user-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
              placeholder="Search name, ID, email, mobile, Health ID, Aadhaar…"
              className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
              aria-label="Search users"
            />
            <button
              type="button"
              onClick={() => setQuery(search)}
              className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              Search
            </button>
          </div>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" aria-label="Filter by plan">
            <option value="all">All plans</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" aria-label="Filter by status">
            <option value="all">All statuses</option>
            {ACCOUNT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
            aria-label="Sort users"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name">Sort: Name</option>
            <option value="last_login">Sort: Last Login</option>
          </select>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/40">
            <span className="text-xs font-semibold text-text-muted">{selected.length} selected</span>
            <button type="button" onClick={() => { exportManagedUsers(filtered.filter((u) => selected.includes(u.id))); addToast("Selected users exported", "success"); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Export</button>
            <button type="button" onClick={() => setBulkModal("plan")} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Assign Plan</button>
            <button type="button" onClick={() => setBulkModal("doctor")} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Assign Doctor</button>
            <button type="button" onClick={() => setBulkModal("tags")} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Add Tags</button>
            <button type="button" onClick={() => setBulkModal("notify")} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Notify</button>
            <button type="button" onClick={() => { bulkSetStatus(selected, "active", editor); addToast("Users activated", "success"); bumpRefresh(); setSelected([]); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Activate</button>
            <button type="button" onClick={() => { bulkSetStatus(selected, "suspended", editor); addToast("Users suspended", "success"); bumpRefresh(); setSelected([]); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated">Suspend</button>
            <button type="button" onClick={() => setConfirm({ type: "bulk_delete", ids: selected })} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white">Delete</button>
            <button type="button" onClick={() => setSelected([])} className="text-xs text-text-muted underline ml-auto">Clear</button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-outline-variant/50 bg-surface-card">
        <div className="px-4 py-3 border-b border-outline-variant/50 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{filtered.length} users</p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Rows</span>
            <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="rounded border border-outline-variant bg-surface px-2 py-1" aria-label="Rows per page">
              {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-lg shimmer" />)}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-12 text-center">
            <MaterialIcon name="group_off" size={40} className="text-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No users found</h3>
            <p className="text-sm text-text-muted mt-1">Try adjusting search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-surface-low border-y border-outline-variant/50 text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="p-3 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} aria-label="Select all on page" />
                  </th>
                  <th className="p-3">User</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Health</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((u) => (
                  <tr key={u.id} className="border-b border-outline-variant/30 hover:bg-surface-elevated/40">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={() =>
                          setSelected((s) => (s.includes(u.id) ? s.filter((x) => x !== u.id) : [...s, u.id]))
                        }
                        aria-label={`Select ${u.full_name}`}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="h-9 w-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(u.full_name)}
                        </div>
                        <div>
                          <Link href={`/profile/${u.id}`} className="font-semibold hover:text-primary">
                            {highlight(u.full_name, query)}
                          </Link>
                          <p className="text-[11px] font-mono text-text-muted">{highlight(u.user_id, query)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 min-w-[160px]">
                      <p className="text-xs">{highlight(u.mobile, query)}</p>
                      <p className="text-xs text-text-muted">{highlight(u.email, query)}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {u.verification.mobile && <Badge variant="success">Mobile</Badge>}
                        {u.verification.email && <Badge variant="info">Email</Badge>}
                        {u.verification.kyc && <Badge variant="purple">KYC</Badge>}
                        {u.verification.doctor && <Badge variant="default">Doctor</Badge>}
                        {u.verification.premium && <Badge variant="warning">Premium</Badge>}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Badge variant={u.subscription_plan_id > 1 ? "purple" : "default"}>{u.subscription_plan}</Badge>
                    </td>
                    <td className="p-3 capitalize text-xs whitespace-nowrap">{u.role.replace("_", " ")}</td>
                    <td className="p-3"><Badge variant={statusBadgeVariant(u.status)}>{u.status.replace("_", " ")}</Badge></td>
                    <td className="p-3 text-xs whitespace-nowrap">{u.assigned_doctor || "—"}</td>
                    <td className="p-3 text-xs">{u.health_score ?? "—"}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{u.last_login ? formatDateTime(u.last_login) : "Never"}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="p-3 relative overflow-visible" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId((id) => (id === u.id ? null : u.id));
                        }}
                        className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-elevated"
                        aria-label={`Actions for ${u.full_name}`}
                        aria-expanded={menuId === u.id}
                      >
                        <MaterialIcon name="more_vert" size={18} />
                      </button>
                      {menuId === u.id && (
                        <div className="absolute right-3 top-10 z-40 w-56 rounded-lg border border-outline-variant bg-surface-card shadow-lg py-1 text-sm animate-fade-in max-h-72 overflow-y-auto">
                          {[
                            { label: "View Profile", fn: () => router.push(`/profile/${u.id}`) },
                            { label: "Edit", fn: () => router.push(`/users/new?edit=${u.id}`), admin: true },
                            { label: "Appointments", fn: () => addToast("Appointments module linked", "info") },
                            { label: "Prescriptions", fn: () => addToast("Opening prescriptions…", "info") },
                            { label: "Lab Reports", fn: () => addToast("Open Lab Reports from the user profile", "info") },
                            { label: "Subscription Mgmt", fn: () => router.push(`/profile/${u.id}#subscription`) },
                            { label: "Billing History", fn: () => router.push(`/billing`) },
                            { label: "Login History", fn: () => setLoginHistoryUser(u) },
                            { label: "Device Management", fn: () => setDevicesUser(u) },
                            { label: "Send Notification", fn: () => { setNotifyUser(u); setNotifyChannel("push"); } },
                            { label: "Send Email", fn: () => { setNotifyUser(u); setNotifyChannel("email"); } },
                            { label: "Reset Password", fn: () => addToast(`Password reset sent to ${u.email}`, "success") },
                            ...(isSuper ? [{ label: "Impersonate User", fn: () => addToast(`Impersonation session started for ${u.full_name}`, "info") }] : []),
                            { label: "Suspend", fn: () => runStatus(u, "suspended") },
                            { label: "Activate", fn: () => runStatus(u, "active") },
                            { label: "Block", fn: () => runStatus(u, "blocked") },
                            { label: "Download Report", fn: () => { downloadUserReport(u); addToast("Report downloaded", "success"); } },
                            { label: "Delete", fn: () => setConfirm({ type: "delete", user: u }), danger: true },
                          ]
                            .filter((item) => !("admin" in item && item.admin) || isAdmin)
                            .map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => { item.fn(); setMenuId(null); }}
                                className={cn(
                                  "w-full text-left px-3 py-2 hover:bg-surface-elevated",
                                  "danger" in item && item.danger ? "text-red-600" : ""
                                )}
                              >
                                {item.label}
                              </button>
                            ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            Showing {(pageSafe - 1) * rowsPerPage + (pageRows.length ? 1 : 0)}–{(pageSafe - 1) * rowsPerPage + pageRows.length} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={pageSafe <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border border-outline-variant disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold">Page {pageSafe} / {totalPages}</span>
            <button type="button" disabled={pageSafe >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-outline-variant disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Communication */}
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

      {/* Bulk modals */}
      <Modal open={bulkModal === "plan"} onClose={() => setBulkModal(null)} title="Bulk assign plan" size="sm">
        <select value={bulkPlanId} onChange={(e) => setBulkPlanId(Number(e.target.value))} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm mb-4">
          {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
        </select>
        <button type="button" onClick={() => { bulkAssignPlan(selected, bulkPlanId, editor); addToast("Plans assigned", "success"); bumpRefresh(); setBulkModal(null); setSelected([]); }} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold uppercase w-full">Apply</button>
      </Modal>
      <Modal open={bulkModal === "doctor"} onClose={() => setBulkModal(null)} title="Bulk assign doctor" size="sm">
        <select value={bulkDoctor} onChange={(e) => setBulkDoctor(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm mb-4">
          {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button type="button" onClick={() => { bulkAssignDoctor(selected, bulkDoctor, editor); addToast("Doctors assigned", "success"); bumpRefresh(); setBulkModal(null); setSelected([]); }} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold uppercase w-full">Apply</button>
      </Modal>
      <Modal open={bulkModal === "tags"} onClose={() => setBulkModal(null)} title="Bulk add tags" size="sm">
        <select value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm mb-4">
          {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="button" onClick={() => { bulkAddTags(selected, [bulkTag], editor); addToast("Tags added", "success"); bumpRefresh(); setBulkModal(null); setSelected([]); }} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold uppercase w-full">Apply</button>
      </Modal>
      <Modal open={bulkModal === "notify"} onClose={() => setBulkModal(null)} title="Broadcast to selected" size="md">
        <textarea value={notifyMsg} onChange={(e) => setNotifyMsg(e.target.value)} rows={4} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm mb-3" placeholder="Broadcast message…" />
        <button type="button" onClick={() => { addToast(`Broadcast queued for ${selected.length} users`, "success"); setBulkModal(null); setNotifyMsg(""); }} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold uppercase w-full">Send Broadcast</button>
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
                  if (confirm.type === "bulk_delete" && confirm.ids) confirm.ids.forEach((id) => softDeleteManagedUser(id, editor));
                  addToast("User(s) deleted", "success");
                  bumpRefresh();
                  setSelected([]);
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
