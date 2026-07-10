"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  BILLING_CYCLES,
  DISPLAY_COLORS,
  FEATURE_CATALOG,
  FEATURE_CATEGORY_LABELS,
  FeatureCategory,
  PLAN_BADGES,
  PLAN_STATUSES,
  PlanFormData,
  REGION_OPTIONS,
  VISIBILITY_OPTIONS,
  getDefaultPlanForm,
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
  const [customFeature, setCustomFeature] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTouched = useRef(!!editId);

  const categories = useMemo(() => {
    const map = new Map<FeatureCategory, typeof FEATURE_CATALOG>();
    for (const f of FEATURE_CATALOG) {
      const list = map.get(f.category) || [];
      list.push(f);
      map.set(f.category, list);
    }
    const custom = form.features.filter((f) => f.key.startsWith("custom_"));
    return { map, custom };
  }, [form.features]);

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

  function addCustomFeature() {
    const label = customFeature.trim();
    if (!label) return;
    const key = `custom_${Date.now()}`;
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { key, enabled: true, customLabel: label }],
    }));
    setCustomFeature("");
    setDirty(true);
  }

  function togglePlatform(platform: "android" | "ios" | "web") {
    setForm((prev) => {
      const has = prev.visibility.platforms.includes(platform);
      return {
        ...prev,
        visibility: {
          ...prev.visibility,
          platforms: has
            ? prev.visibility.platforms.filter((p) => p !== platform)
            : [...prev.visibility.platforms, platform],
        },
      };
    });
    setDirty(true);
  }

  function toggleRegion(region: string) {
    setForm((prev) => {
      const has = prev.visibility.regions.includes(region);
      return {
        ...prev,
        visibility: {
          ...prev.visibility,
          regions: has
            ? prev.visibility.regions.filter((r) => r !== region)
            : [...prev.visibility.regions, region],
        },
      };
    });
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

  function resetDefaults() {
    setForm(getDefaultPlanForm());
    setDirty(true);
    setErrors({});
    addToast("Reset to defaults", "info");
  }

  return (
    <div className="space-y-6 max-w-5xl">
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
          <PageHeader title={editId ? "Edit Plan" : "Create New Plan"} />
          <p className="text-sm text-text-muted mt-1">
            Configure pricing, limits, features, visibility, and subscription rules.
            {dirty && <span className="ml-2 text-amber-600 font-medium">Unsaved changes</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated"
          >
            Reset
          </button>
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

      {/* General */}
      <section className={sectionClass}>
        <SectionTitle icon="info" title="General Information" description="Name, slug, badge, and display settings" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Plan Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => onNameChange(e.target.value)} />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Plan Slug</label>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                slugTouched.current = true;
                patch("slug", e.target.value);
              }}
            />
            {errors.slug && <p className={errorClass}>{errors.slug}</p>}
          </div>
          <div>
            <label className={labelClass}>Internal Code</label>
            <input className={inputClass} value={form.internal_code} onChange={(e) => patch("internal_code", e.target.value)} />
            {errors.internal_code && <p className={errorClass}>{errors.internal_code}</p>}
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
              className={cn(inputClass, "min-h-[88px] resize-y")}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
            />
            {errors.description && <p className={errorClass}>{errors.description}</p>}
          </div>
          <div>
            <label className={labelClass}>Icon (Material Symbol)</label>
            <input className={inputClass} value={form.icon} onChange={(e) => patch("icon", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Display Color</label>
            <select className={inputClass} value={form.display_color} onChange={(e) => patch("display_color", e.target.value)}>
              {DISPLAY_COLORS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={sectionClass}>
        <SectionTitle icon="payments" title="Pricing" description="List price, discounts, trial, and tax" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price</label>
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
            <label className={labelClass}>Discounted Price</label>
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
            {errors.discounted_price && <p className={errorClass}>{errors.discounted_price}</p>}
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
              <option value="AED">AED</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Billing Cycle</label>
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
              {BILLING_CYCLES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          {form.pricing.billing_cycle === "custom" && (
            <div>
              <label className={labelClass}>Custom Cycle Days</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.pricing.custom_cycle_days ?? ""}
                onChange={(e) =>
                  patch("pricing", { ...form.pricing, custom_cycle_days: Number(e.target.value) })
                }
              />
              {errors.custom_cycle_days && <p className={errorClass}>{errors.custom_cycle_days}</p>}
            </div>
          )}
          <div>
            <label className={labelClass}>Trial Days</label>
            <input
              type="number"
              min={0}
              max={90}
              className={inputClass}
              value={form.pricing.trial_days}
              onChange={(e) => patch("pricing", { ...form.pricing, trial_days: Number(e.target.value) })}
            />
            {errors.trial_days && <p className={errorClass}>{errors.trial_days}</p>}
          </div>
          <div>
            <label className={labelClass}>Setup Fee</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.pricing.setup_fee}
              onChange={(e) => patch("pricing", { ...form.pricing, setup_fee: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass}>Renewal Price</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.pricing.renewal_price ?? ""}
              onChange={(e) =>
                patch("pricing", {
                  ...form.pricing,
                  renewal_price: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Tax %</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={form.pricing.tax_percent}
              onChange={(e) => patch("pricing", { ...form.pricing, tax_percent: Number(e.target.value) })}
            />
            {errors.tax_percent && <p className={errorClass}>{errors.tax_percent}</p>}
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="tax_inclusive"
              type="checkbox"
              checked={form.pricing.tax_inclusive}
              onChange={(e) => patch("pricing", { ...form.pricing, tax_inclusive: e.target.checked })}
              className="rounded border-outline-variant"
            />
            <label htmlFor="tax_inclusive" className="text-sm">Tax inclusive pricing</label>
          </div>
        </div>
      </section>

      {/* Limits */}
      <section className={sectionClass}>
        <SectionTitle icon="tune" title="Plan Limits" description="Entitlement caps for devices, AI, and storage" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            [
              ["max_devices", "Maximum Devices"],
              ["max_family_members", "Maximum Family Members"],
              ["daily_ai_requests", "Daily AI Requests"],
              ["monthly_ai_requests", "Monthly AI Requests"],
              ["consultation_credits", "Consultation Credits"],
              ["ai_credits", "AI Credits"],
              ["storage_limit_mb", "Storage Limit (MB)"],
              ["report_upload_limit", "Report Upload Limit"],
              ["appointment_limit", "Appointment Limit"],
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
              {errors[key] && <p className={errorClass}>{errors[key]}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={sectionClass}>
        <SectionTitle icon="toggle_on" title="Feature Management" description="Toggle entitlements by category" />
        {Array.from(categories.map.entries()).map(([cat, features]) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              {FEATURE_CATEGORY_LABELS[cat]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {features.map((f) => {
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
          </div>
        ))}
        {categories.custom.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Custom</p>
            <div className="space-y-2 mb-4">
              {categories.custom.map((f) => (
                <label
                  key={f.key}
                  className="flex items-center gap-3 rounded-lg border border-outline-variant/50 px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    checked={f.enabled}
                    onChange={() => toggleFeature(f.key)}
                    className="rounded border-outline-variant"
                  />
                  <span className="text-sm">{f.customLabel || f.key}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Add custom feature…"
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomFeature())}
          />
          <button
            type="button"
            onClick={addCustomFeature}
            className="rounded-lg border border-outline-variant px-4 text-xs font-semibold uppercase tracking-wide shrink-0 hover:bg-surface-elevated"
          >
            Add
          </button>
        </div>
      </section>

      {/* Visibility */}
      <section className={sectionClass}>
        <SectionTitle icon="visibility" title="Visibility Settings" description="Who can see and buy this plan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Visibility</label>
            <select
              className={inputClass}
              value={form.visibility.visibility}
              onChange={(e) =>
                patch("visibility", {
                  ...form.visibility,
                  visibility: e.target.value as PlanFormData["visibility"]["visibility"],
                })
              }
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className={labelClass}>Platform Availability</p>
          <div className="flex flex-wrap gap-2">
            {(["android", "ios", "web"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors capitalize",
                  form.visibility.platforms.includes(p)
                    ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
                    : "bg-surface-card text-text-muted border-outline-variant"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {errors.platforms && <p className={errorClass}>{errors.platforms}</p>}
        </div>
        <div>
          <p className={labelClass}>Regional Availability</p>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors",
                  form.visibility.regions.includes(r)
                    ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
                    : "bg-surface-card text-text-muted border-outline-variant"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {errors.regions && <p className={errorClass}>{errors.regions}</p>}
        </div>
      </section>

      {/* Rules */}
      <section className={sectionClass}>
        <SectionTitle icon="rule" title="Subscription Rules" description="Renewal, upgrades, refunds, and proration" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["auto_renewal", "Auto Renewal"],
              ["allow_upgrade", "Allow Upgrades"],
              ["allow_downgrade", "Allow Downgrades"],
              ["refund_eligible", "Refund Eligible"],
              ["prorate_upgrades", "Prorate Upgrades"],
              ["prorate_downgrades", "Prorate Downgrades"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.rules[key]}
                onChange={(e) => patch("rules", { ...form.rules, [key]: e.target.checked })}
                className="rounded border-outline-variant"
              />
              {label}
            </label>
          ))}
          <div>
            <label className={labelClass}>Grace Period (days)</label>
            <input
              type="number"
              min={0}
              max={30}
              className={inputClass}
              value={form.rules.grace_period_days}
              onChange={(e) => patch("rules", { ...form.rules, grace_period_days: Number(e.target.value) })}
            />
            {errors.grace_period_days && <p className={errorClass}>{errors.grace_period_days}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Cancellation Policy</label>
            <textarea
              className={cn(inputClass, "min-h-[72px]")}
              value={form.rules.cancellation_policy}
              onChange={(e) => patch("rules", { ...form.rules, cancellation_policy: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Recommendation */}
      <section className={sectionClass}>
        <SectionTitle icon="star" title="Recommendation Settings" description="Highlight this plan in the storefront" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["is_recommended", "Mark as Recommended"],
              ["is_featured", "Featured Plan"],
              ["is_popular", "Popular Plan"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.recommendation[key]}
                onChange={(e) =>
                  patch("recommendation", { ...form.recommendation, [key]: e.target.checked })
                }
                className="rounded border-outline-variant"
              />
              {label}
            </label>
          ))}
          <div>
            <label className={labelClass}>Display Priority</label>
            <input
              type="number"
              className={inputClass}
              value={form.recommendation.display_priority}
              onChange={(e) =>
                patch("recommendation", {
                  ...form.recommendation,
                  display_priority: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Custom Badge</label>
            <select
              className={inputClass}
              value={form.recommendation.badge}
              onChange={(e) =>
                patch("recommendation", {
                  ...form.recommendation,
                  badge: e.target.value as PlanFormData["recommendation"]["badge"],
                })
              }
            >
              {PLAN_BADGES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
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
