"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { MediaUploader } from "@/components/cms/MediaUploader";
import { PagePreview } from "@/components/cms/PagePreview";
import {
  PAGE_CATEGORIES,
  PageFormData,
  getDefaultPageForm,
  pageToForm,
  slugify,
  suggestSlugs,
  staticPages,
  archivePage,
  softDeletePage,
  getPublicUrl,
} from "@/data/cmsData";
import {
  clearPageDraftStorage,
  publishPageForm,
  savePageDraft,
  savePageDraftToStorage,
} from "@/lib/cmsService";
import {
  validatePageForm,
  getPageWarnings,
  hasCmsErrors,
  CmsFieldErrors,
} from "@/lib/cmsValidation";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";
const warnClass = "text-xs text-amber-600 mt-1";
const sectionClass = "rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4";

type ConfirmAction = "publish" | "archive" | "delete" | null;

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2">
      <MaterialIcon name={icon} size={20} className="text-primary" />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  );
}

export function PageEditor({ pageId }: { pageId?: number }) {
  const router = useRouter();
  const { addToast, adminEmail, bumpRefresh } = useApp();
  const [form, setForm] = useState<PageFormData>(getDefaultPageForm());
  const [errors, setErrors] = useState<CmsFieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [resolvedId, setResolvedId] = useState<number | undefined>(pageId);
  const [loading, setLoading] = useState(!!pageId);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const warnings = useMemo(() => getPageWarnings(form), [form]);
  const slugSuggestions = useMemo(() => {
    if (!form.title) return [];
    return suggestSlugs(form.title, resolvedId);
  }, [form.title, resolvedId]);

  useEffect(() => {
    if (pageId) {
      setLoading(true);
      const t = setTimeout(() => {
        const page = staticPages.find((p) => p.id === pageId && !p.deleted_at);
        if (page) {
          setForm(pageToForm(page));
          setResolvedId(pageId);
        }
        setLoading(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [pageId]);

  useEffect(() => {
    if (!form.slug_manual && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, form.slug_manual]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      if (form.title.trim()) {
        setAutoSaving(true);
        savePageDraftToStorage(form, resolvedId);
        setDraftSavedAt(new Date().toISOString());
        setTimeout(() => setAutoSaving(false), 300);
      }
    }, 3000);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [form, dirty, resolvedId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSaveDraft();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setPreviewOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const update = <K extends keyof PageFormData>(key: K, value: PageFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    setErrors((e) => {
      const n = { ...e };
      delete n[key as keyof CmsFieldErrors];
      return n;
    });
  };

  const runValidation = () => {
    const v = validatePageForm(form, resolvedId);
    setErrors(v);
    return !hasCmsErrors(v);
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const page = await savePageDraft(
        { ...form, status: "draft" },
        adminEmail || "Admin",
        resolvedId
      );
      setResolvedId(page.id);
      setDirty(false);
      setDraftSavedAt(new Date().toISOString());
      addToast("Draft saved", "success");
      bumpRefresh();
    } catch {
      addToast("Failed to save draft", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction !== "delete" && confirmAction !== "archive" && !runValidation()) {
      addToast("Fix validation errors first", "error");
      setConfirmAction(null);
      return;
    }
    setSubmitting(true);
    try {
      if (confirmAction === "publish") {
        await publishPageForm({ ...form, status: "published" }, adminEmail || "Admin", resolvedId);
        addToast("Page published successfully", "success");
        clearPageDraftStorage();
        setDirty(false);
        router.push("/cms");
      } else if (confirmAction === "archive" && resolvedId) {
        archivePage(resolvedId, adminEmail || "Admin");
        addToast("Page archived", "info");
        router.push("/cms");
      } else if (confirmAction === "delete" && resolvedId) {
        softDeletePage(resolvedId, adminEmail || "Admin");
        addToast("Page deleted", "info");
        router.push("/cms");
      }
      bumpRefresh();
    } catch {
      addToast("Action failed", "error");
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg shimmer" />
        ))}
      </div>
    );
  }

  const isEdit = Boolean(resolvedId);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER */}
      <header className="rounded-lg border border-outline-variant/50 bg-surface-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => (dirty ? setShowCancel(true) : router.push("/cms"))}
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-2"
            >
              <MaterialIcon name="arrow_back" size={18} />
              Back to CMS
            </button>
            <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight">
              {isEdit ? "Edit Page" : "Create Page"}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Create and publish page content.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              {(autoSaving || draftSavedAt) && (
                <span className="text-primary font-medium flex items-center gap-1" aria-live="polite">
                  <MaterialIcon name={autoSaving ? "sync" : "cloud_done"} size={14} />
                  {autoSaving ? "Auto-saving…" : `Draft saved ${new Date(draftSavedAt!).toLocaleTimeString()}`}
                </span>
              )}
              {dirty && <span className="text-amber-600 font-medium">Unsaved changes</span>}
              {isEdit && <span className="text-text-muted">Editing ID #{resolvedId}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => (dirty ? setShowCancel(true) : router.push("/cms"))}
              disabled={submitting}
              className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold hover:bg-surface-elevated disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold hover:bg-surface-elevated disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-semibold hover:bg-surface-elevated"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                if (runValidation()) setConfirmAction("publish");
                else addToast("Fix validation errors before publishing", "error");
              }}
              disabled={submitting}
              className="rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-container disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* GENERAL INFORMATION */}
          <section className={sectionClass} aria-labelledby="general-info">
            <SectionTitle icon="info" title="General Information" />
            <div>
              <label className={labelClass} htmlFor="pg-title">Page Title *</label>
              <input
                id="pg-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={cn(inputClass, errors.title && "border-red-500")}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className={errorClass}>{errors.title}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass} htmlFor="pg-slug">URL Slug *</label>
                <label className="text-[10px] text-text-muted flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.slug_manual}
                    onChange={(e) => update("slug_manual", e.target.checked)}
                  />
                  Manual edit
                </label>
              </div>
              <input
                id="pg-slug"
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                disabled={!form.slug_manual}
                className={cn(inputClass, "font-mono", errors.slug && "border-red-500", !form.slug_manual && "opacity-70")}
              />
              {errors.slug && <p className={errorClass}>{errors.slug}</p>}
              {form.slug && (
                <p className="text-[10px] text-text-muted font-mono mt-1 break-all">
                  URL preview: {getPublicUrl(form.slug, form.language)}
                </p>
              )}
              {slugSuggestions.length > 0 && (
                <p className="text-[10px] text-text-muted mt-1">
                  Alternatives:{" "}
                  {slugSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="text-primary hover:underline mr-2"
                      onClick={() => {
                        update("slug", s);
                        update("slug_manual", true);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelClass} htmlFor="pg-cat">Page Category</label>
                <button
                  type="button"
                  id="pg-cat"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className={cn(
                    inputClass,
                    "flex items-center justify-between text-left cursor-pointer",
                    errors.category && "border-red-500"
                  )}
                >
                  <span className="truncate">{form.category || "Select a category"}</span>
                  <MaterialIcon name={categoryOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />
                </button>

                {categoryOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                      {PAGE_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            update("category", c);
                            setCategoryOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                            form.category === c && "bg-primary-fixed/20 font-medium"
                          )}
                        >
                          <span className="flex-1 truncate">{c}</span>
                          {form.category === c && <MaterialIcon name="check" size={16} className="text-primary" />}
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
                      form.status === "published" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    )} />
                    {form.status === "published" ? "Active" : "Inactive"}
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
                          update("status", "published");
                          setStatusOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                          form.status === "published" && "bg-primary-fixed/20 font-medium"
                        )}
                      >
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="flex-1">Active</span>
                        {form.status === "published" && <MaterialIcon name="check" size={16} className="text-primary" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          update("status", "draft");
                          setStatusOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-surface-elevated transition-colors",
                          form.status !== "published" && "bg-primary-fixed/20 font-medium"
                        )}
                      >
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        <span className="flex-1">Inactive</span>
                        {form.status !== "published" && <MaterialIcon name="check" size={16} className="text-primary" />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="pg-desc">Short Description</label>
              <textarea
                id="pg-desc"
                rows={2}
                value={form.short_description}
                onChange={(e) => update("short_description", e.target.value)}
                className={inputClass}
                placeholder="Brief summary shown in listings and previews"
              />
            </div>
          </section>

          {/* CONTENT EDITOR */}
          <section className={sectionClass}>
            <SectionTitle icon="edit_note" title="Content" />
            <RichTextEditor
              value={form.content}
              onChange={(v) => update("content", v)}
              error={errors.content}
            />
            {warnings.content && !errors.content && <p className={warnClass}>{warnings.content}</p>}
          </section>

          {/* FEATURED IMAGE */}
          <section className={sectionClass}>
            <SectionTitle icon="image" title="Featured Image" />
            <MediaUploader
              label="Featured Image"
              value={form.featured_image}
              onChange={(v) => update("featured_image", v)}
              hint={warnings.featured_image}
            />
          </section>

          {/* SEO (minimal) */}
          <section className={sectionClass}>
            <SectionTitle icon="travel_explore" title="Search Preview" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <label className={labelClass}>Meta Title</label>
                  <span className={cn("text-[10px] font-mono", form.seo_title.length > 60 ? "text-red-600" : "text-text-muted")}>
                    {form.seo_title.length}/60
                  </span>
                </div>
                <input
                  value={form.seo_title}
                  onChange={(e) => update("seo_title", e.target.value)}
                  className={cn(inputClass, errors.seo_title && "border-red-500")}
                  placeholder="Defaults to page title if left empty"
                />
                {errors.seo_title && <p className={errorClass}>{errors.seo_title}</p>}
                {warnings.seo_title && !errors.seo_title && <p className={warnClass}>{warnings.seo_title}</p>}
              </div>
              <div>
                <div className="flex justify-between">
                  <label className={labelClass}>Meta Description</label>
                  <span className={cn("text-[10px] font-mono", form.seo_description.length > 160 ? "text-red-600" : "text-text-muted")}>
                    {form.seo_description.length}/160
                  </span>
                </div>
                <textarea
                  value={form.seo_description}
                  onChange={(e) => update("seo_description", e.target.value)}
                  className={cn(inputClass, errors.seo_description && "border-red-500")}
                  rows={2}
                  placeholder="Brief description for search results"
                />
                {errors.seo_description && <p className={errorClass}>{errors.seo_description}</p>}
                {warnings.seo_description && !errors.seo_description && <p className={warnClass}>{warnings.seo_description}</p>}
              </div>
            </div>
          </section>

          {isEdit && (
            <section className={sectionClass}>
              <SectionTitle icon="settings" title="Page Actions" />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmAction("archive")}
                  className="rounded-lg border border-amber-500 text-amber-700 px-4 py-2 text-sm font-semibold"
                >
                  Archive
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction("delete")}
                  className="rounded-lg border border-red-500 text-red-600 px-4 py-2 text-sm font-semibold"
                >
                  Soft Delete
                </button>
              </div>
            </section>
          )}

          <p className="text-[10px] text-text-muted px-1">
            Shortcuts: ⌘/Ctrl+S save draft · ⌘/Ctrl+P preview
          </p>
        </div>

        {/* LIVE PREVIEW SIDEBAR */}
        <aside className="xl:col-span-1">
          <div className={cn(sectionClass, "sticky top-4")}>
            <SectionTitle icon="preview" title="Live Preview" />
            <PagePreview page={form} />
          </div>
        </aside>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Full Page Preview" size="xl">
        <PagePreview page={form} />
      </Modal>

      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title="Confirm Action">
        <p className="text-sm text-text-muted mb-4">
          {confirmAction === "publish" && `Publish "${form.title}" to ${getPublicUrl(form.slug, form.language)}?`}
          {confirmAction === "archive" && `Archive "${form.title}"?`}
          {confirmAction === "delete" && `Soft-delete "${form.title}"? It can be restored later.`}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            onClick={executeConfirm}
            disabled={submitting}
            className="flex-1 rounded-lg bg-primary text-white py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Unsaved Changes">
        <p className="text-sm text-text-muted mb-4">You have unsaved changes. Leave without saving?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowCancel(false)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">
            Stay
          </button>
          <button type="button" onClick={() => router.push("/cms")} className="flex-1 rounded-lg bg-red-600 text-white py-2.5 text-sm font-semibold">
            Leave
          </button>
        </div>
      </Modal>
    </div>
  );
}
