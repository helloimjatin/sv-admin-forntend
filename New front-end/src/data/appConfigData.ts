export type ConfigGroup =
  | "general"
  | "maintenance"
  | "version"
  | "auth"
  | "notifications"
  | "ai"
  | "storage"
  | "integrations"
  | "security"
  | "features"
  | "api"
  | "system";

export type ReleaseType = "major" | "minor" | "patch" | "hotfix";
export type Platform = "android" | "ios" | "web" | "admin" | "api";
export type VersionStatus = "stable" | "beta" | "deprecated" | "rolled_back";

export type AuditLog = {
  id: number;
  changed_by: string;
  timestamp: string;
  module: string;
  config_key: string;
  previous_value: string;
  new_value: string;
  reason: string;
};

export type ConfigEntry = {
  key: string;
  value: string | number | boolean | object;
  group: ConfigGroup;
  environment: string;
  is_encrypted: boolean;
  version: number;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type AppVersionRelease = {
  id: number;
  version: string;
  build_number: string;
  release_type: ReleaseType;
  platform: Platform;
  changelog: string;
  release_notes: string;
  breaking_changes: string;
  force_update: boolean;
  minimum_supported_version: string;
  download_url: string;
  status: VersionStatus;
  published_at: string;
  created_by: string;
};

export type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  category: string;
};

export type IntegrationConfig = {
  key: string;
  label: string;
  enabled: boolean;
  credentials: Record<string, string>;
  health: "healthy" | "degraded" | "down" | "unconfigured";
  last_sync: string | null;
  last_test: string | null;
};

export type MaintenanceLog = {
  id: number;
  title: string;
  started_at: string;
  ended_at: string | null;
  triggered_by: string;
  emergency: boolean;
};

export type MaintenanceSettings = {
  enabled: boolean;
  emergency: boolean;
  title: string;
  description: string;
  estimated_downtime: string;
  banner_image: string;
  allow_admin_access: boolean;
  bypass_roles: string[];
  scheduled: boolean;
  start_at: string;
  start_time: string;
  end_at: string;
  end_time: string;
};

export type GeneralSettings = {
  app_name: string;
  support_email: string;
  support_phone: string;
  default_locale: string;
  timezone: string;
  currency: string;
  environment: string;
};

export type AuthSettings = {
  email_login: boolean;
  mobile_otp: boolean;
  google_login: boolean;
  apple_login: boolean;
  two_factor: boolean;
  session_timeout_minutes: number;
  password_min_length: number;
  password_require_special: boolean;
  device_limit: number;
  lock_after_failures: number;
  lock_duration_minutes: number;
};

export type NotificationSettings = {
  push: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  retry_count: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  expiry_hours: number;
  default_template: string;
};

export type AISettings = {
  provider: string;
  model: string;
  api_key: string;
  rate_limit_rpm: number;
  token_limit: number;
  temperature: number;
  prompt_template: string;
  logging_enabled: boolean;
  analytics_enabled: boolean;
};

export type StorageSettings = {
  max_upload_mb: number;
  allowed_types: string;
  image_compression: boolean;
  provider: string;
  backup_location: string;
  cdn_url: string;
  cache_ttl_seconds: number;
};

export type SecuritySettings = {
  jwt_expiry_hours: number;
  api_rate_limit: number;
  cors_enabled: boolean;
  allowed_origins: string;
  security_headers: boolean;
  encryption_at_rest: boolean;
  audit_logs_enabled: boolean;
  ip_whitelist: string;
  api_key_rotation_days: number;
};

export type ApiSettings = {
  base_url: string;
  public_key: string;
  rate_limit_burst: number;
  webhook_url: string;
  sandbox_mode: boolean;
};

export type SystemInfo = {
  environment: string;
  app_version: string;
  database_version: string;
  server_status: string;
  storage_used_gb: number;
  storage_total_gb: number;
  active_users: number;
  queue_status: string;
  cache_status: string;
  background_jobs: number;
  last_deployment: string;
  last_backup: string;
};

