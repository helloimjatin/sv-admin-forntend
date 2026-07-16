import {
  BlogFormData,
  getBlogById,
  getDefaultBlogForm,
  blogToForm,
  createBlogPost,
  updateBlogPost,
} from "@/data/blogData";

const DRAFT_KEY = "sv_blog_draft_v1";

export function saveBlogDraftToStorage(form: BlogFormData, editId?: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, editId: editId ?? null, savedAt: Date.now() }));
  } catch {
    /* ignore quota */
  }
}

export function loadBlogDraftFromStorage(): { form: BlogFormData; editId: number | null } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { form: BlogFormData; editId: number | null };
    if (!parsed?.form) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearBlogDraftStorage() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveInitialBlogForm(editId?: number): BlogFormData {
  if (editId) {
    const post = getBlogById(editId);
    if (post) return blogToForm(post);
  }
  const draft = loadBlogDraftFromStorage();
  if (draft && (draft.editId ?? null) === (editId ?? null)) {
    return draft.form;
  }
  return getDefaultBlogForm();
}

export function persistBlog(form: BlogFormData, editor: string, editId?: number) {
  if (editId) {
    return updateBlogPost(editId, form, editor);
  }
  return createBlogPost(form, editor);
}
