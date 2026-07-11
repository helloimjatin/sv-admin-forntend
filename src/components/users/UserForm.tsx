"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  ACCOUNT_STATUSES,
  DOCTORS,
  GENDERS,
  USER_ROLES,
  UserFormData,
  createManagedUser,
  getDefaultUserForm,
  getManagedUser,
  updateManagedUser,
  userToForm,
} from "@/data/userManagementData";
import { plans } from "@/data/mockData";
import { FieldErrors, hasValidationErrors, validateUserForm } from "@/lib/userManagementValidation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";
const sectionClass = "rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4";

type Props = { editId?: number };

export function UserForm({ editId }: Props) {
  const router = useRouter();
  const { addToast, bumpRefresh, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const existing = editId ? getManagedUser(editId) : null;
  const [form, setForm] = useState<UserFormData>(() => (existing ? userToForm(existing) : getDefaultUserForm()));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  if (editId && !existing) {
    return (
      <div className="text-center py-16 text-text-muted">
        <MaterialIcon name="error" size={40} className="text-red-500 mb-3" />
        <p>User not found.</p>
        <Link href="/users" className="text-primary font-semibold mt-3 inline-block">← Back to Users</Link>
      </div>
    );
  }

  function patch<K extends keyof UserFormData>(key: K, value: UserFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateUserForm(form);
    setErrors(errs);
    if (hasValidationErrors(errs)) {
      addToast("Please fix validation errors", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updated = updateManagedUser(editId, form, editor);
        if (!updated) {
          addToast("Update failed", "error");
          return;
        }
        addToast("User updated", "success");
        bumpRefresh();
        router.push(`/profile/${editId}`);
      } else {
        const created = createManagedUser(form, editor);
        addToast(`User ${created.full_name} created`, "success");
        bumpRefresh();
        router.push(`/profile/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/users" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text mb-2">
            <MaterialIcon name="arrow_back" size={16} /> Back to users
          </Link>
          <PageHeader title={editId ? "Edit User" : "Create User"} />
          <p className="text-sm text-text-muted mt-1">
            {editId ? "Update account details." : "Register a new patient account."}
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container disabled:opacity-50"
        >
          {saving ? "Saving…" : editId ? "Save Changes" : "Create User"}
        </button>
      </div>

      <section className={sectionClass}>
        <h2 className="text-base font-semibold border-b border-outline-variant/40 pb-2">Basic details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Full name *</label>
            <input className={inputClass} value={form.full_name} onChange={(e) => patch("full_name", e.target.value)} />
            {errors.full_name && <p className={errorClass}>{errors.full_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => patch("email", e.target.value)} />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
          <div>
            <label className={labelClass}>Mobile *</label>
            <input className={inputClass} value={form.mobile} onChange={(e) => patch("mobile", e.target.value)} placeholder="+91 9XXXXXXXXX" />
            {errors.mobile && <p className={errorClass}>{errors.mobile}</p>}
          </div>
          <div>
            <label className={labelClass}>Date of birth</label>
            <input type="date" className={inputClass} value={form.dob} onChange={(e) => patch("dob", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select className={inputClass} value={form.gender} onChange={(e) => patch("gender", e.target.value)}>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={form.city} onChange={(e) => patch("city", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input className={inputClass} value={form.state} onChange={(e) => patch("state", e.target.value)} />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-base font-semibold border-b border-outline-variant/40 pb-2">Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Role</label>
            <select className={inputClass} value={form.role} onChange={(e) => patch("role", e.target.value as UserFormData["role"])}>
              {USER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => patch("status", e.target.value as UserFormData["status"])}>
              {ACCOUNT_STATUSES.filter((s) => s.value !== "deleted").map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Subscription plan</label>
            <select className={inputClass} value={form.subscription_plan_id} onChange={(e) => patch("subscription_plan_id", Number(e.target.value))}>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Assigned doctor</label>
            <select className={inputClass} value={form.assigned_doctor} onChange={(e) => patch("assigned_doctor", e.target.value)}>
              <option value="">Unassigned</option>
              {DOCTORS.filter((d) => d !== "Unassigned").map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 pb-8">
        <Link href="/users" className="rounded-lg border border-outline-variant px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container disabled:opacity-50"
        >
          {saving ? "Saving…" : editId ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );
}
