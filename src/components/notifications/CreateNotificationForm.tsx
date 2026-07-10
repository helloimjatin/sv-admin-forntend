"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { DevicePreview } from "@/components/notifications/DevicePreview";
import {
  AUDIENCE_OPTIONS,
  CATEGORY_OPTIONS,
  NotificationFormData,
  PRIORITY_OPTIONS,
  RECURRENCE_OPTIONS,
  SEGMENT_OPTIONS,
  TIMEZONE_OPTIONS,
  AudienceType,
  campaignToForm,
  estimateRecipientsFromForm,
  getDefaultFormData,
  notificationCampaigns,
} from "@/data/notificationData";
import { users } from "@/data/mockData";
import {
  clearDraftStorage,
  loadDraftFromStorage,
  saveDraft,
  saveDraftToStorage,
  scheduleNotification,
  sendNotificationNow,
  sendTestNotification,
} from "@/lib/notificationService";
import {
  FieldErrors,
  hasValidationErrors,
  validateNotificationForm,
} from "@/lib/notificationValidation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";
const sectionClass = "rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4";

const TITLE_MAX = 65;
const SUBTITLE_MAX = 120;
const BODY_MAX = 500;

type ConfirmAction = "send" | "schedule" | null;

type Props = {
  editId?: number;
};

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

function CharCounter({ current, max }: { current: number; max: number }) {
  const warn = current > max * 0.9;
  return (
    <span className={cn("text-[10px] font-mono", warn ? "text-amber-600" : "text-text-muted")} aria-live="polite">
      {current}/{max}
    </span>
  );
}