export const APP_CONFIG_TABS = [
  { id: "general", label: "General Settings", icon: "settings" },
  { id: "version", label: "App Version", icon: "new_releases" },
  { id: "maintenance", label: "Maintenance Mode", icon: "engineering" },
  { id: "auth", label: "Authentication", icon: "lock" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "ai", label: "AI Configuration", icon: "smart_toy" },
  { id: "storage", label: "Storage", icon: "cloud" },
  { id: "integrations", label: "Integrations", icon: "extension" },
  { id: "security", label: "Security", icon: "security" },
  { id: "features", label: "Feature Flags", icon: "toggle_on" },
  { id: "api", label: "API Settings", icon: "api" },
  { id: "system", label: "System Information", icon: "monitor_heart" },
  { id: "history", label: "Configuration History", icon: "history" },
] as const;

export type AppConfigTabId = (typeof APP_CONFIG_TABS)[number]["id"];

export let generalSettings: GeneralSettings = {
  app_name: "SehatVaani",
  support_email: "support@sehatvaani.com",
  support_phone: "+91 1800-123-4567",
  default_locale: "en-IN",
  timezone: "Asia/Kolkata",
  currency: "INR",
  environment: "production",
};

export let maintenanceSettings: MaintenanceSettings = {
  enabled: false,
  emergency: false,
  title: "We'll be back soon",
  description: "SehatVaani is undergoing scheduled maintenance to improve healthcare services.",
  estimated_downtime: "2 hours",
  banner_image: "",
  allow_admin_access: true,
  bypass_roles: ["Super Admin"],
  scheduled: false,
  start_at: "",
  start_time: "02:00",
  end_at: "",
  end_time: "04:00",
};

export let maintenanceLogs: MaintenanceLog[] = [
  { id: 1, title: "Database upgrade", started_at: "2026-06-01T02:00:00", ended_at: "2026-06-01T03:30:00", triggered_by: "Dr. Meera Nair", emergency: false },
  { id: 2, title: "Emergency API outage", started_at: "2026-05-12T14:00:00", ended_at: "2026-05-12T15:10:00", triggered_by: "Rajesh Gupta", emergency: true },
];

export let appVersions: AppVersionRelease[] = [
  { id: 1, version: "2.4.1", build_number: "241", release_type: "patch", platform: "android", changelog: "Bug fixes for report upload", release_notes: "Stability improvements", breaking_changes: "", force_update: false, minimum_supported_version: "2.0.0", download_url: "https://play.google.com/store/apps/details?id=com.sehatvaani", status: "stable", published_at: "2026-07-01T10:00:00", created_by: "Rajesh Gupta" },
  { id: 2, version: "2.4.0", build_number: "240", release_type: "minor", platform: "ios", changelog: "AI doctor assistant improvements", release_notes: "New consultation UX", breaking_changes: "", force_update: false, minimum_supported_version: "2.0.0", download_url: "https://apps.apple.com/app/sehatvaani", status: "stable", published_at: "2026-06-20T10:00:00", created_by: "Dr. Meera Nair" },
  { id: 3, version: "2.3.0", build_number: "230", release_type: "minor", platform: "web", changelog: "Patient portal redesign", release_notes: "Responsive layout updates", breaking_changes: "Legacy booking URL removed", force_update: false, minimum_supported_version: "2.1.0", download_url: "https://sehatvaani.com", status: "deprecated", published_at: "2026-05-01T10:00:00", created_by: "Kavita Joshi" },
  { id: 4, version: "1.8.2", build_number: "182", release_type: "hotfix", platform: "api", changelog: "Auth token refresh fix", release_notes: "Critical hotfix", breaking_changes: "", force_update: true, minimum_supported_version: "1.8.0", download_url: "https://api.sehatvaani.com", status: "stable", published_at: "2026-07-05T08:00:00", created_by: "Suresh Pillai" },
  { id: 5, version: "2.0.0", build_number: "200", release_type: "major", platform: "admin", changelog: "Next.js admin console", release_notes: "Full UI redesign", breaking_changes: "PHP panel deprecated", force_update: false, minimum_supported_version: "2.0.0", download_url: "https://admin.sehatvaani.com", status: "stable", published_at: "2026-04-15T10:00:00", created_by: "Dr. Meera Nair" },
];

