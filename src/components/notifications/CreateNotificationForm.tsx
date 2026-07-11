"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { DevicePreview } from "@/components/notifications/DevicePreview";
import {
  CATEGORY_OPTIONS,
  NotificationFormData,
  SEGMENT_OPTIONS,
  AudienceType,
  campaignToForm,
  estimateRecipientsFromForm,
  getDefaultFormData,
  notificationCampaigns,
} from "@/data/notificationData";
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

  const toggleSegment = (seg: AudienceType) => {
    const current = form.audience_filters.segments ?? [];
    const next = current.includes(seg) ? current.filter((s) => s !== seg) : [...current, seg];
    const segments: AudienceType[] = next.length ? next : ["all_users"];
    setForm((f) => ({
      ...f,
      audience_type: segments.length === 1 ? segments[0] : f.audience_type,
      audience_filters: { ...f.audience_filters, segments },
    }));
    setDirty(true);
    setErrors((e) => {
      const next = { ...e };
      delete next.audience;
      return next;
    });
  };

  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
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
    <div className="relative min-h-0 flex-1">
      <div className="absolute inset-0 overflow-y-auto p-6 lg:p-8 pb-24">
        <div className="w-full max-w-3xl space-y-6">
          <div>
            <nav className="text-xs text-text-muted mb-2 flex items-center gap-1">
              <Link href="/notifications" className="hover:text-primary">Notifications</Link>
              <span>/</span>
              <span>{resolvedEditId ? "Edit" : "Create"}</span>
            </nav>
            {(draftSavedAt || autoSaving) && (
              <p className="text-xs text-primary font-medium flex items-center gap-1" aria-live="polite">
                <MaterialIcon name={autoSaving ? "sync" : "cloud_done"} size={14} />
                {autoSaving ? "Saving draft…" : `Draft saved ${new Date(draftSavedAt!).toLocaleTimeString()}`}
              </p>
            )}
          </div>

          <section className={sectionClass}>
            <SectionTitle icon="edit_note" title="Message" description="What users will see" />
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="nf-title">Title *</label>
                <CharCounter current={form.title.length} max={TITLE_MAX} />
              </div>
              <input
                id="nf-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={cn(inputClass, errors.title && "border-red-500")}
                placeholder="e.g. Monsoon Health Advisory"
                maxLength={TITLE_MAX + 10}
              />
              {errors.title && <p className={errorClass}>{errors.title}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="nf-subtitle">Short description *</label>
                <CharCounter current={form.subtitle.length} max={SUBTITLE_MAX} />
              </div>
              <input
                id="nf-subtitle"
                value={form.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
                className={cn(inputClass, errors.subtitle && "border-red-500")}
                placeholder="Shown in the notification tray"
              />
              {errors.subtitle && <p className={errorClass}>{errors.subtitle}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="nf-body">Full message (optional)</label>
                <CharCounter current={form.body.length} max={BODY_MAX} />
              </div>
              <textarea
                id="nf-body"
                rows={3}
                value={form.body}
                onChange={(e) => update("body", e.target.value)}
                className={cn(inputClass, errors.body && "border-red-500")}
                placeholder="Extended in-app message"
              />
              {errors.body && <p className={errorClass}>{errors.body}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="nf-category">Category</label>
                <select id="nf-category" value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="nf-cta">CTA button text</label>
                <input id="nf-cta" value={form.action_button} onChange={(e) => update("action_button", e.target.value)} className={inputClass} placeholder="View Details" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="nf-deeplink">Deep link (optional)</label>
                <input
                  id="nf-deeplink"
                  value={form.deep_link}
                  onChange={(e) => update("deep_link", e.target.value)}
                  className={cn(inputClass, errors.deep_link && "border-red-500")}
                  placeholder="sehatvaani://path or https://"
                />
                {errors.deep_link && <p className={errorClass}>{errors.deep_link}</p>}
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle icon="schedule_send" title="Delivery" description="Send now or schedule" />
            <fieldset className="space-y-2">
              <legend className="sr-only">Delivery method</legend>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-lg border border-outline-variant/50 hover:bg-surface-low/50">
                <input type="radio" name="delivery" checked={form.send_now} onChange={() => { update("send_now", true); update("delivery_type", "instant"); }} />
                <span className="font-semibold">Send immediately</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-lg border border-outline-variant/50 hover:bg-surface-low/50">
                <input type="radio" name="delivery" checked={!form.send_now} onChange={() => { update("send_now", false); update("delivery_type", "scheduled"); }} />
                <span className="font-semibold">Schedule for later</span>
              </label>
            </fieldset>
            {!form.send_now && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="nf-date">Date</label>
                  <input id="nf-date" type="date" value={form.scheduled_at} onChange={(e) => update("scheduled_at", e.target.value)} className={cn(inputClass, errors.schedule && "border-red-500")} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="nf-time">Time</label>
                  <input id="nf-time" type="time" value={form.scheduled_time} onChange={(e) => update("scheduled_time", e.target.value)} className={cn(inputClass, errors.schedule && "border-red-500")} />
                </div>
              </div>
            )}
            {errors.schedule && <p className={errorClass} role="alert">{errors.schedule}</p>}
          </section>

          <section className={sectionClass}>
            <SectionTitle icon="groups" title="Audience" description="Who should receive this" />
            {errors.audience && <p className={errorClass} role="alert">{errors.audience}</p>}
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
            <div className="rounded-lg bg-primary-fixed/30 border border-primary-fixed/50 p-4 flex items-center justify-between" aria-live="polite">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase">Estimated recipients</p>
                <p className="text-2xl font-bold text-primary">{estimatedRecipients.toLocaleString()}</p>
              </div>
              <MaterialIcon name="person_search" size={32} className="text-primary opacity-60" />
            </div>
          </section>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-outline-variant/50 bg-surface-card px-6 lg:px-8 py-3"
        role="region"
        aria-label="Form actions"
      >
        <div className="max-w-3xl flex flex-wrap gap-2 justify-between">
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
              Test
            </button>
            {!form.send_now ? (
              <button type="button" onClick={requestSchedule} disabled={submitting} className="rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-container disabled:opacity-50">
                {submitting ? "Processing…" : "Schedule"}
              </button>
            ) : (
              <button type="button" onClick={requestSend} disabled={submitting} className="rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-container disabled:opacity-50">
                {submitting ? "Sending…" : "Send Now"}
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Notification Preview" size="xl">
        <DevicePreview layout="row" title={form.title} subtitle={form.subtitle} body={form.body} actionButton={form.action_button} imageUrl={form.image_url} />
      </Modal>

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction === "send" ? "Confirm Send" : "Confirm Schedule"}>
        <p className="text-sm text-text-muted mb-4">
          {confirmAction === "send"
            ? `Send "${form.title}" to approximately ${estimatedRecipients.toLocaleString()} recipients now?`
            : `Schedule "${form.title}" for ${form.scheduled_at} at ${form.scheduled_time}?`}
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
