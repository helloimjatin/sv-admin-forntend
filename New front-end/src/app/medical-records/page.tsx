"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard, Badge, FilterPills, SearchBar, DataTable, Modal, TableCard } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { medicalRecords } from "@/data/mockData";
import { getMedicalAnalysis } from "@/lib/medicalAnalysis";
import { formatDate, normalizeRisk } from "@/lib/utils";
import { FileText, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

function riskBadgeVariant(risk: string) {
  if (risk === "high") return "danger";
  if (risk === "medium") return "warning";
  return "success";
}

function riskLabel(risk: string) {
  if (risk === "high") return "High";
  if (risk === "medium") return "Medium";
  return "Normal";
}

export default function MedicalRecordsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<typeof medicalRecords[0] | null>(null);

  const stats = {
    total: medicalRecords.length,
    high: medicalRecords.filter((r) => normalizeRisk(r.risk_level) === "high").length,
    medium: medicalRecords.filter((r) => normalizeRisk(r.risk_level) === "medium").length,
    normal: medicalRecords.filter((r) => !["high", "medium"].includes(normalizeRisk(r.risk_level))).length,
  };

  const filtered = medicalRecords.filter((r) => {
    const risk = normalizeRisk(r.risk_level);
    if (filter === "high" && risk !== "high") return false;
    if (filter === "medium" && risk !== "medium") return false;
    if (filter === "normal" && ["high", "medium"].includes(risk)) return false;
    if (query) {
      const q = query.toLowerCase();
      return r.patient_name.toLowerCase().includes(q) || r.report_type.toLowerCase().includes(q);
    }
    return true;
  });

  const analysis = selected ? getMedicalAnalysis(selected) : null;

  return (
    <AuthGuard>
      <DashboardLayout title="Medical Records" subtitle="Patient diagnostic library and AI analysis">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Reports" value={stats.total} icon={FileText} color="brand" />
            <StatCard label="High Risk" value={stats.high} icon={AlertTriangle} color="red" valueClassName="text-red-600" />
            <StatCard label="Medium Risk" value={stats.medium} icon={AlertCircle} color="amber" valueClassName="text-amber-700" />
            <StatCard label="Normal / Healthy" value={stats.normal} icon={CheckCircle} color="green" valueClassName="text-green-700" />
          </div>
          <TableCard
            title="Patient Diagnostic Library"
            toolbar={<div className="w-full md:w-72"><SearchBar value={search} onChange={setSearch} onSearch={() => setQuery(search)} placeholder="Search records..." /></div>}
            filters={<FilterPills options={[{ label: "All Records", value: "all" }, { label: "High Risk", value: "high" }, { label: "Medium Risk", value: "medium" }, { label: "Normal", value: "normal" }]} active={filter} onChange={setFilter} />}
          >
            <DataTable headers={["Report ID", "Patient Name", "Account Holder", "Test Type", "Risk Assessment", "Date Uploaded", "Actions"]}>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-mono text-xs text-primary font-semibold">#REP-{String(r.id).padStart(4, "0")}</td>
                  <td className="p-4 font-semibold">{r.patient_name}</td>
                  <td className="p-4 text-text-muted font-semibold">{r.account_holder}</td>
                  <td className="p-4"><span className="inline-flex px-2 py-0.5 rounded border border-outline-variant/50 text-[11px] font-bold text-text-muted">{r.report_type}</span></td>
                  <td className="p-4"><Badge variant={riskBadgeVariant(normalizeRisk(r.risk_level))}>{riskLabel(normalizeRisk(r.risk_level))}</Badge></td>
                  <td className="p-4 text-text-muted">{formatDate(r.created_at)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelected(r)} className="text-primary text-xs font-semibold hover:underline inline-flex items-center gap-1">
                      <MaterialIcon name="visibility" size={16} /> View Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </TableCard>
        </div>

        <Modal open={!!selected} onClose={() => setSelected(null)} title="Clinical Analysis Report" size="xl">
          {selected && analysis && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[["Test Type", selected.report_type], ["Account Holder", selected.account_holder], ["Risk Level", riskLabel(normalizeRisk(selected.risk_level))], ["Date Uploaded", formatDate(selected.created_at)]].map(([k, v]) => (
                  <div key={k}><p className="text-xs text-text-muted">{k}</p><p className="font-semibold mt-0.5">{v}</p></div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 border-b border-outline-variant/30 pb-2"><MaterialIcon name="labs" size={20} className="text-primary" /> Biomarkers & Test Indicators</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.biomarkers.map((b) => (
                    <div key={b.name} className="rounded-lg border border-outline-variant/40 p-3 flex justify-between">
                      <div><p className="text-sm font-medium">{b.name}</p><p className="text-xs text-text-muted">Ref: {b.ref}</p></div>
                      <div className="text-right"><p className="font-mono text-sm font-semibold">{b.value}</p><Badge variant={b.status.toLowerCase() === "high" || b.status.toLowerCase() === "low" ? "warning" : "success"}>{b.status}</Badge></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-primary-fixed/50 bg-primary-fixed/20 p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2 text-on-primary-fixed"><MaterialIcon name="smart_toy" size={20} /> Automated Clinical Insight</h4>
                <p className="text-sm text-text-muted leading-relaxed">{analysis.aiSummary}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 border-b border-outline-variant/30 pb-2"><MaterialIcon name="verified" size={20} className="text-teal-600" /> Recommended Actions</h4>
                <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">{analysis.recommendations.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/50">
                <button onClick={() => setSelected(null)} className="bg-secondary-fixed text-text px-6 py-2.5 rounded-lg text-xs font-semibold">Close</button>
                <button onClick={() => window.print()} className="bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"><MaterialIcon name="print" size={18} /> Print Report</button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </AuthGuard>
  );
}
