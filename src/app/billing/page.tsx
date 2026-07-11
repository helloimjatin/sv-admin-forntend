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

  const handleExport = () => {
    addToast("Exporting payment records as CSV...", "success");
  };

  const handleDownloadInvoice = (id: number) => {
    addToast(`Downloading invoice for payment #${id}...`, "success");
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Payment Management</h1>
            <button
              onClick={handleExport}
              className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase hover:bg-surface-elevated"
            >
              Export CSV
            </button>
          </div>
          <TableCard
            title="Transaction Ledger"
            toolbar={<div className="w-full md:w-72"><SearchBar value={search} onChange={setSearch} onSearch={() => setQuery(search)} placeholder="Search transactions..." /></div>}
            filters={<FilterPills options={[{ label: "All", value: "all" }, { label: "Captured", value: "captured" }, { label: "Pending", value: "pending" }, { label: "Failed", value: "failed" }]} active={filter} onChange={setFilter} />}
          >
            <DataTable headers={["Transaction ID", "Customer", "Amount", "Method", "Status", "Date", "Actions"]}>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-mono text-xs text-primary font-semibold">{p.transaction_id || `#${p.id}`}</td>
                  <td className="p-4 font-medium">{p.customer_name}</td>
                  <td className="p-4 font-semibold font-mono">{formatCurrency(p.amount)}</td>
                  <td className="p-4"><MethodBadge method={p.payment_method || "UPI"} /></td>
                  <td className="p-4"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                  <td className="p-4 text-text-muted">{formatDate(p.payment_date)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDownloadInvoice(p.id)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </TableCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