export function CreateNotificationForm({ editId }: Props) {
  const router = useRouter();
  const { addToast, adminEmail, bumpRefresh } = useApp();
  const [form, setForm] = useState<NotificationFormData>(getDefaultFormData());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [resolvedEditId, setResolvedEditId] = useState<number | undefined>(editId);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const estimatedRecipients = useMemo(() => estimateRecipientsFromForm(form), [form]);

  const loadInitial = useCallback(() => {
    if (editId) {
      const campaign = notificationCampaigns.find((n) => n.id === editId);
      if (campaign) {
        setForm(campaignToForm(campaign));
        setResolvedEditId(editId);
        return;
      }
    }
    const stored = loadDraftFromStorage();
    if (stored && !editId) {
      setForm(stored.form);
      setResolvedEditId(stored.editId);
      setDraftSavedAt(stored.savedAt);
    }
  }, [editId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

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

  const update = <K extends keyof NotificationFormData>(key: K, value: NotificationFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    setErrors((e) => {
      const next = { ...e };
      delete next[key as keyof FieldErrors];
      return next;
    });
  };

  const updateFilter = <K extends keyof NotificationFormData["audience_filters"]>(
    key: K,
    value: NotificationFormData["audience_filters"][K]
  ) => {
    setForm((f) => ({
      ...f,
      audience_filters: { ...f.audience_filters, [key]: value },
    }));
    setDirty(true);
    setErrors((e) => {
      const next = { ...e };
      delete next.audience;
      return next;
    });
  };

  const toggleSegment = (seg: AudienceType) => {
    const current = form.audience_filters.segments ?? [];
    const next = current.includes(seg) ? current.filter((s) => s !== seg) : [...current, seg];
    updateFilter("segments", next.length ? next : ["all_users"]);
    if (next.length === 1) update("audience_type", next[0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update("image_url", reader.result as string);
      update("image_file_name", file.name);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!form.title.trim() && !form.subtitle.trim()) return;
      setAutoSaving(true);
      saveDraftToStorage(form, resolvedEditId);
      setDraftSavedAt(new Date().toISOString());
      setAutoSaving(false);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [form, dirty, resolvedEditId]);

  const runValidation = (requireAll = true) => {
    const v = validateNotificationForm(form, { excludeId: resolvedEditId, requireAll });
    setErrors(v);
    return !hasValidationErrors(v);
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const campaign = await saveDraft({ ...form, status: "draft" }, adminEmail || "Admin", resolvedEditId);
      setResolvedEditId(campaign.id);
      setDirty(false);
      setDraftSavedAt(new Date().toISOString());
      addToast("Draft saved successfully", "success");
      bumpRefresh();
    } catch {
      addToast("Failed to save draft", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTest = async () => {
    if (!form.title.trim()) {
      setErrors({ title: "Title required for test" });
      return;
    }
    setSubmitting(true);
    try {
      await sendTestNotification(form, adminEmail);
      addToast("Test notification sent to your admin account", "info");
    } catch {
      addToast("Test delivery failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeConfirmed = async () => {
    if (!confirmAction) return;
    setSubmitting(true);
    try {
      if (confirmAction === "send") {
        await sendNotificationNow({ ...form, send_now: true, status: "sending" }, adminEmail || "Admin", resolvedEditId);
        addToast("Notification sent successfully", "success");
      } else {
        await scheduleNotification({ ...form, send_now: false, status: "scheduled" }, adminEmail || "Admin", resolvedEditId);
        addToast("Notification scheduled successfully", "success");
      }
      clearDraftStorage();
      setDirty(false);
      bumpRefresh();
      router.push("/notifications");
    } catch {
      addToast("Operation failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  const requestSend = () => {
    if (!runValidation(true)) {
      addToast("Please fix validation errors before sending", "error");
      return;
    }
    setConfirmAction("send");
  };

  const requestSchedule = () => {
    if (!runValidation(true)) {
      addToast("Please fix validation errors before scheduling", "error");
      return;
    }
    setConfirmAction("schedule");
  };

  const handleCancel = () => {
    if (dirty) setShowCancelConfirm(true);
    else router.push("/notifications");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <nav className="text-xs text-text-muted mb-2 flex items-center gap-1">
            <Link href="/notifications" className="hover:text-primary">Notifications</Link>
            <span>/</span>
            <span>{resolvedEditId ? "Edit" : "Create"}</span>
          </nav>
          <PageHeader title={resolvedEditId ? "Edit Push Notification" : "Create Push Notification"} />
          <p className="text-sm text-text-muted mt-1">
            Compose and target healthcare notifications for patients, doctors, and caregivers across SehatVaani.
          </p>
          {(draftSavedAt || autoSaving) && (
            <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1" aria-live="polite">
              <MaterialIcon name={autoSaving ? "sync" : "cloud_done"} size={14} />
              {autoSaving ? "Saving draft…" : `Draft saved ${new Date(draftSavedAt!).toLocaleTimeString()}`}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Section 1 — Message Details */}
          <section className={sectionClass} aria-labelledby="msg-details">
            <SectionTitle icon="edit_note" title="Message Details" description="Title, description, media, and call-to-action" />
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="nf-title">Notification Title *</label>
                <CharCounter current={form.title.length} max={TITLE_MAX} />
              </div>
              <input
                id="nf-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={cn(inputClass, errors.title && "border-red-500")}
                placeholder="e.g. Monsoon Health Advisory"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "nf-title-err" : undefined}
                maxLength={TITLE_MAX + 10}
              />
              {errors.title && <p id="nf-title-err" className={errorClass}>{errors.title}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="nf-subtitle">Short Description *</label>
                <CharCounter current={form.subtitle.length} max={SUBTITLE_MAX} />
              </div>
              <input
                id="nf-subtitle"
                value={form.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
                className={cn(inputClass, errors.subtitle && "border-red-500")}
                placeholder="Brief summary shown in notification tray"
                aria-invalid={!!errors.subtitle}
              />
              {errors.subtitle && <p className={errorClass}>{errors.subtitle}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="nf-body">Full Notification Body (optional)</label>
                <CharCounter current={form.body.length} max={BODY_MAX} />
              </div>
              <textarea
                id="nf-body"
                rows={4}
                value={form.body}
                onChange={(e) => update("body", e.target.value)}
                className={cn(inputClass, errors.body && "border-red-500")}
                placeholder="Extended message for in-app view"
              />
              {errors.body && <p className={errorClass}>{errors.body}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="nf-image">Notification Image (optional)</label>
                <input id="nf-image" type="file" accept="image/*" onChange={handleImageUpload} className={inputClass} />
                {form.image_file_name && <p className="text-[10px] text-text-muted mt-1">{form.image_file_name}</p>}
              </div>
              <div>
                <label className={labelClass}>Banner / Thumbnail Preview</label>
                <div className="h-[42px] rounded-lg border border-outline-variant/50 bg-surface-elevated overflow-hidden flex items-center justify-center">
                  {form.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image_url} alt="Thumbnail preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-text-muted">No image selected</span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="nf-deeplink">Deep Link / Redirect URL</label>
                <input id="nf-deeplink" value={form.deep_link} onChange={(e) => update("deep_link", e.target.value)} className={cn(inputClass, errors.deep_link && "border-red-500")} placeholder="sehatvaani://path or https://" />
                {errors.deep_link && <p className={errorClass}>{errors.deep_link}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-cta-text">CTA Button Text</label>
                <input id="nf-cta-text" value={form.action_button} onChange={(e) => update("action_button", e.target.value)} className={inputClass} placeholder="View Details" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="nf-cta-dest">CTA Destination</label>
                <input id="nf-cta-dest" value={form.cta_destination} onChange={(e) => update("cta_destination", e.target.value)} className={cn(inputClass, errors.cta_destination && "border-red-500")} placeholder="Where the CTA button navigates" />
                {errors.cta_destination && <p className={errorClass}>{errors.cta_destination}</p>}
              </div>
            </div>
          </section>

          {/* Section 2 — Delivery Method */}
          <section className={sectionClass} aria-labelledby="delivery-method">
            <SectionTitle icon="schedule_send" title="Delivery Method" description="Send immediately or schedule for later" />
            <fieldset className="space-y-2">
              <legend className="sr-only">Delivery method</legend>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-lg border border-outline-variant/50 hover:bg-surface-low/50">
                <input type="radio" name="delivery" checked={form.send_now} onChange={() => { update("send_now", true); update("delivery_type", "instant"); }} />
                <div>
                  <p className="font-semibold">Send Immediately</p>
                  <p className="text-xs text-text-muted">Deliver to all matching recipients right away</p>
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-lg border border-outline-variant/50 hover:bg-surface-low/50">
                <input type="radio" name="delivery" checked={!form.send_now} onChange={() => { update("send_now", false); update("delivery_type", "scheduled"); }} />
                <div>
                  <p className="font-semibold">Schedule for Later</p>
                  <p className="text-xs text-text-muted">Pick a future date and time</p>
                </div>
              </label>
            </fieldset>
            {!form.send_now && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className={labelClass} htmlFor="nf-date">Date</label>
                  <input id="nf-date" type="date" value={form.scheduled_at} onChange={(e) => update("scheduled_at", e.target.value)} className={cn(inputClass, errors.schedule && "border-red-500")} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="nf-time">Time</label>
                  <input id="nf-time" type="time" value={form.scheduled_time} onChange={(e) => update("scheduled_time", e.target.value)} className={cn(inputClass, errors.schedule && "border-red-500")} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="nf-tz">Timezone</label>
                  <select id="nf-tz" value={form.timezone} onChange={(e) => update("timezone", e.target.value)} className={inputClass}>
                    {TIMEZONE_OPTIONS.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            )}
            {errors.schedule && <p className={errorClass} role="alert">{errors.schedule}</p>}
            <div>
              <label className={labelClass} htmlFor="nf-recurrence">Recurring Notification (optional)</label>
              <select id="nf-recurrence" value={form.recurrence} onChange={(e) => update("recurrence", e.target.value as NotificationFormData["recurrence"])} className={inputClass}>
                {RECURRENCE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </section>

          {/* Section 3 — Audience */}
          <section className={sectionClass} aria-labelledby="audience-section">
            <SectionTitle icon="groups" title="Audience Selection" description="Target healthcare users with advanced filters" />
            {errors.audience && <p className={errorClass} role="alert">{errors.audience}</p>}
            <div>
              <p className={labelClass}>Primary Segments (select multiple)</p>
              <div className="flex flex-wrap gap-2">
                {SEGMENT_OPTIONS.map((seg) => {
                  const active = (form.audience_filters.segments ?? []).includes(seg.value);
                  return (
                    <button
                      key={seg.value}
                      type="button"
                      onClick={() => toggleSegment(seg.value)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors",
                        active ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed" : "bg-surface-card text-text-muted border-outline-variant hover:bg-surface-elevated"
                      )}
                    >
                      {seg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="nf-city">City</label>
                <input id="nf-city" value={form.audience_filters.city ?? ""} onChange={(e) => updateFilter("city", e.target.value || undefined)} className={inputClass} placeholder="Mumbai" />
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-state">State</label>
                <input id="nf-state" value={form.audience_filters.state ?? ""} onChange={(e) => updateFilter("state", e.target.value || undefined)} className={inputClass} placeholder="Maharashtra" />
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-country">Country</label>
                <input id="nf-country" value={form.audience_filters.country ?? ""} onChange={(e) => updateFilter("country", e.target.value || undefined)} className={inputClass} placeholder="India" />
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-age">Age Group</label>
                <select id="nf-age" value={form.audience_filters.age_group ?? ""} onChange={(e) => updateFilter("age_group", e.target.value || undefined)} className={inputClass}>
                  <option value="">Any</option>
                  <option value="18-30">18–30</option>
                  <option value="31-45">31–45</option>
                  <option value="46-60">46–60</option>
                  <option value="60+">60+</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-gender">Gender</label>
                <select id="nf-gender" value={form.audience_filters.gender ?? ""} onChange={(e) => updateFilter("gender", e.target.value || undefined)} className={inputClass}>
                  <option value="">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-disease">Disease-specific Users</label>
                <input id="nf-disease" value={form.audience_filters.disease ?? ""} onChange={(e) => updateFilter("disease", e.target.value || undefined)} className={inputClass} placeholder="Diabetes, Hypertension" />
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-appt">Appointment Status</label>
                <select id="nf-appt" value={form.audience_filters.appointment_status ?? "all"} onChange={(e) => updateFilter("appointment_status", e.target.value as NotificationFormData["audience_filters"]["appointment_status"])} className={inputClass}>
                  <option value="all">All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="none">No Appointments</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-activity">Active / Inactive Users</label>
                <select id="nf-activity" value={form.audience_filters.activity_status ?? "all"} onChange={(e) => updateFilter("activity_status", e.target.value as NotificationFormData["audience_filters"]["activity_status"])} className={inputClass}>
                  <option value="all">All</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="nf-tags">Tags (comma-separated)</label>
                <input
                  id="nf-tags"
                  value={(form.audience_filters.tags ?? []).join(", ")}
                  onChange={(e) => updateFilter("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  className={inputClass}
                  placeholder="vip, chronic-care, telehealth"
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="nf-users">Custom User Selection</label>
              <select
                id="nf-users"
                multiple
                size={4}
                className={inputClass}
                value={(form.audience_filters.custom_user_ids ?? []).map(String)}
                onChange={(e) => {
                  const ids = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  updateFilter("custom_user_ids", ids.length ? ids : undefined);
                }}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.phone}</option>
                ))}
              </select>
              <p className="text-[10px] text-text-muted mt-1">Hold Ctrl/Cmd to select multiple users</p>
            </div>
            <div className="rounded-lg bg-primary-fixed/30 border border-primary-fixed/50 p-4 flex items-center justify-between" aria-live="polite">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase">Estimated Recipients</p>
                <p className="text-2xl font-bold text-primary">{estimatedRecipients.toLocaleString()}</p>
              </div>
              <MaterialIcon name="person_search" size={32} className="text-primary opacity-60" />
            </div>
          </section>

          {/* Section 5 — Advanced Options */}
          <section className={sectionClass} aria-labelledby="advanced-options">
            <SectionTitle icon="tune" title="Advanced Options" description="Priority, expiration, and campaign metadata" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="nf-priority">Notification Priority</label>
                <select id="nf-priority" value={form.priority} onChange={(e) => update("priority", e.target.value as NotificationFormData["priority"])} className={inputClass}>
                  {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-category">Notification Category</label>
                <select id="nf-category" value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-exp-date">Expiration Date (optional)</label>
                <input id="nf-exp-date" type="date" value={form.expiration_at} onChange={(e) => update("expiration_at", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-exp-time">Expiration Time</label>
                <input id="nf-exp-time" type="time" value={form.expiration_time} onChange={(e) => update("expiration_time", e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="nf-campaign-tags">Campaign Tags</label>
                <input id="nf-campaign-tags" value={form.campaign_tags} onChange={(e) => update("campaign_tags", e.target.value)} className={inputClass} placeholder="monsoon-2026, patient-outreach" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="nf-notes">Internal Notes</label>
                <textarea id="nf-notes" rows={2} value={form.internal_notes} onChange={(e) => update("internal_notes", e.target.value)} className={inputClass} placeholder="Visible to admins only" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="nf-attachments">Attachments (optional, comma-separated URLs)</label>
                <input id="nf-attachments" value={form.attachments} onChange={(e) => update("attachments", e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.silent} onChange={(e) => update("silent", e.target.checked)} />
                Silent Notification
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.require_user_action} onChange={(e) => update("require_user_action", e.target.checked)} />
                Require User Action
              </label>
            </div>
          </section>

          {/* Section 7 — Actions */}
          <section className={cn(sectionClass, "sticky bottom-0 z-10 bg-surface-card/95 backdrop-blur-sm")} aria-label="Form actions">
            <div className="flex flex-wrap gap-2 justify-between">
              <button type="button" onClick={handleCancel} disabled={submitting} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold hover:bg-surface-elevated disabled:opacity-50">
                Cancel
              </button>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleSaveDraft} disabled={submitting} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold hover:bg-surface-elevated disabled:opacity-50">
                  {submitting ? "Saving…" : "Save Draft"}
                </button>
                <button type="button" onClick={() => { runValidation(false); setPreviewOpen(true); }} disabled={submitting} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold hover:bg-surface-elevated disabled:opacity-50">
                  Preview
                </button>
                <button type="button" onClick={handleTest} disabled={submitting} className="rounded-lg border border-primary text-primary px-4 py-2.5 text-sm font-semibold hover:bg-primary-fixed/30 disabled:opacity-50">
                  Test Notification
                </button>
                {!form.send_now ? (
                  <button type="button" onClick={requestSchedule} disabled={submitting} className="rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-container disabled:opacity-50">
                    {submitting ? "Processing…" : "Schedule Notification"}
                  </button>
                ) : (
                  <button type="button" onClick={requestSend} disabled={submitting} className="rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-container disabled:opacity-50">
                    {submitting ? "Sending…" : "Send Now"}
                  </button>
                )}
              </div>
            </div>
            {submitting && (
              <div className="h-1 rounded-full bg-surface-elevated overflow-hidden mt-3" aria-hidden="true">
                <div className="h-full bg-primary animate-pulse w-2/3" />
              </div>
            )}
          </section>
        </div>

        {/* Section 4 — Live Preview sidebar */}
        <aside className="xl:col-span-1">
          <div className={cn(sectionClass, "sticky top-4")}>
            <SectionTitle icon="preview" title="Live Preview" description="Updates as you type" />
            <DevicePreview
              title={form.title}
              subtitle={form.subtitle}
              body={form.body}
              actionButton={form.action_button}
              imageUrl={form.image_url}
            />
          </div>
        </aside>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Notification Preview" size="xl">
        <DevicePreview title={form.title} subtitle={form.subtitle} body={form.body} actionButton={form.action_button} imageUrl={form.image_url} />
      </Modal>

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction === "send" ? "Confirm Send" : "Confirm Schedule"}>
        <p className="text-sm text-text-muted mb-4">
          {confirmAction === "send"
            ? `Send "${form.title}" to approximately ${estimatedRecipients.toLocaleString()} recipients now?`
            : `Schedule "${form.title}" for ${form.scheduled_at} at ${form.scheduled_time} (${form.timezone})?`}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Go Back</button>
          <button type="button" onClick={executeConfirmed} disabled={submitting} className="flex-1 rounded-lg bg-primary text-white py-2.5 text-sm font-semibold disabled:opacity-50">
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Unsaved Changes">
        <p className="text-sm text-text-muted mb-4">You have unsaved changes. Leave without saving?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowCancelConfirm(false)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Stay</button>
          <button type="button" onClick={() => router.push("/notifications")} className="flex-1 rounded-lg bg-red-600 text-white py-2.5 text-sm font-semibold">Leave</button>
        </div>
      </Modal>
    </div>
  );
}
