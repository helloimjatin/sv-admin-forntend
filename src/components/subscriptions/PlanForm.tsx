"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  BILLING_CYCLES,
  FEATURE_CATALOG,
  PLAN_STATUSES,
  PlanFormData,
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

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";
const sectionClass = "rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4";

type Props = { editId?: number };

function SectionTitle({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 pb-2 border-b border-outline-variant/40">
      <div className="h-9 w-9 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
        <MaterialIcon name={icon} size={20} />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
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

export function PlanForm({ editId }: Props) {
  const router = useRouter();
  const { addToast, bumpRefresh, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const [form, setForm] = useState<PlanFormData>(() => resolveInitialForm(editId));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTouched = useRef(!!editId);

  const patch = useCallback(<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      savePlanDraftToStorage(form, editId);
      addToast("Draft autosaved", "info");
    }, 2500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, dirty, editId, addToast]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function attemptLeave(href: string) {
    if (!dirty) {
      router.push(href);
      return;
    }
    setPendingHref(href);
    setConfirmLeave(true);
  }

  function onNameChange(name: string) {
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

  function toggleFeature(key: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)),
    }));
    setDirty(true);
  }

  function handleSave(asDraft = false) {
    const next = asDraft ? { ...form, status: "draft" as const } : form;
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

  return (
    <div className="space-y-6 max-w-3xl">
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
          <PageHeader title={editId ? "Edit Plan" : "Create Plan"} />
          <p className="text-sm text-text-muted mt-1">
            Set pricing, limits, and features.
            {dirty && <span className="ml-2 text-amber-600 font-medium">Unsaved changes</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-lg bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container disabled:opacity-50"
          >
            {saving ? "Saving…" : editId ? "Update Plan" : "Publish Plan"}
          </button>
        </div>
      </div>

      <section className={sectionClass}>
        <SectionTitle icon="info" title="Plan details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Plan name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => onNameChange(e.target.value)} />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => patch("status", e.target.value as PlanFormData["status"])}>
              {PLAN_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={cn(inputClass, "min-h-[72px] resize-y")}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.recommendation.is_recommended}
                onChange={(e) =>
                  patch("recommendation", { ...form.recommendation, is_recommended: e.target.checked })
                }
                className="rounded border-outline-variant"
              />
              Mark as recommended plan
            </label>
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
            />
            {errors.price && <p className={errorClass}>{errors.price}</p>}
          </div>
          <div>
            <label className={labelClass}>Discounted price</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.pricing.discounted_price ?? ""}
              onChange={(e) =>
                patch("pricing", {
                  ...form.pricing,
                  discounted_price: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select
              className={inputClass}
              value={form.pricing.currency}
              onChange={(e) => patch("pricing", { ...form.pricing, currency: e.target.value })}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Billing cycle</label>
            <select
              className={inputClass}
              value={form.pricing.billing_cycle}
              onChange={(e) =>
                patch("pricing", {
                  ...form.pricing,
                  billing_cycle: e.target.value as PlanFormData["pricing"]["billing_cycle"],
                })
              }
            >
              {BILLING_CYCLES.filter((c) => c.value !== "custom").map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Trial days</label>
            <input
              type="number"
              min={0}
              max={90}
              className={inputClass}
              value={form.pricing.trial_days}
              onChange={(e) => patch("pricing", { ...form.pricing, trial_days: Number(e.target.value) })}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle icon="tune" title="Limits" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["max_devices", "Max devices"],
              ["max_family_members", "Max family members"],
              ["monthly_ai_requests", "Monthly AI requests"],
              ["consultation_credits", "Consultation credits"],
              ["storage_limit_mb", "Storage (MB)"],
              ["appointment_limit", "Appointment limit"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.limits[key]}
                onChange={(e) => patch("limits", { ...form.limits, [key]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle icon="toggle_on" title="Features" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURE_CATALOG.map((f) => {
            const current = form.features.find((x) => x.key === f.key);
            return (
              <label
                key={f.key}
                className="flex items-center gap-3 rounded-lg border border-outline-variant/50 px-3 py-2.5 hover:bg-surface-elevated cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!current?.enabled}
                  onChange={() => toggleFeature(f.key)}
                  className="rounded border-outline-variant"
                />
                <span className="text-sm">{f.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 justify-end pb-8">
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
          onClick={() => handleSave(false)}
          disabled={saving}
          className="rounded-lg bg-primary text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container disabled:opacity-50"
        >
          {saving ? "Saving…" : editId ? "Update Plan" : "Publish Plan"}
        </button>
      </div>

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