export let currentVersions: Record<Platform, { stable: string; previous: string; min_supported: string }> = {
  android: { stable: "2.4.1", previous: "2.4.0", min_supported: "2.0.0" },
  ios: { stable: "2.4.0", previous: "2.3.2", min_supported: "2.0.0" },
  web: { stable: "2.5.0", previous: "2.3.0", min_supported: "2.1.0" },
  admin: { stable: "2.0.0", previous: "1.9.0", min_supported: "2.0.0" },
  api: { stable: "1.8.2", previous: "1.8.1", min_supported: "1.8.0" },
};

export let featureFlags: FeatureFlag[] = [
  { key: "ai_chat", label: "AI Chat", description: "In-app AI health chat", enabled: true, category: "AI" },
  { key: "ai_doctor", label: "AI Doctor Assistant", description: "AI-assisted clinical suggestions", enabled: true, category: "AI" },
  { key: "video_consult", label: "Video Consultation", description: "Teleconsultation video calls", enabled: true, category: "Care" },
  { key: "appointments", label: "Appointment Booking", description: "Schedule doctor appointments", enabled: true, category: "Care" },
  { key: "medicine_reminder", label: "Medicine Reminder", description: "Medication schedule alerts", enabled: true, category: "Health" },
  { key: "health_reports", label: "Health Reports", description: "Lab and diagnostic reports", enabled: true, category: "Health" },
  { key: "premium", label: "Premium Membership", description: "Paid subscription plans", enabled: true, category: "Monetization" },
  { key: "push_notifications", label: "Notifications", description: "Push notification delivery", enabled: true, category: "Engagement" },
  { key: "health_tracking", label: "Health Tracking", description: "Vitals and wellness tracking", enabled: false, category: "Health" },
  { key: "emergency_sos", label: "Emergency SOS", description: "Emergency contact SOS flow", enabled: true, category: "Safety" },
  { key: "wearable_sync", label: "Wearable Device Sync", description: "Sync fitness wearables", enabled: false, category: "Integrations" },
  { key: "lab_reports", label: "Lab Reports", description: "Partner lab report ingestion", enabled: true, category: "Health" },
];

export let authSettings: AuthSettings = {
  email_login: true,
  mobile_otp: true,
  google_login: true,
  apple_login: false,
  two_factor: true,
  session_timeout_minutes: 60,
  password_min_length: 8,
  password_require_special: true,
  device_limit: 3,
  lock_after_failures: 5,
  lock_duration_minutes: 30,
};

export let notificationSettings: NotificationSettings = {
  push: true,
  email: true,
  sms: true,
  whatsapp: false,
  retry_count: 3,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
  expiry_hours: 72,
  default_template: "health_alert_v1",
};

export let aiSettings: AISettings = {
  provider: "OpenAI",
  model: "gpt-4o-mini",
  api_key: "sk-••••••••••••••••",
  rate_limit_rpm: 60,
  token_limit: 4096,
  temperature: 0.4,
  prompt_template: "You are SehatVaani AI, a healthcare assistant. Be accurate and cautious.",
  logging_enabled: true,
  analytics_enabled: true,
};

export let storageSettings: StorageSettings = {
  max_upload_mb: 25,
  allowed_types: "jpg,png,pdf,dicom,mp4",
  image_compression: true,
  provider: "AWS S3",
  backup_location: "s3://sehatvaani-backups",
  cdn_url: "https://cdn.sehatvaani.com",
  cache_ttl_seconds: 3600,
};

export let securitySettings: SecuritySettings = {
  jwt_expiry_hours: 24,
  api_rate_limit: 1000,
  cors_enabled: true,
  allowed_origins: "https://sehatvaani.com,https://admin.sehatvaani.com",
  security_headers: true,
  encryption_at_rest: true,
  audit_logs_enabled: true,
  ip_whitelist: "",
  api_key_rotation_days: 90,
};

export let apiSettings: ApiSettings = {
  base_url: "https://api.sehatvaani.com/v1",
  public_key: "sehat_live_2026_secure_key",
  rate_limit_burst: 100,
  webhook_url: "https://api.sehatvaani.com/webhooks",
  sandbox_mode: false,
};

