import {
  generalSettings,
  maintenanceSettings,
  authSettings,
  notificationSettings,
  aiSettings,
  storageSettings,
  securitySettings,
  apiSettings,
  featureFlags,
  integrations,
  currentVersions,
  appVersions,
  configAuditLogs,
  addAudit,
  GeneralSettings,
  MaintenanceSettings,
  AuthSettings,
  NotificationSettings,
  AISettings,
  StorageSettings,
  SecuritySettings,
  ApiSettings,
} from "@/data/appConfigData";

const STORAGE_KEY = "sv-app-config-backup";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function persistGeneral(data: GeneralSettings, editor: string) {
  await delay(400);
  Object.assign(generalSettings, data);
  addAudit({ changed_by: editor, module: "General", config_key: "general", previous_value: "updated", new_value: data.app_name, reason: "General settings saved" });
  return generalSettings;
}

export async function persistMaintenance(data: MaintenanceSettings, editor: string) {
  await delay(400);
  const { updateMaintenance } = await import("@/data/appConfigData");
  updateMaintenance(data, editor);
  return maintenanceSettings;
}

export async function persistAuth(data: AuthSettings, editor: string) {
  await delay(400);
  Object.assign(authSettings, data);
  addAudit({ changed_by: editor, module: "Authentication", config_key: "auth", previous_value: "—", new_value: "updated", reason: "Auth settings saved" });
  return authSettings;
}

export async function persistNotifications(data: NotificationSettings, editor: string) {
  await delay(400);
  Object.assign(notificationSettings, data);
  addAudit({ changed_by: editor, module: "Notifications", config_key: "notifications", previous_value: "—", new_value: "updated", reason: "Notification settings saved" });
  return notificationSettings;
}

export async function persistAI(data: AISettings, editor: string) {
  await delay(400);
  Object.assign(aiSettings, data);
  addAudit({ changed_by: editor, module: "AI Configuration", config_key: "ai", previous_value: "—", new_value: data.provider, reason: "AI settings saved" });
  return aiSettings;
}

export async function persistStorage(data: StorageSettings, editor: string) {
  await delay(400);
  Object.assign(storageSettings, data);
  addAudit({ changed_by: editor, module: "Storage", config_key: "storage", previous_value: "—", new_value: data.provider, reason: "Storage settings saved" });
  return storageSettings;
}

export async function persistSecurity(data: SecuritySettings, editor: string) {
  await delay(400);
  Object.assign(securitySettings, data);
  addAudit({ changed_by: editor, module: "Security", config_key: "security", previous_value: "—", new_value: "updated", reason: "Security settings saved" });
  return securitySettings;
}

export async function persistApi(data: ApiSettings, editor: string) {
  await delay(400);
  Object.assign(apiSettings, data);
  addAudit({ changed_by: editor, module: "API Settings", config_key: "api", previous_value: "—", new_value: data.base_url, reason: "API settings saved" });
  return apiSettings;
}

export function exportConfiguration() {
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    general: generalSettings,
    maintenance: maintenanceSettings,
    auth: authSettings,
    notifications: notificationSettings,
    ai: { ...aiSettings, api_key: "[REDACTED]" },
    storage: storageSettings,
    security: securitySettings,
    api: { ...apiSettings, public_key: "[REDACTED]" },
    features: featureFlags.map((f) => ({ key: f.key, enabled: f.enabled })),
    integrations: integrations.map((i) => ({ key: i.key, enabled: i.enabled, health: i.health })),
    versions: currentVersions,
    releases: appVersions.slice(0, 10),
    audit: configAuditLogs.slice(0, 20),
  }, null, 2);
}

export function backupConfiguration() {
  if (typeof window === "undefined") return;
  const payload = exportConfiguration();
  localStorage.setItem(STORAGE_KEY, payload);
  return payload;
}

export function restoreConfigurationBackup(editor: string) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  addAudit({ changed_by: editor, module: "System", config_key: "backup.restore", previous_value: "—", new_value: "restored", reason: "Configuration restored from backup" });
  return JSON.parse(raw);
}

export function downloadConfigFile() {
  const blob = new Blob([exportConfiguration()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sehatvaani-config-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
