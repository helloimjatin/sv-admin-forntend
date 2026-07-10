"use client";

import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard, Badge, FilterPills, SearchBar, DataTable, TableCard, MethodBadge } from "@/components/ui/Primitives";
import { payments } from "@/data/mockData";
import { formatDate, formatCurrency } from "@/lib/utils";
import { IndianRupee, CheckCircle, Clock, XCircle } from "lucide-react";

export default function BillingPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => ({
    revenue: payments.filter((p) => ["captured", "completed", "success"].includes(p.status)).reduce((s, p) => s + p.amount, 0),
    success: payments.filter((p) => ["captured", "completed", "success"].includes(p.status)).length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
  }), []);

  const filtered = payments.filter((p) => {
    if (filter === "captured" && !["captured", "completed", "success"].includes(p.status)) return false;
    if (filter === "pending" && p.status !== "pending") return false;
    if (filter === "failed" && p.status !== "failed") return false;
    if (query) {
      const q = query.toLowerCase();
      return p.customer_name.toLowerCase().includes(q) || p.transaction_id.toLowerCase().includes(q) || String(p.id).includes(q);
    }
    return true;
  });

  const statusVariant = (s: string) => {
    if (["captured", "completed", "success"].includes(s)) return "success";
    if (s === "pending") return "warning";
    return "danger";
  };

  return (
    <AuthGuard>
      <DashboardLayout title="Billing Overview" subtitle="Transaction ledger and payment analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={formatCurrency(stats.revenue)} icon={IndianRupee} color="green" valueClassName="text-emerald-700" />
            <StatCard label="Successful Payments" value={stats.success} icon={CheckCircle} color="brand" />
            <StatCard label="Pending Settlements" value={stats.pending} icon={Clock} color="amber" valueClassName="text-amber-700" />
            <StatCard label="Failed Payments" value={stats.failed} icon={XCircle} color="red" valueClassName="text-red-600" />
          </div>
          <TableCard
            title="Transaction Ledger"
            toolbar={<div className="w-full md:w-72"><SearchBar value={search} onChange={setSearch} onSearch={() => setQuery(search)} placeholder="Search transactions..." /></div>}
            filters={<FilterPills options={[{ label: "All", value: "all" }, { label: "Captured", value: "captured" }, { label: "Pending", value: "pending" }, { label: "Failed", value: "failed" }]} active={filter} onChange={setFilter} />}
          >
            <DataTable headers={["Transaction ID", "Customer", "Amount", "Method", "Status", "Date"]}>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-mono text-xs text-primary font-semibold">{p.transaction_id || `#${p.id}`}</td>
                  <td className="p-4 font-medium">{p.customer_name}</td>
                  <td className="p-4 font-semibold font-mono">{formatCurrency(p.amount)}</td>
                  <td className="p-4"><MethodBadge method={p.payment_method} /></td>
                  <td className="p-4"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                  <td className="p-4 text-text-muted">{formatDate(p.payment_date)}</td>
                </tr>
              ))}
            </DataTable>
          </TableCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
