"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import {
  BLOG_CATEGORIES,
  BLOG_STATUS_OPTIONS,
  BlogFormData,
  BlogStatus,
  getBlogPublicUrl,
  slugify,
} from "@/data/blogData";
import {
  clearBlogDraftStorage,
  persistBlog,
  resolveInitialBlogForm,
  saveBlogDraftToStorage,
} from "@/lib/blogService";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

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

function validateForm(form: BlogFormData) {
  const errors: Partial<Record<keyof BlogFormData, string>> = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.content.trim()) errors.content = "Content is required";
  return errors;
}

export function BlogForm({ editId }: Props) {
  const router = useRouter();
  const { addToast, bumpRefresh, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const [editing, setEditing] = useState(!editId);
  const [form, setForm] = useState<BlogFormData>(() => resolveInitialBlogForm(editId));
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BlogFormData, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTouched = useRef(!!editId);

  const patch = useCallback(<K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
    if (!editing) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, [editing]);

  useEffect(() => {
    if (!editing || !dirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveBlogDraftToStorage(form, editId);
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

  function onTitleChange(title: string) {
    if (!editing) return;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched.current ? prev.slug : slugify(title),
      seo_title: prev.seo_title || title,
    }));
    setDirty(true);
  }

  function handleSave() {
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast("Please fix validation errors", "error");
      return;
    }
    setSaving(true);
    try {
      const saved = persistBlog(form, editor, editId);
      if (!saved) {
        addToast("Failed to save article", "error");
        return;
      }
      clearBlogDraftStorage();
      setDirty(false);
      bumpRefresh();
      addToast(editId ? "Article updated" : "Article created", "success");
      router.push("/cms?tab=blog");
    } finally {
      setSaving(false);
    }
  }

  const slug = form.slug.trim() || slugify(form.title);
  const title = !editId ? "Create Article" : editing ? "Edit Article" : "Article Details";
  const subtitle = !editId
    ? "Add a health education article for the website blog."
    : editing
      ? "Update article content, category, and visibility."
      : "Review this blog article.";

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => attemptLeave("/cms?tab=blog")}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text mb-2"
          >
            <MaterialIcon name="arrow_back" size={16} />
            Back to blog
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
                href="/cms?tab=blog"
                onClick={(e) => {
                  if (dirty) {
                    e.preventDefault();
                    attemptLeave("/cms?tab=blog");
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
                {saving ? "Saving…" : editId ? "Save Changes" : "Publish Article"}
              </button>
            </>
          )}
        </div>
      </div>

      <section className={sectionClass}>
        <SectionTitle icon="article" title="Article details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => onTitleChange(e.target.value)} disabled={!editing} />
            {errors.title && <p className={errorClass}>{errors.title}</p>}
          </div>
          <div>
            <label className={labelClass}>URL slug</label>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                slugTouched.current = true;
                patch("slug", e.target.value);
              }}
              disabled={!editing}
              placeholder="auto-generated-from-title"
            />
            {slug && (
              <p className="text-xs text-text-muted mt-1 font-mono break-all">{getBlogPublicUrl(slug)}</p>
            )}
          </div>
          <div className="relative">
            <label className={labelClass}>Category</label>
            <button
              type="button"
              onClick={() => editing && setCategoryOpen(!categoryOpen)}
              disabled={!editing}
              className={cn(
                inputClass,
                "flex items-center justify-between text-left cursor-pointer",
                !editing && "cursor-default bg-surface-elevated"
              )}
            >
              <span className="truncate">{form.category || "Select category"}</span>
              {editing && <MaterialIcon name={categoryOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />}
            </button>

            {categoryOpen && editing && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                  {BLOG_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        patch("category", c);
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
          <div>
            <label className={labelClass}>Publish date</label>
            <input
              type="date"
              className={inputClass}
              value={form.published_at}
              onChange={(e) => patch("published_at", e.target.value)}
              disabled={!editing || form.status !== "active"}
            />
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input className={inputClass} value={form.author} onChange={(e) => patch("author", e.target.value)} disabled={!editing} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="blog-featured-home"
              type="checkbox"
              checked={form.featured_on_homepage}
              onChange={(e) => patch("featured_on_homepage", e.target.checked)}
              disabled={!editing}
              className="rounded border-outline-variant"
            />
            <label htmlFor="blog-featured-home" className="text-sm font-medium">Featured</label>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle icon="edit_note" title="Article content" />
        <RichTextEditor
          value={form.content}
          onChange={(v) => patch("content", v)}
          error={errors.content}
          disabled={!editing}
        />
      </section>



      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Discard changes?">
        <p className="text-sm text-text-muted mb-4">You have unsaved changes. Leave without saving?</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmLeave(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold">
            Stay
          </button>
          <button
            type="button"
            onClick={() => {
              clearBlogDraftStorage();
              setConfirmLeave(false);
              if (pendingHref) router.push(pendingHref);
            }}
            className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase"
          >
            Discard
          </button>
        </div>
      </Modal>
    </div>
  );
}
