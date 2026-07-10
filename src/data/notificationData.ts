export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export type DeliveryType = "instant" | "scheduled";

export type AudienceType =
  | "all_users"
  | "patients"
  | "doctors"
  | "caregivers"
  | "premium"
  | "free"
  | "custom_segment";

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type AppointmentStatusFilter = "all" | "upcoming" | "completed" | "cancelled" | "none";
export type ActivityStatusFilter = "all" | "active" | "inactive";

export type DeliveryLog = {
  id: number;
  status: string;
  message: string;
  recipient_count: number;
  timestamp: string;
};

export type NotificationAnalytics = {
  total_sent: number;
  delivered: number;
  opened: number;
  failed: number;
  ctr: number;
  delivery_rate: number;
  last_delivery_at: string | null;
};

export type AudienceFilters = {
  segments?: AudienceType[];
  city?: string;
  state?: string;
  country?: string;
  age_group?: string;
  gender?: string;
  disease?: string;
  appointment_status?: AppointmentStatusFilter;
  activity_status?: ActivityStatusFilter;
  custom_user_ids?: number[];
  tags?: string[];
};

export type NotificationCampaign = {
  id: number;
  notification_id: string;
  title: string;
  subtitle: string;
  description: string;
  body?: string;
  delivery_type: DeliveryType;
  scheduled_at: string | null;
  audience: string;
  audience_type: AudienceType;
  estimated_recipients: number;
  status: NotificationStatus;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
  category: string;
  deep_link: string;
  action_button: string;
  cta_destination?: string;
  image_url: string | null;
  timezone: string;
  repeat_enabled: boolean;
  recurrence?: RecurrenceType;
  priority?: NotificationPriority;
  silent?: boolean;
  require_user_action?: boolean;
  expiration_at?: string | null;
  campaign_tags?: string[];
  internal_notes?: string;
  attachments?: string[];
  audience_filters?: AudienceFilters;
  audience_snapshot?: AudienceFilters;
  analytics?: NotificationAnalytics;
  delivery_logs?: DeliveryLog[];
};

export type NotificationFormData = {
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  image_file_name: string;
  deep_link: string;
  action_button: string;
  cta_destination: string;
  category: string;
  audience_type: AudienceType;
  audience_filters: AudienceFilters;
  delivery_type: DeliveryType;
  send_now: boolean;
  scheduled_at: string;
  scheduled_time: string;
  timezone: string;
  recurrence: RecurrenceType;
  priority: NotificationPriority;
  silent: boolean;
  require_user_action: boolean;
  expiration_at: string;
  expiration_time: string;
  campaign_tags: string;
  internal_notes: string;
  attachments: string;
  status: NotificationStatus;
};

export const AUDIENCE_OPTIONS: { label: string; value: AudienceType }[] = [
  { label: "All Users", value: "all_users" },
  { label: "Patients", value: "patients" },
  { label: "Doctors", value: "doctors" },
  { label: "Caregivers", value: "caregivers" },
  { label: "Premium Members", value: "premium" },
  { label: "Free Users", value: "free" },
  { label: "Custom Segment", value: "custom_segment" },
];

export const SEGMENT_OPTIONS = AUDIENCE_OPTIONS.filter((a) => a.value !== "custom_segment");

export const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "UTC",
  "America/New_York",
  "Europe/London",
];

