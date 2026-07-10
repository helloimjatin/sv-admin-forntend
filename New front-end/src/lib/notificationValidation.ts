import { NotificationFormData } from "@/data/notificationData";
import { notificationCampaigns } from "@/data/notificationData";

export type FieldErrors = Partial<Record<keyof NotificationFormData | "audience" | "schedule", string>>;

const URL_PATTERN = /^(https?:\/\/|sehatvaani:\/\/)[^\s]+$/i;

export function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  return URL_PATTERN.test(url.trim());
}

export function isFutureSchedule(date: string, time: string, timezone: string): boolean {
  if (!date || !time) return false;
  try {
    const scheduled = new Date(`${date}T${time}:00`);
    return scheduled.getTime() > Date.now();
  } catch {
    return false;
  }
}

export function hasAudienceSelection(form: NotificationFormData): boolean {
  const segments = form.audience_filters.segments ?? [];
  if (segments.length > 0) return true;
  if (form.audience_type && form.audience_type !== "custom_segment") return true;
  const f = form.audience_filters;
  return Boolean(
    f.city || f.state || f.country || f.age_group || f.gender || f.disease ||
    f.appointment_status && f.appointment_status !== "all" ||
    f.activity_status && f.activity_status !== "all" ||
    (f.custom_user_ids?.length ?? 0) > 0 ||
    (f.tags?.length ?? 0) > 0
  );
}

export function isDuplicateSchedule(form: NotificationFormData, excludeId?: number): boolean {
  if (form.send_now || !form.scheduled_at || !form.scheduled_time) return false;
  const target = `${form.scheduled_at}T${form.scheduled_time}`;
  return notificationCampaigns.some(
    (n) =>
      n.id !== excludeId &&
      n.status === "scheduled" &&
      n.scheduled_at?.startsWith(form.scheduled_at) &&
      n.scheduled_at?.includes(form.scheduled_time) &&
      n.title.toLowerCase() === form.title.trim().toLowerCase()
  );
}

export function validateNotificationForm(
  form: NotificationFormData,
  options?: { excludeId?: number; requireAll?: boolean }
): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.title.trim()) {
    errors.title = "Notification title is required";
  } else if (form.title.length > 65) {
    errors.title = "Title must be 65 characters or fewer";
  }

  if (!form.subtitle.trim()) {
    errors.subtitle = "Short description is required";
  } else if (form.subtitle.length > 120) {
    errors.subtitle = "Short description must be 120 characters or fewer";
  }

  if (form.body && form.body.length > 500) {
    errors.body = "Body must be 500 characters or fewer";
  }

  if (form.deep_link && !isValidUrl(form.deep_link)) {
    errors.deep_link = "Enter a valid URL (https:// or sehatvaani://)";
  }

  if (form.cta_destination && !isValidUrl(form.cta_destination)) {
    errors.cta_destination = "Enter a valid CTA destination URL";
  }

  if (!hasAudienceSelection(form)) {
    errors.audience = "Select at least one audience segment or filter";
  }

  if (!form.send_now) {
    if (!form.scheduled_at || !form.scheduled_time) {
      errors.schedule = "Date and time are required for scheduled delivery";
    } else if (!isFutureSchedule(form.scheduled_at, form.scheduled_time, form.timezone)) {
      errors.schedule = "Scheduled date and time must be in the future";
    } else if (isDuplicateSchedule(form, options?.excludeId)) {
      errors.schedule = "A notification with this title is already scheduled at this time";
    }
  }

  if (options?.requireAll && !form.action_button.trim()) {
    errors.action_button = "CTA button text is recommended";
  }

  return errors;
}

export function hasValidationErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
