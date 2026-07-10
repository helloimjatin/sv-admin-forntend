import {
  PageFormData,
  StaticPage,
  AppConfigKey,
  createStaticPage,
  updateStaticPage,
  updateAppConfig,
  getDefaultPageForm,
} from "@/data/cmsData";

const DRAFT_KEY = "sv-cms-page-draft";

export function savePageDraftToStorage(form: PageFormData, pageId?: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, pageId, savedAt: new Date().toISOString() }));
}

export function loadPageDraftFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) as { form: PageFormData; pageId?: number; savedAt: string } : null;
  } catch {
    return null;
  }
}

export function clearPageDraftStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function savePageDraft(form: PageFormData, editor: string, pageId?: number): Promise<StaticPage> {
  await delay(500);
  const data = { ...form, status: "draft" as const };
  if (pageId) {
    const updated = updateStaticPage(pageId, data, editor);
    if (!updated) throw new Error("Page not found");
    savePageDraftToStorage(form, pageId);
    return updated;
  }
  const created = createStaticPage(data, editor);
  savePageDraftToStorage(form, created.id);
  return created;
}

export async function publishPageForm(form: PageFormData, editor: string, pageId?: number): Promise<StaticPage> {
  await delay(800);
  const data = { ...form, status: "published" as const };
  if (pageId) {
    const updated = updateStaticPage(pageId, data, editor);
    if (!updated) throw new Error("Page not found");
    clearPageDraftStorage();
    return updated;
  }
  const created = createStaticPage(data, editor);
  clearPageDraftStorage();
  return created;
}

export async function schedulePageForm(form: PageFormData, editor: string, pageId?: number): Promise<StaticPage> {
  await delay(800);
  const data = { ...form, status: "scheduled" as const };
  if (pageId) {
    const updated = updateStaticPage(pageId, data, editor);
    if (!updated) throw new Error("Page not found");
    clearPageDraftStorage();
    return updated;
  }
  const created = createStaticPage(data, editor);
  clearPageDraftStorage();
  return created;
}

export async function saveAppConfigContent(key: AppConfigKey, content: string, language: string, editor: string) {
  await delay(400);
  return updateAppConfig(key, content, language, editor);
}

export function loadAutoSaveDraft(pageId?: number): PageFormData | null {
  const stored = loadPageDraftFromStorage();
  if (!stored) return null;
  if (pageId && stored.pageId !== pageId) return null;
  if (!pageId && stored.pageId) return null;
  return stored.form;
}