export let integrations: IntegrationConfig[] = [
  { key: "firebase", label: "Firebase", enabled: true, credentials: { project_id: "sehatvaani-prod", api_key: "••••" }, health: "healthy", last_sync: "2026-07-10T08:00:00", last_test: "2026-07-10T08:00:00" },
  { key: "google_maps", label: "Google Maps", enabled: true, credentials: { api_key: "••••" }, health: "healthy", last_sync: "2026-07-09T12:00:00", last_test: "2026-07-09T12:00:00" },
  { key: "razorpay", label: "Razorpay", enabled: true, credentials: { key_id: "rzp_live_••••", key_secret: "••••" }, health: "healthy", last_sync: "2026-07-10T07:30:00", last_test: "2026-07-08T10:00:00" },
  { key: "stripe", label: "Stripe", enabled: false, credentials: { secret_key: "", publishable_key: "" }, health: "unconfigured", last_sync: null, last_test: null },
  { key: "twilio", label: "Twilio", enabled: true, credentials: { account_sid: "AC••••", auth_token: "••••" }, health: "healthy", last_sync: "2026-07-10T06:00:00", last_test: "2026-07-10T06:00:00" },
  { key: "whatsapp", label: "WhatsApp Cloud API", enabled: false, credentials: { phone_id: "", token: "" }, health: "unconfigured", last_sync: null, last_test: null },
  { key: "sendgrid", label: "SendGrid", enabled: true, credentials: { api_key: "••••" }, health: "degraded", last_sync: "2026-07-09T18:00:00", last_test: "2026-07-09T18:00:00" },
  { key: "openai", label: "OpenAI", enabled: true, credentials: { api_key: "••••" }, health: "healthy", last_sync: "2026-07-10T09:00:00", last_test: "2026-07-10T09:00:00" },
  { key: "gemini", label: "Gemini", enabled: false, credentials: { api_key: "" }, health: "unconfigured", last_sync: null, last_test: null },
  { key: "openrouter", label: "OpenRouter", enabled: false, credentials: { api_key: "" }, health: "unconfigured", last_sync: null, last_test: null },
  { key: "aws_s3", label: "AWS S3", enabled: true, credentials: { bucket: "sehatvaani-media", region: "ap-south-1" }, health: "healthy", last_sync: "2026-07-10T08:30:00", last_test: "2026-07-10T08:30:00" },
  { key: "cloudinary", label: "Cloudinary", enabled: false, credentials: { cloud_name: "", api_key: "" }, health: "unconfigured", last_sync: null, last_test: null },
];

export let systemInfo: SystemInfo = {
  environment: "production",
  app_version: "2.0.0",
  database_version: "MySQL 8.0.36",
  server_status: "Healthy",
  storage_used_gb: 128.4,
  storage_total_gb: 500,
  active_users: 1186,
  queue_status: "Idle (12 pending)",
  cache_status: "Redis OK · 94% hit rate",
  background_jobs: 3,
  last_deployment: "2026-07-08T16:20:00",
  last_backup: "2026-07-10T02:00:00",
};

export let configAuditLogs: AuditLog[] = [
  { id: 1, changed_by: "Dr. Meera Nair", timestamp: "2026-07-09T11:00:00", module: "Feature Flags", config_key: "wearable_sync", previous_value: "true", new_value: "false", reason: "Partner API unstable" },
  { id: 2, changed_by: "Rajesh Gupta", timestamp: "2026-07-08T15:30:00", module: "Security", config_key: "jwt_expiry_hours", previous_value: "12", new_value: "24", reason: "Reduce re-login friction" },
  { id: 3, changed_by: "Kavita Joshi", timestamp: "2026-07-07T09:00:00", module: "Notifications", config_key: "whatsapp", previous_value: "true", new_value: "false", reason: "Awaiting Meta approval" },
];

let auditId = 4;
let versionId = 6;
let maintenanceLogId = 3;

export function addAudit(entry: Omit<AuditLog, "id" | "timestamp">) {
  configAuditLogs = [{ id: auditId++, timestamp: new Date().toISOString(), ...entry }, ...configAuditLogs];
}

