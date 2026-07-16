"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  BillingCycle,
  PlanFormData,
  PlanStatus,
} from "@/data/subscriptionPlansData";
import {
  clearPlanDraftStorage,
  persistPlan,
  resolveInitialForm,
  savePlanDraftToStorage,
} from "@/lib/subscriptionPlansService";
import {
  FieldErrors,
  hasValidationErrors,
  validatePlanForm,
} from "@/lib/subscriptionPlansValidation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: PlanStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Inactive" },
];

const BILLING_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const LIMIT_FIELDS = [
  ["report_upload_limit", "Report Limit"],
  ["max_family_members", "Max family members"],
  ["daily_ai_requests", "Chat limit"],
] as const;

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors disabled:bg-surface-elevated disabled:cursor-default disabled:text-text";
const labelClass = "block text-xs font-semibold text-text-muted mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";
const sectionClass = "rounded-xl border border-outline-variant/50 bg-surface-card p-5 sm:p-6 space-y-4";

type Props = { editId?: number };

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/40">
      <div className="h-9 w-9 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
        <MaterialIcon name={icon} size={20} />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  );
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeForm(data: PlanFormData): PlanFormData {
  const billing =
    data.pricing.billing_cycle === "weekly" ||
    data.pricing.billing_cycle === "monthly" ||
    data.pricing.billing_cycle === "yearly"
      ? data.pricing.billing_cycle
      : "monthly";
  return {
    ...data,
    status: data.status === "active" ? "active" : "disabled",
    pricing: {
      ...data.pricing,
      billing_cycle: billing,
      currency: data.pricing.currency || "INR",
    },
  };
}