export const PRIORITY_OPTIONS: { label: string; value: NotificationPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export const RECURRENCE_OPTIONS: { label: string; value: RecurrenceType }[] = [
  { label: "No repeat", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export const STATUS_OPTIONS: { label: string; value: NotificationStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Sending", value: "sending" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

export const CATEGORY_OPTIONS = [
  "Health Alert",
  "Appointment Reminder",
  "Medication",
  "Wellness Tips",
  "Subscription",
  "System Update",
  "Promotional",
];

const audienceLabel = (type: AudienceType, filters?: AudienceFilters) => {
  const segments = filters?.segments?.length
    ? filters.segments.map((s) => AUDIENCE_OPTIONS.find((a) => a.value === s)?.label ?? s).join(", ")
    : AUDIENCE_OPTIONS.find((a) => a.value === type)?.label ?? type;
  const parts = [filters?.city, filters?.state, filters?.country, filters?.disease].filter(Boolean);
  if (parts.length) return `${segments} · ${parts.join(", ")}`;
  return segments;
};

export function estimateRecipientsFromForm(form: NotificationFormData): number {
  const filters = form.audience_filters;
  const segments = filters.segments?.length ? filters.segments : [form.audience_type];

  const base: Record<AudienceType, number> = {
    all_users: 1248,
    patients: 1186,
    doctors: 42,
    caregivers: 156,
    premium: 412,
    free: 836,
    custom_segment: 180,
  };

  let count = segments.reduce((sum, seg) => sum + (base[seg] ?? 0), 0);
  if (segments.length > 1) count = Math.round(count * 0.72);

  if (filters.city) count = Math.round(count * 0.35);
  if (filters.state) count = Math.round(count * 0.55);
  if (filters.country) count = Math.round(count * 0.85);
  if (filters.gender) count = Math.round(count * 0.48);
  if (filters.age_group) count = Math.round(count * 0.4);
  if (filters.disease) count = Math.round(count * 0.12);
  if (filters.appointment_status && filters.appointment_status !== "all") count = Math.round(count * 0.25);
  if (filters.activity_status === "active") count = Math.round(count * 0.88);
  if (filters.activity_status === "inactive") count = Math.round(count * 0.12);
  if (filters.tags?.length) count = Math.round(count * (0.9 - filters.tags.length * 0.05));
  if (filters.custom_user_ids?.length) count = filters.custom_user_ids.length;

  return Math.max(count, filters.custom_user_ids?.length ?? 1);
}

const estimateRecipients = (type: AudienceType, filters?: AudienceFilters) => {
  return estimateRecipientsFromForm({
    audience_type: type,
    audience_filters: filters ?? {},
  } as NotificationFormData);
};

export const notificationAnalyticsSummary: NotificationAnalytics = {
  total_sent: 28450,
  delivered: 27102,
  opened: 9840,
  failed: 348,
  ctr: 36.3,
  delivery_rate: 95.3,
  last_delivery_at: "2026-07-10T09:15:00",
};

export let notificationCampaigns: NotificationCampaign[] = [
  {
    id: 1,
    notification_id: "NOTIF-2026-0041",
    title: "Monsoon Health Advisory",
    subtitle: "Stay protected this season",
    description: "Increase hydration and watch for vector-borne illness symptoms. Book a preventive checkup through SehatVaani.",
    delivery_type: "scheduled",
    scheduled_at: "2026-07-12T08:00:00",
    audience: "All Users",
    audience_type: "all_users",
    estimated_recipients: 1248,
    status: "scheduled",
    created_by: "Dr. Meera Nair",
    created_at: "2026-07-09T14:20:00",
    category: "Health Alert",
    deep_link: "sehatvaani://health-advisory",
    action_button: "View Advisory",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
  },
  {
    id: 2,
    notification_id: "NOTIF-2026-0040",
    title: "Premium Plan Renewal Reminder",
    subtitle: "Your benefits expire soon",
    description: "Renew your Pro plan to keep unlimited AI consultations and family health records.",
    delivery_type: "instant",
    scheduled_at: null,
    audience: "Premium Members",
    audience_type: "premium",
    estimated_recipients: 412,
    status: "sent",
    created_by: "Rajesh Gupta",
    created_at: "2026-07-08T10:00:00",
    category: "Subscription",
    deep_link: "sehatvaani://subscriptions",
    action_button: "Renew Now",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    analytics: {
      total_sent: 412,
      delivered: 398,
      opened: 156,
      failed: 14,
      ctr: 39.2,
      delivery_rate: 96.6,
      last_delivery_at: "2026-07-08T10:02:00",
    },
  },
  {
    id: 3,
    notification_id: "NOTIF-2026-0039",
    title: "Diabetes Screening Camp — Mumbai",
    subtitle: "Free HbA1c tests this weekend",
    description: "Patients in Mumbai can register for complimentary diabetes screening at partner clinics.",
    delivery_type: "scheduled",
    scheduled_at: "2026-07-11T07:30:00",
    audience: "Custom: Mumbai, Diabetes",
    audience_type: "custom_segment",
    estimated_recipients: 86,
    status: "scheduled",
    created_by: "Dr. Meera Nair",
    created_at: "2026-07-07T16:45:00",
    category: "Health Alert",
    deep_link: "sehatvaani://camps/diabetes-mumbai",
    action_button: "Register",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: true,
    audience_filters: { city: "Mumbai", disease: "Diabetes" },
  },
  {
    id: 4,
    notification_id: "NOTIF-2026-0038",
    title: "Medication Refill Reminder",
    subtitle: "Hypertension care plan",
    description: "Your prescribed medication schedule indicates a refill may be due. Consult your doctor if needed.",
    delivery_type: "instant",
    scheduled_at: null,
    audience: "Patients",
    audience_type: "patients",
    estimated_recipients: 1186,
    status: "sending",
    created_by: "Kavita Joshi",
    created_at: "2026-07-10T08:30:00",
    category: "Medication",
    deep_link: "sehatvaani://medications",
    action_button: "View Medications",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
  },
  {
    id: 5,
    notification_id: "NOTIF-2026-0037",
    title: "Doctor Portal Maintenance",
    subtitle: "Scheduled downtime tonight",
    description: "Doctor dashboards will be unavailable from 11 PM to 1 AM IST for infrastructure upgrades.",
    delivery_type: "scheduled",
    scheduled_at: "2026-07-10T18:00:00",
    audience: "Doctors",
    audience_type: "doctors",
    estimated_recipients: 42,
    status: "sent",
    created_by: "Rajesh Gupta",
    created_at: "2026-07-09T09:00:00",
    category: "System Update",
    deep_link: "sehatvaani://doctor/status",
    action_button: "Learn More",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    analytics: {
      total_sent: 42,
      delivered: 42,
      opened: 38,
      failed: 0,
      ctr: 90.5,
      delivery_rate: 100,
      last_delivery_at: "2026-07-10T18:01:00",
    },
  },
  {
    id: 6,
    notification_id: "NOTIF-2026-0036",
    title: "Free Tier Feature Highlights",
    subtitle: "Discover what's included",
    description: "Explore AI symptom checker and 5 free report uploads available on your current plan.",
    delivery_type: "instant",
    scheduled_at: null,
    audience: "Free Members",
    audience_type: "free",
    estimated_recipients: 836,
    status: "failed",
    created_by: "Suresh Pillai",
    created_at: "2026-07-06T11:20:00",
    category: "Promotional",
    deep_link: "sehatvaani://features",
    action_button: "Explore Features",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    analytics: {
      total_sent: 836,
      delivered: 0,
      opened: 0,
      failed: 836,
      ctr: 0,
      delivery_rate: 0,
      last_delivery_at: "2026-07-06T11:22:00",
    },
  },
  {
    id: 7,
    notification_id: "NOTIF-2026-0035",
    title: "Weekly Wellness Digest",
    subtitle: "Tips curated for you",
    description: "This week's digest covers sleep hygiene, hydration goals, and seasonal allergy management.",
    delivery_type: "scheduled",
    scheduled_at: "2026-07-15T09:00:00",
    audience: "All Users",
    audience_type: "all_users",
    estimated_recipients: 1248,
    status: "draft",
    created_by: "Dr. Meera Nair",
    created_at: "2026-07-10T07:00:00",
    category: "Wellness Tips",
    deep_link: "sehatvaani://wellness/digest",
    action_button: "Read Digest",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: true,
  },
  {
    id: 8,
    notification_id: "NOTIF-2026-0034",
    title: "Appointment Confirmation",
    subtitle: "Teleconsultation tomorrow",
    description: "Your video consultation with Dr. Sharma is confirmed for tomorrow at 10:30 AM IST.",
    delivery_type: "instant",
    scheduled_at: null,
    audience: "Custom Segment",
    audience_type: "custom_segment",
    estimated_recipients: 3,
    status: "sent",
    created_by: "Kavita Joshi",
    created_at: "2026-07-05T15:00:00",
    category: "Appointment Reminder",
    deep_link: "sehatvaani://appointments/8842",
    action_button: "Join Call",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    audience_filters: { custom_user_ids: [1, 2, 4] },
    analytics: {
      total_sent: 3,
      delivered: 3,
      opened: 3,
      failed: 0,
      ctr: 100,
      delivery_rate: 100,
      last_delivery_at: "2026-07-05T15:01:00",
    },
  },
  {
    id: 9,
    notification_id: "NOTIF-2026-0033",
    title: "Vaccination Drive — Maharashtra",
    subtitle: "Adult immunization awareness",
    description: "State-wide vaccination awareness campaign for eligible adults. Find nearest centers.",
    delivery_type: "scheduled",
    scheduled_at: "2026-07-14T06:00:00",
    audience: "Custom: Maharashtra",
    audience_type: "custom_segment",
    estimated_recipients: 245,
    status: "cancelled",
    created_by: "Rajesh Gupta",
    created_at: "2026-07-04T12:00:00",
    category: "Health Alert",
    deep_link: "sehatvaani://vaccination",
    action_button: "Find Centers",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    audience_filters: { state: "Maharashtra" },
  },
  {
    id: 10,
    notification_id: "NOTIF-2026-0032",
    title: "Lab Report Ready",
    subtitle: "CBC results uploaded",
    description: "Your latest Complete Blood Count report is ready for review in Medical Records.",
    delivery_type: "instant",
    scheduled_at: null,
    audience: "Patients",
    audience_type: "patients",
    estimated_recipients: 520,
    status: "sent",
    created_by: "System",
    created_at: "2026-07-03T08:00:00",
    category: "Health Alert",
    deep_link: "sehatvaani://reports",
    action_button: "View Report",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    analytics: {
      total_sent: 520,
      delivered: 508,
      opened: 312,
      failed: 12,
      ctr: 61.4,
      delivery_rate: 97.7,
      last_delivery_at: "2026-07-03T08:05:00",
    },
  },
  {
    id: 11,
    notification_id: "NOTIF-2026-0031",
    title: "Senior Care Check-in",
    subtitle: "Age 60+ wellness program",
    description: "Monthly wellness check-in for senior patients. Complete your health questionnaire.",
    delivery_type: "scheduled",
    scheduled_at: "2026-07-13T10:00:00",
    audience: "Custom: 60+",
    audience_type: "custom_segment",
    estimated_recipients: 94,
    status: "draft",
    created_by: "Dr. Meera Nair",
    created_at: "2026-07-02T09:30:00",
    category: "Wellness Tips",
    deep_link: "sehatvaani://senior-care",
    action_button: "Start Check-in",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    audience_filters: { age_group: "60+" },
  },
  {
    id: 12,
    notification_id: "NOTIF-2026-0030",
    title: "Flash Sale — Family Plan",
    subtitle: "Limited time offer",
    description: "Upgrade to Family Plus at 20% off for the first month. Cover up to 10 family members.",
    delivery_type: "instant",
    scheduled_at: null,
    audience: "Free Members",
    audience_type: "free",
    estimated_recipients: 836,
    status: "sent",
    created_by: "Rajesh Gupta",
    created_at: "2026-06-28T14:00:00",
    category: "Promotional",
    deep_link: "sehatvaani://plans/family",
    action_button: "Upgrade",
    image_url: null,
    timezone: "Asia/Kolkata",
    repeat_enabled: false,
    analytics: {
      total_sent: 836,
      delivered: 801,
      opened: 245,
      failed: 35,
      ctr: 30.6,
      delivery_rate: 95.8,
      last_delivery_at: "2026-06-28T14:03:00",
    },
  },
];

let nextId = Math.max(...notificationCampaigns.map((n) => n.id), 0) + 1;

export function getDefaultFormData(): NotificationFormData {
  return {
    title: "",
    subtitle: "",
    body: "",
    image_url: "",
    image_file_name: "",
    deep_link: "",
    action_button: "Open",
    cta_destination: "",
    category: "Health Alert",
    audience_type: "all_users",
    audience_filters: { segments: ["all_users"], appointment_status: "all", activity_status: "all", tags: [] },
    delivery_type: "instant",
    send_now: true,
    scheduled_at: "",
    scheduled_time: "09:00",
    timezone: "Asia/Kolkata",
    recurrence: "none",
    priority: "normal",
    silent: false,
    require_user_action: false,
    expiration_at: "",
    expiration_time: "23:59",
    campaign_tags: "",
    internal_notes: "",
    attachments: "",
    status: "draft",
  };
}

export function campaignToForm(c: NotificationCampaign): NotificationFormData {
  const scheduled = c.scheduled_at ? new Date(c.scheduled_at) : null;
  const exp = c.expiration_at ? new Date(c.expiration_at) : null;
  return {
    title: c.title,
    subtitle: c.subtitle,
    body: c.body ?? c.description,
    image_url: c.image_url ?? "",
    image_file_name: "",
    deep_link: c.deep_link,
    action_button: c.action_button,
    cta_destination: c.cta_destination ?? "",
    category: c.category,
    audience_type: c.audience_type,
    audience_filters: c.audience_filters ?? { segments: [c.audience_type], appointment_status: "all", activity_status: "all", tags: [] },
    delivery_type: c.delivery_type,
    send_now: c.delivery_type === "instant",
    scheduled_at: scheduled ? scheduled.toISOString().slice(0, 10) : "",
    scheduled_time: scheduled ? scheduled.toTimeString().slice(0, 5) : "09:00",
    timezone: c.timezone,
    recurrence: c.recurrence ?? (c.repeat_enabled ? "weekly" : "none"),
    priority: c.priority ?? "normal",
    silent: c.silent ?? false,
    require_user_action: c.require_user_action ?? false,
    expiration_at: exp ? exp.toISOString().slice(0, 10) : "",
    expiration_time: exp ? exp.toTimeString().slice(0, 5) : "23:59",
    campaign_tags: (c.campaign_tags ?? []).join(", "),
    internal_notes: c.internal_notes ?? "",
    attachments: (c.attachments ?? []).join(", "),
    status: c.status,
  };
}

function buildScheduledAt(form: NotificationFormData): string | null {
  if (form.send_now) return null;
  if (!form.scheduled_at) return null;
  return `${form.scheduled_at}T${form.scheduled_time}:00`;
}

function buildExpirationAt(form: NotificationFormData): string | null {
  if (!form.expiration_at) return null;
  return `${form.expiration_at}T${form.expiration_time}:00`;
}

export function formToCampaignPayload(
  form: NotificationFormData,
  id: number,
  notificationId: string,
  createdBy: string,
  existing?: NotificationCampaign
): NotificationCampaign {
  const delivery_type: DeliveryType = form.send_now ? "instant" : "scheduled";
  const status: NotificationStatus =
    form.status === "draft"
      ? "draft"
      : delivery_type === "scheduled"
        ? "scheduled"
        : "sending";

  const now = new Date().toISOString();

  return {
    id,
    notification_id: notificationId,
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    description: form.subtitle.trim(),
    body: form.body.trim() || undefined,
    delivery_type,
    scheduled_at: buildScheduledAt(form),
    audience: audienceLabel(form.audience_type, form.audience_filters),
    audience_type: form.audience_type,
    estimated_recipients: estimateRecipientsFromForm(form),
    status,
    created_by: existing?.created_by ?? createdBy,
    updated_by: createdBy,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    category: form.category,
    deep_link: form.deep_link.trim(),
    action_button: form.action_button.trim(),
    cta_destination: form.cta_destination.trim() || undefined,
    image_url: form.image_url || null,
    timezone: form.timezone,
    repeat_enabled: form.recurrence !== "none",
    recurrence: form.recurrence,
    priority: form.priority,
    silent: form.silent,
    require_user_action: form.require_user_action,
    expiration_at: buildExpirationAt(form),
    campaign_tags: form.campaign_tags.split(",").map((t) => t.trim()).filter(Boolean),
    internal_notes: form.internal_notes.trim() || undefined,
    attachments: form.attachments.split(",").map((t) => t.trim()).filter(Boolean),
    audience_filters: form.audience_filters,
    audience_snapshot: { ...form.audience_filters },
    analytics: existing?.analytics,
    delivery_logs: existing?.delivery_logs,
  };
}

function formToCampaign(
  form: NotificationFormData,
  id: number,
  notificationId: string,
  createdBy: string,
  existing?: NotificationCampaign
): NotificationCampaign {
  return formToCampaignPayload(form, id, notificationId, createdBy, existing);
}

export function createNotificationCampaign(form: NotificationFormData, createdBy: string) {
  const id = nextId++;
  const notificationId = `NOTIF-2026-${String(id).padStart(4, "0")}`;
  const campaign = formToCampaign(form, id, notificationId, createdBy);
  notificationCampaigns = [campaign, ...notificationCampaigns];
  return campaign;
}

export function updateNotificationCampaign(id: number, form: NotificationFormData) {
  const idx = notificationCampaigns.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  const existing = notificationCampaigns[idx];
  const updated = formToCampaign(form, id, existing.notification_id, existing.created_by, existing);
  notificationCampaigns[idx] = updated;
  return updated;
}

export function deleteNotificationCampaign(id: number) {
  notificationCampaigns = notificationCampaigns.filter((n) => n.id !== id);
}

export function duplicateNotificationCampaign(id: number, createdBy: string) {
  const source = notificationCampaigns.find((n) => n.id === id);
  if (!source) return null;
  const newId = nextId++;
  const copy: NotificationCampaign = {
    ...source,
    id: newId,
    notification_id: `NOTIF-2026-${String(newId).padStart(4, "0")}`,
    title: `${source.title} (Copy)`,
    status: "draft",
    created_by: createdBy,
    created_at: new Date().toISOString(),
    scheduled_at: null,
    delivery_type: "instant",
    analytics: undefined,
  };
  notificationCampaigns = [copy, ...notificationCampaigns];
  return copy;
}

export function cancelScheduledNotification(id: number) {
  const item = notificationCampaigns.find((n) => n.id === id);
  if (item && item.status === "scheduled") {
    item.status = "cancelled";
  }
  return item;
}

export function resendNotification(id: number) {
  const item = notificationCampaigns.find((n) => n.id === id);
  if (item && (item.status === "sent" || item.status === "failed")) {
    item.status = "sending";
    setTimeout(() => {
      item.status = "sent";
      item.analytics = {
        total_sent: item.estimated_recipients,
        delivered: Math.round(item.estimated_recipients * 0.96),
        opened: Math.round(item.estimated_recipients * 0.35),
        failed: Math.round(item.estimated_recipients * 0.04),
        ctr: 35,
        delivery_rate: 96,
        last_delivery_at: new Date().toISOString(),
      };
    }, 1500);
  }
  return item;
}

export function sendDraftNow(id: number) {
  const item = notificationCampaigns.find((n) => n.id === id);
  if (!item || item.status !== "draft") return item;
  item.status = "sending";
  item.delivery_type = "instant";
  item.scheduled_at = null;
  return item;
}
