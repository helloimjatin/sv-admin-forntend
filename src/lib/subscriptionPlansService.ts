import {
  PlanFormData,
  getDefaultPlanForm,
  planToForm,
  getPlanById,
  createPlan,
  updatePlan,
} from "@/data/subscriptionPlansData";

const DRAFT_KEY = "sv_plan_draft_v1";

export function savePlanDraftToStorage(form: PlanFormData, editId?: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, editId: editId ?? null, savedAt: Date.now() }));
  } catch {
    /* ignore quota */
  }
}

export function loadPlanDraftFromStorage(): { form: PlanFormData; editId: number | null } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { form: PlanFormData; editId: number | null };
    if (!parsed?.form) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPlanDraftStorage() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveInitialForm(editId?: number): PlanFormData {
  if (editId) {
    const plan = getPlanById(editId);
    if (plan) return planToForm(plan);
  }
  const draft = loadPlanDraftFromStorage();
  if (draft && (draft.editId ?? null) === (editId ?? null)) {
    return draft.form;
  }
  return getDefaultPlanForm();
}

export function persistPlan(form: PlanFormData, editor: string, editId?: number) {
  if (editId) {
    return updatePlan(editId, form, editor);
  }
  return createPlan(form, editor);
}

export function exportPlansJson(plans: unknown) {
  return JSON.stringify(plans, null, 2);
}

export function downloadText(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