export function PlanForm({ editId }: Props) {
  const router = useRouter();
  const { addToast, bumpRefresh, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const [editing, setEditing] = useState(!editId);
  const [form, setForm] = useState<PlanFormData>(() => normalizeForm(resolveInitialForm(editId)));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTouched = useRef(!!editId);

  const patch = useCallback(<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => {
    if (!editing) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, [editing]);

  useEffect(() => {
    if (!editing || !dirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      savePlanDraftToStorage(form, editId);
      addToast("Draft autosaved", "info");
    }, 2500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, dirty, editId, addToast, editing]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty && editing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, editing]);

  function attemptLeave(href: string) {
    if (!dirty || !editing) {
      router.push(href);
      return;
    }
    setPendingHref(href);
    setConfirmLeave(true);
  }

  function onNameChange(name: string) {
    if (!editing) return;
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched.current ? prev.slug : slugify(name),
      internal_code: slugTouched.current
        ? prev.internal_code
        : `SV_${slugify(name).toUpperCase().replace(/-/g, "_")}`,
    }));
    setDirty(true);
  }

  function handleAddFeature() {
    if (!newFeatureText.trim()) return;
    const key = `special_feature_${Date.now()}`;
    const newFeatureItem = {
      key,
      enabled: true,
      customLabel: newFeatureText.trim(),
    };
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureItem],
    }));
    setNewFeatureText("");
    setDirty(true);
  }

  function handleRemoveFeature(key: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.key !== key),
    }));
    setDirty(true);
  }

  function handleSave() {
    const next = normalizeForm(form);
    const errs = validatePlanForm(next);
    setErrors(errs);
    if (hasValidationErrors(errs)) {
      addToast("Please fix validation errors", "error");
      return;
    }
    setSaving(true);
    try {
      const saved = persistPlan(next, editor, editId);
      if (!saved) {
        addToast("Failed to save plan", "error");
        return;
      }
      clearPlanDraftStorage();
      setDirty(false);
      bumpRefresh();
      addToast(editId ? "Plan updated" : "Plan created", "success");
      router.push("/subscriptions");
    } finally {
      setSaving(false);
    }
  }

  const title = !editId ? "Create Plan" : editing ? "Edit Plan" : "Plan Details";
  const subtitle = !editId
    ? "Define name, pricing, and usage limits."
    : editing
      ? "Update plan details, pricing, and limits."
      : "Review this subscription plan.";

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => attemptLeave("/subscriptions")}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text mb-2"
          >
            <MaterialIcon name="arrow_back" size={16} />
            Back to plans
          </button>
          <PageHeader title={title} />
          <p className="text-sm text-text-muted mt-1">
            {subtitle}
            {editing && dirty && <span className="ml-2 text-amber-600 font-medium">Unsaved changes</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editId && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg bg-primary text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container inline-flex items-center gap-1.5"
            >
              <MaterialIcon name="edit" size={16} />
              Edit
            </button>
          ) : (
            <>
              <Link
                href="/subscriptions"
                onClick={(e) => {
                  if (dirty) {
                    e.preventDefault();
                    attemptLeave("/subscriptions");
                  }
                }}
                className="rounded-lg border border-outline-variant px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-primary text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container disabled:opacity-50"
              >
                {saving ? "Saving…" : editId ? "Save Changes" : "Create Plan"}
              </button>
            </>
          )}
        </div>
      </div>

      <section className={sectionClass}>
        <SectionTitle icon="info" title="Plan details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Plan name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => onNameChange(e.target.value)} disabled={!editing} />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>
          <div className="relative">
            <label className={labelClass}>Status</label>
            <button
              type="button"
              onClick={() => editing && setStatusOpen(!statusOpen)}
              disabled={!editing}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer",
                !editing && "cursor-default bg-surface-elevated"
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  form.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                {form.status === "active" ? "Active" : "Inactive"}
              </span>
              {editing && <MaterialIcon name={statusOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />}
            </button>

            {statusOpen && editing && (
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
                      patch("status", "disabled");
                      setStatusOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                      form.status !== "active" && "bg-primary-fixed/20 font-medium"
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="flex-1">Inactive</span>
                    {form.status !== "active" && <MaterialIcon name="check" size={16} className="text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={cn(inputClass, "min-h-[88px] resize-y")}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              disabled={!editing}
              placeholder="Short summary of what this plan includes"
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle icon="payments" title="Pricing" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price *</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.pricing.price}
              onChange={(e) => patch("pricing", { ...form.pricing, price: Number(e.target.value) })}
              disabled={!editing}
            />
            {errors.price && <p className={errorClass}>{errors.price}</p>}
          </div>
          <div className="relative">
            <label className={labelClass}>Billing cycle</label>
            <button
              type="button"
              onClick={() => editing && setCycleOpen(!cycleOpen)}
              disabled={!editing}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer",
                !editing && "cursor-default bg-surface-elevated"
              )}
            >
              <span>{BILLING_OPTIONS.find(c => c.value === form.pricing.billing_cycle)?.label || form.pricing.billing_cycle || "Select billing cycle"}</span>
              {editing && <MaterialIcon name={cycleOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />}
            </button>

            {cycleOpen && editing && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCycleOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  {BILLING_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        patch("pricing", { ...form.pricing, billing_cycle: c.value });
                        setCycleOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                        form.pricing.billing_cycle === c.value && "bg-primary-fixed/20 font-medium"
                      )}
                    >
                      <span className="flex-1 truncate">{c.label}</span>
                      {form.pricing.billing_cycle === c.value && <MaterialIcon name="check" size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle icon="tune" title="Limits" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LIMIT_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.limits[key]}
                onChange={(e) => patch("limits", { ...form.limits, [key]: Number(e.target.value) })}
                disabled={!editing}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle icon="star" title="Special Features" />
        <div className="space-y-4">
          {editing && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new special feature (e.g. Free Smart Band)"
                className={inputClass}
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-primary text-white text-xs font-semibold uppercase px-5 py-2.5 rounded-lg hover:bg-primary-container shrink-0"
              >
                Add
              </button>
            </div>
          )}

          {/* List of Special Features */}
          <div className="space-y-2">
            {form.features
              .filter((f) => f.key.startsWith("special_feature_"))
              .map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/40 p-3 bg-surface"
                >
                  <span className="text-sm font-medium">{feature.customLabel || feature.key}</span>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature.key)}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Remove feature"
                    >
                      <MaterialIcon name="delete" size={18} />
                    </button>
                  )}
                </div>
              ))}
            {form.features.filter((f) => f.key.startsWith("special_feature_")).length === 0 && (
              <p className="text-xs text-text-muted italic">No special features added yet.</p>
            )}
          </div>
        </div>
      </section>

      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Unsaved changes" size="sm">
        <p className="text-sm text-text-muted mb-4">Leave without saving? Your draft is autosaved locally.</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setConfirmLeave(false)}
            className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={() => {
              setDirty(false);
              setConfirmLeave(false);
              if (pendingHref) router.push(pendingHref);
            }}
            className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          >
            Leave
          </button>
        </div>
      </Modal>
    </div>
  );
}
