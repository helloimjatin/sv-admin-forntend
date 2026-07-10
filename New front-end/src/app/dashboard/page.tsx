"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard, Badge, FilterPills, SearchBar, DataTable, TableCard } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { users, dashboardStats, activityFeed, chartData } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { toggleUserBlock } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import {
  Users, UserCheck, Crown, User, UserPlus, FileText, Bot, IndianRupee,
  AlertTriangle, HeartPulse, TrendingUp, Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  const { addToast, bumpRefresh, refreshKey } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = users.filter((u) => {
    if (filter === "active" && u.is_blocked) return false;
    if (filter === "blocked" && !u.is_blocked) return false;
    if (query) {
      const q = query.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

  const handleBlock = (id: number, name: string, blocked: boolean) => {
    toggleUserBlock(id);
    addToast(`${name} ${blocked ? "unblocked" : "blocked"} successfully`);
    bumpRefresh();
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Dashboard Overview" subtitle="Real-time platform metrics and user management">
        <div className="space-y-6" key={refreshKey}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard label="Total Users" value={dashboardStats.total_users.toLocaleString()} icon={Users} color="brand" loading={loading} trend="+12% this month" />
            <StatCard label="Active Users" value={dashboardStats.active_users.toLocaleString()} icon={UserCheck} color="green" loading={loading} valueClassName="text-green-700" />
            <StatCard label="Premium Users" value={dashboardStats.premium_users} icon={Crown} color="violet" loading={loading} valueClassName="text-violet-700" />
            <StatCard label="Free Users" value={dashboardStats.free_users} icon={User} color="sky" loading={loading} valueClassName="text-sky-700" />
            <StatCard label="Today's Signups" value={dashboardStats.today_signups} icon={UserPlus} color="teal" loading={loading} valueClassName="text-teal-700" trend="+3 vs yesterday" />
            <StatCard label="Today's Reports" value={dashboardStats.today_reports} icon={FileText} color="amber" loading={loading} valueClassName="text-amber-700" />
            <StatCard label="Today's AI Chats" value={dashboardStats.today_ai_chats} icon={Bot} color="indigo" loading={loading} valueClassName="text-indigo-700" />
            <StatCard label="Today's Revenue" value={dashboardStats.today_revenue} icon={IndianRupee} color="green" loading={loading} valueClassName="text-emerald-700" />
            <StatCard label="Pending Issues" value={dashboardStats.pending_issues} icon={AlertTriangle} color="red" loading={loading} valueClassName="text-red-600" />
            <StatCard label="System Health" value={dashboardStats.system_health} icon={HeartPulse} color="green" loading={loading} valueClassName="text-lime-700 text-xl" />
          </div>

          {/* Charts + Live Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-lg border border-outline-variant/50 bg-surface-card p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" /> Weekly Signups
              </h3>
              <p className="text-xs text-text-muted mb-4">New user registrations this week</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.signups}>
                  <defs>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#0ea5e9" fill="url(#signupGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-primary" /> Live Activity
              </h3>
              <div className="space-y-3">
                {activityFeed.map((a) => (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="leading-snug">{a.message}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <IndianRupee className="h-4 w-4 text-primary" /> Weekly Revenue
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData.revenue}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <TableCard
            title="User Management"
            toolbar={<div className="w-full md:w-64"><SearchBar value={search} onChange={setSearch} onSearch={() => setQuery(search)} placeholder="Search users..." /></div>}
            filters={<FilterPills options={[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Blocked", value: "blocked" }]} active={filter} onChange={setFilter} />}
          >
            <DataTable headers={["Name", "Phone", "DOB", "Gender", "Subscription", "Status", "Joined", "Actions"]}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-sm text-text-muted">
                    No users match your filters.
                    {(query || filter !== "all") && (
                      <button
                        type="button"
                        onClick={() => { setFilter("all"); setSearch(""); setQuery(""); }}
                        className="ml-2 text-primary font-semibold hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-outline-variant/30 hover:bg-surface-low transition-colors h-12">
                    <td className="p-4 font-semibold">{u.name}</td>
                    <td className="p-4 font-mono text-xs text-text-muted">{u.phone}</td>
                    <td className="p-4 text-text-muted">{formatDate(u.dob)}</td>
                    <td className="p-4 text-text-muted">{u.gender}</td>
                    <td className="p-4"><Badge variant={u.subscription_status === "free" ? "default" : u.subscription_status === "expired" ? "warning" : "success"}>{u.subscription_status}</Badge></td>
                    <td className="p-4"><Badge variant={u.is_blocked ? "danger" : "success"}>{u.is_blocked ? "Blocked" : "Active"}</Badge></td>
                    <td className="p-4 text-text-muted">{formatDate(u.created_at)}</td>
                    <td className="p-4 text-right space-x-3">
                      <Link href={`/profile/${u.id}`} className="text-primary text-xs font-semibold hover:underline">View</Link>
                      <button onClick={() => handleBlock(u.id, u.name, !!u.is_blocked)} className={`text-xs font-semibold hover:underline ${u.is_blocked ? "text-green-600" : "text-red-600"}`}>
                        {u.is_blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </DataTable>
          </TableCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
