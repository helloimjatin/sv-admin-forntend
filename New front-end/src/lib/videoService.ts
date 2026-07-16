import {
  VideoFormData,
  getVideoById,
  getDefaultVideoForm,
  videoToForm,
  createVideo,
  updateVideo,
} from "@/data/videosData";

const DRAFT_KEY = "sv_video_draft_v1";

export function saveVideoDraftToStorage(form: VideoFormData, editId?: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, editId: editId ?? null, savedAt: Date.now() }));
  } catch {
    /* ignore quota */
  }
}

export function loadVideoDraftFromStorage(): { form: VideoFormData; editId: number | null } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { form: VideoFormData; editId: number | null };
    if (!parsed?.form) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearVideoDraftStorage() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveInitialVideoForm(editId?: number): VideoFormData {
  if (editId) {
    const video = getVideoById(editId);
    if (video) return videoToForm(video);
  }
  const draft = loadVideoDraftFromStorage();
  if (draft && (draft.editId ?? null) === (editId ?? null)) {
    return draft.form;
  }
  return getDefaultVideoForm();
}

export function persistVideo(form: VideoFormData, editor: string, editId?: number) {
  if (editId) {
    return updateVideo(editId, form, editor);
  }
  return createVideo(form, editor);
}
