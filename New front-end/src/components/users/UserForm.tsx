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
  const [genderOpen, setGenderOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);

  if (!editId || !existing) {
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
      if (!editId) {
        addToast("Create user is not available", "error");
        return;
      }
      const updated = updateManagedUser(editId, form, editor);
      if (!updated) {
        addToast("Update failed", "error");
        return;
      }
      addToast("User updated", "success");
      bumpRefresh();
      router.push(`/profile/${editId}`);
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
          <PageHeader title="Edit User" />
          <p className="text-sm text-text-muted mt-1">Update account details.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
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
          <div className="relative">
            <label className={labelClass}>Gender</label>
            <button
              type="button"
              onClick={() => setGenderOpen(!genderOpen)}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer"
              )}
            >
              <span>{form.gender || "Select gender"}</span>
              <MaterialIcon name={genderOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />
            </button>

            {genderOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setGenderOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        patch("gender", g);
                        setGenderOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                        form.gender === g && "bg-primary-fixed/20 font-medium"
                      )}
                    >
                      <span className="flex-1 truncate">{g}</span>
                      {form.gender === g && <MaterialIcon name="check" size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
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
          <div className="relative">
            <label className={labelClass}>Role</label>
            <button
              type="button"
              onClick={() => setRoleOpen(!roleOpen)}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer"
              )}
            >
              <span>{USER_ROLES.find(r => r.value === form.role)?.label || form.role}</span>
              <MaterialIcon name={roleOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />
            </button>

            {roleOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  {USER_ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        patch("role", r.value as UserFormData["role"]);
                        setRoleOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                        form.role === r.value && "bg-primary-fixed/20 font-medium"
                      )}
                    >
                      <span className="flex-1 truncate">{r.label}</span>
                      {form.role === r.value && <MaterialIcon name="check" size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <label className={labelClass}>Status</label>
            <button
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer"
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  form.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                {form.status === "active" ? "Active" : "Inactive"}
              </span>
              <MaterialIcon name={statusOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />
            </button>

            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      patch("status", "active");
                      setStatusOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                      form.status === "active" && "bg-primary-fixed/20 font-medium"
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="flex-1">Active</span>
                    {form.status === "active" && <MaterialIcon name="check" size={16} className="text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      patch("status", "inactive");
                      setStatusOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                      form.status === "inactive" && "bg-primary-fixed/20 font-medium"
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="flex-1">Inactive</span>
                    {form.status === "inactive" && <MaterialIcon name="check" size={16} className="text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <label className={labelClass}>Subscription plan</label>
            <button
              type="button"
              onClick={() => setPlanOpen(!planOpen)}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer"
              )}
            >
              <span>{plans.find(p => p.id === form.subscription_plan_id)?.plan_name || "Select plan"}</span>
              <MaterialIcon name={planOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />
            </button>

            {planOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPlanOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        patch("subscription_plan_id", p.id);
                        setPlanOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                        form.subscription_plan_id === p.id && "bg-primary-fixed/20 font-medium"
                      )}
                    >
                      <span className="flex-1 truncate">{p.plan_name}</span>
                      {form.subscription_plan_id === p.id && <MaterialIcon name="check" size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <label className={labelClass}>Assigned doctor</label>
            <button
              type="button"
              onClick={() => setDoctorOpen(!doctorOpen)}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer"
              )}
            >
              <span>{form.assigned_doctor || "Unassigned"}</span>
              <MaterialIcon name={doctorOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />
            </button>

            {doctorOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDoctorOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      patch("assigned_doctor", "");
                      setDoctorOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                      !form.assigned_doctor && "bg-primary-fixed/20 font-medium"
                    )}
                  >
                    <span className="flex-1 truncate text-text-muted">Unassigned</span>
                    {!form.assigned_doctor && <MaterialIcon name="check" size={16} className="text-primary" />}
                  </button>
                  {DOCTORS.filter((d) => d !== "Unassigned").map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        patch("assigned_doctor", d);
                        setDoctorOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                        form.assigned_doctor === d && "bg-primary-fixed/20 font-medium"
                      )}
                    >
                      <span className="flex-1 truncate">{d}</span>
                      {form.assigned_doctor === d && <MaterialIcon name="check" size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
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
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
