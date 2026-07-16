"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge, FilterPills, SearchBar, TableCard, MethodBadge } from "@/components/ui/Primitives";
import { SortableTh, TablePagination, compareValues } from "@/components/ui/TableControls";
import { payments } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { formatDate, formatCurrency } from "@/lib/utils";

type SortKey = "transaction_id" | "customer_name" | "amount" | "payment_method" | "status" | "payment_date";

const TABLE_HEADERS: { key: SortKey | "actions"; label: string; sortable?: boolean }[] = [
  { key: "transaction_id", label: "Transaction ID", sortable: true },
  { key: "customer_name", label: "Customer", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "payment_method", label: "Method", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "payment_date", label: "Date", sortable: true },
  { key: "actions", label: "Actions" },
];

export default function BillingPage() {
  const { addToast } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("payment_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = payments.filter((p) => {
      if (filter === "captured" && !["captured", "completed", "success"].includes(p.status)) return false;
      if (filter === "pending" && p.status !== "pending") return false;
      if (filter === "failed" && p.status !== "failed") return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.customer_name.toLowerCase().includes(q) ||
          p.transaction_id.toLowerCase().includes(q) ||
          String(p.id).includes(q)
        );
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const av =
        sortKey === "transaction_id"
          ? a.transaction_id || String(a.id)
          : sortKey === "payment_method"
            ? a.payment_method || ""
            : a[sortKey];
      const bv =
        sortKey === "transaction_id"
          ? b.transaction_id || String(b.id)
          : sortKey === "payment_method"
            ? b.payment_method || ""
            : b[sortKey];
      return compareValues(av, bv, sortDir);
    });
  }, [filter, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const statusVariant = (s: string) => {
    if (["captured", "completed", "success"].includes(s)) return "success" as const;
    if (s === "pending") return "warning" as const;
    return "danger" as const;
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
              type="button"
              onClick={handleExport}
              className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase hover:bg-surface-elevated"
            >
              Export CSV
            </button>
          </div>
          <TableCard
            title="Transaction Ledger"
            toolbar={
              <div className="w-full md:w-72">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onSearch={() => { setQuery(search); setPage(1); }}
                  placeholder="Search transactions..."
                />
              </div>
            }
            filters={
              <FilterPills
                options={[
                  { label: "All", value: "all" },
                  { label: "Captured", value: "captured" },
                  { label: "Pending", value: "pending" },
                  { label: "Failed", value: "failed" },
                ]}
                active={filter}
                onChange={(v) => { setFilter(v); setPage(1); }}
              />
            }
          >
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-muted">No matching transactions</div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
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
                      {paginated.map((p) => (
                        <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                          <td className="p-4 font-mono text-xs text-primary font-semibold">{p.transaction_id || `#${p.id}`}</td>
                          <td className="p-4 font-medium">{p.customer_name}</td>
                          <td className="p-4 font-semibold font-mono">{formatCurrency(p.amount)}</td>
                          <td className="p-4"><MethodBadge method={p.payment_method || "UPI"} /></td>
                          <td className="p-4"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                          <td className="p-4 text-text-muted">{formatDate(p.payment_date)}</td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(p.id)}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  id="billing-rows-per-page"
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
      </DashboardLayout>
    </AuthGuard>
  );
}
