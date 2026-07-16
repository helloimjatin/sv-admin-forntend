"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  VIDEO_STATUS_OPTIONS,
  VideoFormData,
  VideoStatus,
  addVideoCategory,
  getVideoCategories,
  getVideoPublicUrl,
  slugify,
} from "@/data/videosData";
import {
  clearVideoDraftStorage,
  persistVideo,
  resolveInitialVideoForm,
  saveVideoDraftToStorage,
} from "@/lib/videoService";
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

function validateForm(form: VideoFormData) {
  const errors: Partial<Record<keyof VideoFormData, string>> = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.category.trim()) errors.category = "Category is required";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.video_url.trim()) errors.video_url = "Video URL is required";
  return errors;
}

export function VideoForm({ editId }: Props) {
  const router = useRouter();
  const { addToast, bumpRefresh, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const [editing, setEditing] = useState(!editId);
  const [form, setForm] = useState<VideoFormData>(() => resolveInitialVideoForm(editId));
  const [errors, setErrors] = useState<Partial<Record<keyof VideoFormData, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(() => {
    const list = getVideoCategories();
    const initial = resolveInitialVideoForm(editId);
    if (initial.category && !list.includes(initial.category)) return [...list, initial.category];
    return list;
  });
  const [newCategory, setNewCategory] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTouched = useRef(!!editId);

  const patch = useCallback(<K extends keyof VideoFormData>(key: K, value: VideoFormData[K]) => {
    if (!editing) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, [editing]);

  useEffect(() => {
    if (!editing || !dirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveVideoDraftToStorage(form, editId);
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
    }));
    setDirty(true);
  }

  function handleAddCategory() {
    if (!editing) return;
    const added = addVideoCategory(newCategory);
    if (!added) {
      addToast("Enter a category name", "error");
      return;
    }
    setCategories(getVideoCategories());
    patch("category", added);
    setNewCategory("");
    addToast(`Category “${added}” added`, "success");
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
      const saved = persistVideo(form, editor, editId);
      if (!saved) {
        addToast("Failed to save video", "error");
        return;
      }
      clearVideoDraftStorage();
      setDirty(false);
      bumpRefresh();
      addToast(editId ? "Video updated" : "Video created", "success");
      router.push("/cms?tab=videos");
    } finally {
      setSaving(false);
    }
  }

  const slug = form.slug.trim() || slugify(form.title);
  const title = !editId ? "Add Video" : editing ? "Edit Video" : "Video Details";
  const subtitle = !editId
    ? "Add a tutorial or walkthrough to the video library."
    : editing
      ? "Update video details, embed URL, and visibility."
      : "Review this video entry.";

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => attemptLeave("/cms?tab=videos")}
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text mb-2"
          >
            <MaterialIcon name="arrow_back" size={16} />
            Back to videos
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
                href="/cms?tab=videos"
                onClick={(e) => {
                  if (dirty) {
                    e.preventDefault();
                    attemptLeave("/cms?tab=videos");
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
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Video"}
              </button>
            </>
          )}
        </div>
      </div>

      <section className={sectionClass}>
        <SectionTitle icon="videocam" title="Video details" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="md:col-span-2 xl:col-span-3">
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
            />
            {slug && (
              <p className="text-xs text-text-muted mt-1 font-mono break-all">{getVideoPublicUrl(slug)}</p>
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
            <label className={labelClass}>Duration</label>
            <input
              className={inputClass}
              value={form.duration}
              onChange={(e) => patch("duration", e.target.value)}
              disabled={!editing}
              placeholder="e.g. 5:48"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className={labelClass}>Category *</label>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-2">
              <div className="relative">
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
                  <span className="truncate">{form.category || "Select a category"}</span>
                  {editing && <MaterialIcon name={categoryOpen ? "arrow_drop_up" : "arrow_drop_down"} size={20} />}
                </button>

                {categoryOpen && editing && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface-card p-1 shadow-lg">
                      {categories.map((c) => (
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
              <input
                className={inputClass}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                disabled={!editing}
                placeholder="Create new category..."
                aria-label="New category name"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!editing || !newCategory.trim()}
                className="rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated disabled:opacity-50 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <MaterialIcon name="add" size={16} />
                Add
              </button>
            </div>
            {errors.category && <p className={errorClass}>{errors.category}</p>}
            <p className="text-xs text-text-muted mt-1">
              Pick an existing category or type a new one and click Add.
            </p>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className={labelClass}>Description *</label>
            <textarea
              className={cn(inputClass, "min-h-[88px] resize-y")}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              disabled={!editing}
              placeholder="Short description shown on video cards"
            />
            {errors.description && <p className={errorClass}>{errors.description}</p>}
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className={labelClass}>Video embed URL *</label>
            <input
              className={inputClass}
              value={form.video_url}
              onChange={(e) => patch("video_url", e.target.value)}
              disabled={!editing}
              placeholder="https://www.youtube.com/embed/..."
            />
            {errors.video_url && <p className={errorClass}>{errors.video_url}</p>}
            <p className="text-xs text-text-muted mt-1">Use YouTube embed URL or direct video link.</p>
          </div>

          <div className="md:col-span-2 xl:col-span-3 flex items-center gap-2">
            <input
              id="video-featured-home"
              type="checkbox"
              checked={form.featured_on_homepage}
              onChange={(e) => patch("featured_on_homepage", e.target.checked)}
              disabled={!editing}
              className="rounded border-outline-variant"
            />
            <label htmlFor="video-featured-home" className="text-sm">Show on homepage (See SehatVaani in Action section)</label>
          </div>
        </div>
      </section>

      {form.video_url && (
        <section className={sectionClass}>
          <SectionTitle icon="play_circle" title="Preview" />
          <div className="aspect-video max-h-[480px] rounded-lg overflow-hidden bg-black/5 border border-outline-variant/50">
            <iframe
              src={form.video_url}
              title={form.title || "Video preview"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Discard changes?">
        <p className="text-sm text-text-muted mb-4">You have unsaved changes. Leave without saving?</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmLeave(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold">
            Stay
          </button>
          <button
            type="button"
            onClick={() => {
              clearVideoDraftStorage();
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