export function toggleFeatureFlag(key: string, enabled: boolean, editor: string, reason = "Admin toggle") {
  const flag = featureFlags.find((f) => f.key === key);
  if (!flag) return;
  const prev = String(flag.enabled);
  flag.enabled = enabled;
  addAudit({ changed_by: editor, module: "Feature Flags", config_key: key, previous_value: prev, new_value: String(enabled), reason });
}

export function updateMaintenance(data: Partial<MaintenanceSettings>, editor: string) {
  const prev = maintenanceSettings.enabled;
  maintenanceSettings = { ...maintenanceSettings, ...data };
  if (data.enabled !== undefined && data.enabled !== prev) {
    if (data.enabled) {
      maintenanceLogs = [{
        id: maintenanceLogId++,
        title: maintenanceSettings.title,
        started_at: new Date().toISOString(),
        ended_at: null,
        triggered_by: editor,
        emergency: maintenanceSettings.emergency,
      }, ...maintenanceLogs];
    } else {
      const open = maintenanceLogs.find((l) => !l.ended_at);
      if (open) open.ended_at = new Date().toISOString();
    }
  }
  addAudit({
    changed_by: editor,
    module: "Maintenance",
    config_key: "maintenance.enabled",
    previous_value: String(prev),
    new_value: String(maintenanceSettings.enabled),
    reason: data.emergency ? "Emergency maintenance" : "Maintenance update",
  });
}

export function publishVersion(release: Omit<AppVersionRelease, "id" | "published_at" | "status">, editor: string) {
  const item: AppVersionRelease = {
    ...release,
    id: versionId++,
    status: "stable",
    published_at: new Date().toISOString(),
    created_by: editor,
  };
  appVersions = [item, ...appVersions];
  const cur = currentVersions[release.platform];
  currentVersions[release.platform] = {
    previous: cur.stable,
    stable: release.version,
    min_supported: release.minimum_supported_version || cur.min_supported,
  };
  addAudit({
    changed_by: editor,
    module: "App Version",
    config_key: `${release.platform}.version`,
    previous_value: cur.stable,
    new_value: release.version,
    reason: release.release_notes || "New release",
  });
  return item;
}

export function rollbackVersion(id: number, editor: string) {
  const item = appVersions.find((v) => v.id === id);
  if (!item) return null;
  item.status = "rolled_back";
  const cur = currentVersions[item.platform];
  currentVersions[item.platform] = {
    stable: cur.previous,
    previous: item.version,
    min_supported: cur.min_supported,
  };
  addAudit({
    changed_by: editor,
    module: "App Version",
    config_key: `${item.platform}.rollback`,
    previous_value: item.version,
    new_value: cur.previous,
    reason: "Rollback requested",
  });
  return item;
}

export function testIntegration(key: string, editor: string) {
  const item = integrations.find((i) => i.key === key);
  if (!item) return null;
  item.last_test = new Date().toISOString();
  item.health = item.enabled && Object.values(item.credentials).some((v) => v && !v.includes("••••") === false || v.length > 0)
    ? "healthy"
    : item.enabled
      ? "healthy"
      : "unconfigured";
  if (item.enabled) item.health = "healthy";
  addAudit({
    changed_by: editor,
    module: "Integrations",
    config_key: `${key}.test`,
    previous_value: "—",
    new_value: item.health,
    reason: "Connection test",
  });
  return item;
}

export function rollbackAudit(logId: number, editor: string) {
  const log = configAuditLogs.find((l) => l.id === logId);
  if (!log) return false;
  if (log.module === "Feature Flags") {
    const flag = featureFlags.find((f) => f.key === log.config_key);
    if (flag) flag.enabled = log.previous_value === "true";
  }
  addAudit({
    changed_by: editor,
    module: log.module,
    config_key: log.config_key,
    previous_value: log.new_value,
    new_value: log.previous_value,
    reason: `Rollback of change #${logId}`,
  });
  return true;
}

export function getDefaultGeneral(): GeneralSettings {
  return { ...generalSettings };
}
