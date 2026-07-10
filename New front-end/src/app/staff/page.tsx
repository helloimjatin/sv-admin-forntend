"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard, Badge, FilterPills, SearchBar, DataTable, Modal, TableCard } from "@/components/ui/Primitives";
import { staff, addStaffMember, updateStaffMember, deleteStaffMember } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/lib/utils";
import { Users, Shield, MessageSquare, Eye } from "lucide-react";

const ROLES = ["Admin", "Moderator", "Support"];

export default function StaffPage() {
  const { addToast, bumpRefresh, refreshKey } = useApp();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", username: "", email: "", role: "Admin", password: "" });

  const stats = {
    total: staff.length,
    admins: staff.filter((s) => s.role === "Admin" || s.role === "Super Admin").length,
    moderators: staff.filter((s) => s.role === "Moderator").length,
    support: staff.filter((s) => s.role === "Support").length,
  };

  const filtered = staff.filter((s) => {
    if (filter === "admins" && !["Admin", "Super Admin"].includes(s.role)) return false;
    if (filter === "moderators" && s.role !== "Moderator") return false;
    if (filter === "support" && s.role !== "Support") return false;
    if (query) {
      const q = query.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.username || "").includes(q);
    }
    return true;
  });

  const roleVariant = (r: string) => {
    if (r === "Super Admin") return "purple";
    if (r === "Admin") return "success";
    if (r === "Moderator") return "info";
    return "default";
  };

  const openAdd = () => { setForm({ name: "", username: "", email: "", role: "Admin", password: "" }); setModal("add"); };
  const openEdit = (s: typeof staff[0]) => { setEditId(s.id); setForm({ name: s.name, username: s.username || "", email: s.email, role: s.role, password: "" }); setModal("edit"); };

  const handleSave = () => {
    if (modal === "add") { addStaffMember(form); addToast("Staff member created successfully"); }
    else if (modal === "edit" && editId) { updateStaffMember(editId, { name: form.name, username: form.username, email: form.email, role: form.role }); addToast("Staff member updated"); }
    setModal(null); bumpRefresh();
  };

  const handleDelete = () => {
    if (editId) { deleteStaffMember(editId); addToast("Staff member permanently deactivated", "info"); }
    setModal(null); bumpRefresh();
  };

  const deleteTarget = staff.find((s) => s.id === editId);

  return (
    <AuthGuard roles={["Super Admin"]}>
      <DashboardLayout title="Staff Directory" subtitle="Administrative access controls">
        <div className="space-y-6" key={refreshKey}>
          <div className="flex justify-end -mt-2">
            <button onClick={openAdd} className="bg-primary text-white text-xs font-semibold uppercase px-6 py-2.5 rounded-lg hover:bg-primary-container shrink-0">Add New Staff Member</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Staff" value={stats.total} icon={Users} color="brand" />
            <StatCard label="Admins" value={stats.admins} icon={Shield} color="green" />
            <StatCard label="Moderators" value={stats.moderators} icon={Eye} color="indigo" />
            <StatCard label="Support" value={stats.support} icon={MessageSquare} color="sky" />
          </div>
          <TableCard
            title="Administrative Access Controls"
            toolbar={<div className="w-full md:w-64"><SearchBar value={search} onChange={setSearch} onSearch={() => setQuery(search)} placeholder="Search staff..." /></div>}
            filters={<FilterPills options={[{ label: "All Roles", value: "all" }, { label: "Admins", value: "admins" }, { label: "Moderators", value: "moderators" }, { label: "Support", value: "support" }]} active={filter} onChange={setFilter} />}
          >
            <DataTable headers={["Name", "Email", "Role", "Last Login", "Actions"]}>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 font-mono text-xs text-text-muted">{s.email}</td>
                  <td className="p-4"><Badge variant={roleVariant(s.role)}>{s.role}</Badge></td>
                  <td className="p-4 text-text-muted text-sm">{formatDateTime(s.last_login)}</td>
                  <td className="p-4 space-x-2 text-xs font-semibold">
                    <button onClick={() => openEdit(s)} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => { setEditId(s.id); setModal("delete"); }} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </TableCard>
        </div>

        <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "add" ? "Add Staff Member" : "Edit Staff Member"}>
          <div className="space-y-4">
            {[{ k: "name", l: "Name" }, { k: "username", l: "Username" }, { k: "email", l: "Email" }].map(({ k, l }) => (
              <div key={k}><label className="text-sm font-semibold">{l}</label>
                <input value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-outline-variant px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            ))}
            <div><label className="text-sm font-semibold">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full rounded-lg border border-outline-variant px-4 py-2.5 text-sm outline-none">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select></div>
            {modal === "add" && <div><label className="text-sm font-semibold">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-lg border border-outline-variant px-4 py-2.5 text-sm outline-none" /></div>}
            <button onClick={handleSave} className="w-full rounded-lg bg-primary text-white py-2.5 text-sm font-semibold">Save</button>
          </div>
        </Modal>
        <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Deactivate Staff Member">
          <p className="text-sm text-text-muted mb-4"><strong>{deleteTarget?.name}</strong> will be permanently deactivated and lose all administrative access.</p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Cancel</button>
            <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 text-white py-2.5 text-sm font-semibold">Deactivate</button>
          </div>
        </Modal>
      </DashboardLayout>
    </AuthGuard>
  );
}
