"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useApp } from "@/context/AppContext";
import { cn, formatDateTime } from "@/lib/utils";
import {
  APP_CONFIG_TABS,
  AppConfigTabId,
  generalSettings as generalSeed,
  maintenanceSettings as maintenanceSeed,
  authSettings as authSeed,
  notificationSettings as notifSeed,
  aiSettings as aiSeed,
  storageSettings as storageSeed,
  securitySettings as securitySeed,
  apiSettings as apiSeed,
  featureFlags,
  integrations,
  appVersions,
  currentVersions,
  maintenanceLogs,
  configAuditLogs,
  systemInfo,
  GeneralSettings,
  MaintenanceSettings,
  AuthSettings,
  NotificationSettings,
  AISettings,
  StorageSettings,
  SecuritySettings,
  ApiSettings,
  Platform,
  ReleaseType,
  toggleFeatureFlag,
  publishVersion,
  rollbackVersion,
  testIntegration,
  rollbackAudit,
} from "@/data/appConfigData";
import {
  persistGeneral,
  persistMaintenance,
  persistAuth,
  persistNotifications,
  persistAI,
  persistStorage,
  persistSecurity,
  persistApi,
  backupConfiguration,
  restoreConfigurationBackup,
  downloadConfigFile,
} from "@/lib/appConfigService";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-semibold text-text-muted mb-1.5";
const sectionClass = "rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm py-1">
      <span id={`toggle-${label.replace(/\s+/g, "-").toLowerCase()}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`toggle-${label.replace(/\s+/g, "-").toLowerCase()}`}
        onClick={() => onChange(!checked)}
        className={cn("w-11 h-6 rounded-full transition-colors shrink-0", checked ? "bg-primary" : "bg-surface-elevated")}
      >
        <span className={cn("block w-5 h-5 rounded-full bg-white shadow transform transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      {children}
    </div>
  );
}

function SaveBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/40">
      <span className="text-xs text-text-muted">{dirty ? "Unsaved changes" : "All changes saved"}</span>
      <div className="flex gap-2">
        {onReset && (
          <button type="button" onClick={onReset} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-elevated">
            Reset
          </button>
        )}
        <button type="button" onClick={onSave} disabled={!dirty || saving} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold disabled:opacity-50">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export function AppConfigPanel() {
  const { addToast, adminEmail, bumpRefresh, refreshKey, role } = useApp();
  const [tab, setTab] = useState<AppConfigTabId>("general");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<AppConfigTabId | null>(null);
  const [confirmAction, setConfirmAction] = useState<"maintenance_on" | "force_update" | "rollback" | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);

  // Local editable state
  const [general, setGeneral] = useState<GeneralSettings>({ ...generalSeed });
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({ ...maintenanceSeed });
  const [auth, setAuth] = useState<AuthSettings>({ ...authSeed });
  const [notif, setNotif] = useState<NotificationSettings>({ ...notifSeed });
  const [ai, setAi] = useState<AISettings>({ ...aiSeed });
  const [storage, setStorage] = useState<StorageSettings>({ ...storageSeed });
  const [security, setSecurity] = useState<SecuritySettings>({ ...securitySeed });
  const [api, setApi] = useState<ApiSettings>({ ...apiSeed });

  const [versionForm, setVersionForm] = useState({
    version: "",
    build_number: "",
    release_type: "patch" as ReleaseType,
    platform: "android" as Platform,
    changelog: "",
    release_notes: "",
    breaking_changes: "",
    force_update: false,
    minimum_supported_version: "",
    download_url: "",
  });

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [refreshKey, tab]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const filteredTabs = useMemo(() => {
    if (!search.trim()) return APP_CONFIG_TABS;
    const q = search.toLowerCase();
    return APP_CONFIG_TABS.filter((t) => t.label.toLowerCase().includes(q) || t.id.includes(q));
  }, [search]);

  const switchTab = (next: AppConfigTabId) => {
    if (dirty) setConfirmLeave(next);
    else setTab(next);
  };

  const mark = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, patch: Partial<T>) => {
    setter((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const editor = adminEmail || "Admin";
      if (tab === "general") await persistGeneral(general, editor);
      else if (tab === "maintenance") await persistMaintenance(maintenance, editor);
      else if (tab === "auth") await persistAuth(auth, editor);
      else if (tab === "notifications") await persistNotifications(notif, editor);
      else if (tab === "ai") await persistAI(ai, editor);
      else if (tab === "storage") await persistStorage(storage, editor);
      else if (tab === "security") await persistSecurity(security, editor);
      else if (tab === "api") await persistApi(api, editor);
      else {
        addToast("No form save required for this section", "info");
        setSaving(false);
        return;
      }
      setDirty(false);
      addToast("Configuration saved", "success");
      bumpRefresh();
    } catch {
      addToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishVersion = () => {
    if (!versionForm.version.trim()) {
      addToast("Version number is required", "error");
      return;
    }
    publishVersion({ ...versionForm, created_by: adminEmail || "Admin" }, adminEmail || "Admin");
    addToast(`Version ${versionForm.version} published`, "success");
    setVersionForm({
      version: "", build_number: "", release_type: "patch", platform: "android",
      changelog: "", release_notes: "", breaking_changes: "", force_update: false,
      minimum_supported_version: "", download_url: "",
    });
    bumpRefresh();
  };

  if (role !== "Super Admin" && role !== "Admin") {
    return (
      <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-12 text-center">
        <MaterialIcon name="lock" size={40} className="text-text-muted mx-auto mb-3" />
        <p className="font-semibold">Insufficient permissions</p>
        <p className="text-sm text-text-muted mt-1">Only Super Admin and Admin can manage app configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <PageHeader title="General App Configuration" />
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Centralize SehatVaani platform settings — maintenance, releases, feature flags, security, AI, and integrations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { backupConfiguration(); addToast("Configuration backed up locally", "info"); }} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-elevated">
            Backup
          </button>
          <button type="button" onClick={() => { const r = restoreConfigurationBackup(adminEmail || "Admin"); addToast(r ? "Backup restored (audit logged)" : "No backup found", r ? "success" : "error"); bumpRefresh(); }} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-elevated">
            Restore
          </button>
          <button type="button" onClick={() => { downloadConfigFile(); addToast("Configuration exported", "success"); }} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-elevated">
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search settings modules…"
          aria-label="Search configuration modules"
          className={cn(inputClass, "sm:max-w-sm")}
        />
        {dirty && <span className="text-xs text-amber-600 font-medium self-center">Unsaved changes in current tab</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <nav className="lg:col-span-1 space-y-1" aria-label="Configuration modules">
          {filteredTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors",
                tab === t.id ? "bg-primary-fixed text-on-primary-fixed" : "text-text-muted hover:bg-surface-elevated"
              )}
            >
              <MaterialIcon name={t.icon} size={18} />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
          {!filteredTabs.length && <p className="text-sm text-text-muted p-3">No matching modules</p>}
        </nav>

        <div className="lg:col-span-3" key={refreshKey}>
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-lg shimmer" />)}
            </div>
          ) : (
            <>
              {tab === "general" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">General Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="App Name"><input className={inputClass} value={general.app_name} onChange={(e) => mark(setGeneral, { app_name: e.target.value })} /></Field>
                    <Field label="Environment"><select className={inputClass} value={general.environment} onChange={(e) => mark(setGeneral, { environment: e.target.value })}><option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option></select></Field>
                    <Field label="Support Email"><input className={inputClass} value={general.support_email} onChange={(e) => mark(setGeneral, { support_email: e.target.value })} /></Field>
                    <Field label="Support Phone"><input className={inputClass} value={general.support_phone} onChange={(e) => mark(setGeneral, { support_phone: e.target.value })} /></Field>
                    <Field label="Default Locale"><input className={inputClass} value={general.default_locale} onChange={(e) => mark(setGeneral, { default_locale: e.target.value })} /></Field>
                    <Field label="Timezone"><input className={inputClass} value={general.timezone} onChange={(e) => mark(setGeneral, { timezone: e.target.value })} /></Field>
                    <Field label="Currency"><input className={inputClass} value={general.currency} onChange={(e) => mark(setGeneral, { currency: e.target.value })} /></Field>
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onReset={() => { setGeneral({ ...generalSeed }); setDirty(false); }} />
                </section>
              )}

              {tab === "maintenance" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Maintenance Mode</h2>
                  <Toggle checked={maintenance.enabled} onChange={(v) => { mark(setMaintenance, { enabled: v }); if (v) setConfirmAction("maintenance_on"); }} label="Enable Maintenance Mode" />
                  <Toggle checked={maintenance.emergency} onChange={(v) => mark(setMaintenance, { emergency: v })} label="Emergency Maintenance Mode" />
                  <Toggle checked={maintenance.allow_admin_access} onChange={(v) => mark(setMaintenance, { allow_admin_access: v })} label="Allow admin access during maintenance" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Maintenance Title"><input className={inputClass} value={maintenance.title} onChange={(e) => mark(setMaintenance, { title: e.target.value })} /></Field>
                    <Field label="Estimated Downtime"><input className={inputClass} value={maintenance.estimated_downtime} onChange={(e) => mark(setMaintenance, { estimated_downtime: e.target.value })} /></Field>
                    <div className="sm:col-span-2"><Field label="Description"><textarea className={inputClass} rows={3} value={maintenance.description} onChange={(e) => mark(setMaintenance, { description: e.target.value })} /></Field></div>
                    <Field label="Banner Image URL"><input className={inputClass} value={maintenance.banner_image} onChange={(e) => mark(setMaintenance, { banner_image: e.target.value })} /></Field>
                    <Field label="Bypass Roles (comma-separated)"><input className={inputClass} value={maintenance.bypass_roles.join(", ")} onChange={(e) => mark(setMaintenance, { bypass_roles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
                  </div>
                  <Toggle checked={maintenance.scheduled} onChange={(v) => mark(setMaintenance, { scheduled: v })} label="Scheduled maintenance window" />
                  {maintenance.scheduled && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Field label="Start Date"><input type="date" className={inputClass} value={maintenance.start_at} onChange={(e) => mark(setMaintenance, { start_at: e.target.value })} /></Field>
                      <Field label="Start Time"><input type="time" className={inputClass} value={maintenance.start_time} onChange={(e) => mark(setMaintenance, { start_time: e.target.value })} /></Field>
                      <Field label="End Date"><input type="date" className={inputClass} value={maintenance.end_at} onChange={(e) => mark(setMaintenance, { end_at: e.target.value })} /></Field>
                      <Field label="End Time"><input type="time" className={inputClass} value={maintenance.end_time} onChange={(e) => mark(setMaintenance, { end_time: e.target.value })} /></Field>
                    </div>
                  )}
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Maintenance History</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {maintenanceLogs.map((l) => (
                        <div key={l.id} className="rounded-lg border border-outline-variant/40 p-3 text-sm flex justify-between gap-2">
                          <div>
                            <p className="font-medium">{l.title} {l.emergency && <Badge variant="danger">Emergency</Badge>}</p>
                            <p className="text-xs text-text-muted">{formatDateTime(l.started_at)} → {l.ended_at ? formatDateTime(l.ended_at) : "Ongoing"}</p>
                          </div>
                          <p className="text-xs text-text-muted shrink-0">{l.triggered_by}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {tab === "version" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">App Version Management</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(Object.keys(currentVersions) as Platform[]).map((p) => (
                      <div key={p} className="rounded-lg border border-outline-variant/40 p-3">
                        <p className="text-xs font-semibold uppercase text-text-muted">{p}</p>
                        <p className="text-lg font-bold text-primary">{currentVersions[p].stable}</p>
                        <p className="text-[10px] text-text-muted">Previous: {currentVersions[p].previous} · Min: {currentVersions[p].min_supported}</p>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold">Publish New Version</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="New Version"><input className={inputClass} value={versionForm.version} onChange={(e) => setVersionForm((f) => ({ ...f, version: e.target.value }))} placeholder="2.5.0" /></Field>
                    <Field label="Build Number"><input className={inputClass} value={versionForm.build_number} onChange={(e) => setVersionForm((f) => ({ ...f, build_number: e.target.value }))} /></Field>
                    <Field label="Release Type">
                      <select className={inputClass} value={versionForm.release_type} onChange={(e) => setVersionForm((f) => ({ ...f, release_type: e.target.value as ReleaseType }))}>
                        <option value="major">Major</option><option value="minor">Minor</option><option value="patch">Patch</option><option value="hotfix">Hotfix</option>
                      </select>
                    </Field>
                    <Field label="Platform">
                      <select className={inputClass} value={versionForm.platform} onChange={(e) => setVersionForm((f) => ({ ...f, platform: e.target.value as Platform }))}>
                        <option value="android">Android</option><option value="ios">iOS</option><option value="web">Web</option><option value="admin">Admin Dashboard</option><option value="api">API</option>
                      </select>
                    </Field>
                    <Field label="Minimum Supported Version"><input className={inputClass} value={versionForm.minimum_supported_version} onChange={(e) => setVersionForm((f) => ({ ...f, minimum_supported_version: e.target.value }))} /></Field>
                    <Field label="Download URL"><input className={inputClass} value={versionForm.download_url} onChange={(e) => setVersionForm((f) => ({ ...f, download_url: e.target.value }))} /></Field>
                    <div className="sm:col-span-2"><Field label="Release Notes"><textarea className={inputClass} rows={2} value={versionForm.release_notes} onChange={(e) => setVersionForm((f) => ({ ...f, release_notes: e.target.value }))} /></Field></div>
                    <div className="sm:col-span-2"><Field label="Changelog"><textarea className={inputClass} rows={2} value={versionForm.changelog} onChange={(e) => setVersionForm((f) => ({ ...f, changelog: e.target.value }))} /></Field></div>
                    <div className="sm:col-span-2"><Field label="Breaking Changes"><textarea className={inputClass} rows={2} value={versionForm.breaking_changes} onChange={(e) => setVersionForm((f) => ({ ...f, breaking_changes: e.target.value }))} /></Field></div>
                    <Toggle checked={versionForm.force_update} onChange={(v) => setVersionForm((f) => ({ ...f, force_update: v }))} label="Force Update" />
                  </div>
                  <button type="button" onClick={handlePublishVersion} className="rounded-lg bg-primary text-white px-4 py-2.5 text-sm font-semibold">Publish Version</button>

                  <h3 className="text-sm font-semibold pt-2">Version History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-surface-low border-y border-outline-variant/50">
                          {["Version", "Platform", "Type", "Date", "Status", "Actions"].map((h) => (
                            <th key={h} className="p-3 text-[11px] uppercase text-text-muted font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {appVersions.map((v) => (
                          <tr key={v.id} className="border-b border-outline-variant/30">
                            <td className="p-3 font-mono font-semibold">{v.version} <span className="text-[10px] text-text-muted">#{v.build_number}</span></td>
                            <td className="p-3 capitalize">{v.platform}</td>
                            <td className="p-3"><Badge variant="info">{v.release_type}</Badge>{v.force_update && <Badge variant="danger">Force</Badge>}</td>
                            <td className="p-3 text-text-muted whitespace-nowrap">{formatDateTime(v.published_at)}</td>
                            <td className="p-3"><Badge variant={v.status === "stable" ? "success" : v.status === "rolled_back" ? "warning" : "default"}>{v.status}</Badge></td>
                            <td className="p-3 space-x-2 whitespace-nowrap">
                              <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => addToast(v.changelog || "No changelog", "info")}>Changelog</button>
                              {v.status === "stable" && (
                                <button type="button" className="text-xs font-semibold text-amber-700 hover:underline" onClick={() => { setRollbackTarget(v.id); setConfirmAction("rollback"); }}>Rollback</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === "features" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Feature Flags</h2>
                  <p className="text-sm text-text-muted">Enable or disable SehatVaani features without redeployment.</p>
                  <div className="space-y-2">
                    {featureFlags.map((f) => (
                      <div key={f.key} className="rounded-lg border border-outline-variant/40 p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{f.label}</p>
                          <p className="text-xs text-text-muted">{f.description} · {f.category}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={f.enabled}
                          onClick={() => {
                            toggleFeatureFlag(f.key, !f.enabled, adminEmail || "Admin");
                            addToast(`${f.label} ${!f.enabled ? "enabled" : "disabled"}`, "success");
                            bumpRefresh();
                          }}
                          className={cn("w-11 h-6 rounded-full transition-colors shrink-0", f.enabled ? "bg-primary" : "bg-surface-elevated")}
                        >
                          <span className={cn("block w-5 h-5 rounded-full bg-white shadow transform transition-transform", f.enabled ? "translate-x-5" : "translate-x-0.5")} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tab === "auth" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Authentication Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Toggle checked={auth.email_login} onChange={(v) => mark(setAuth, { email_login: v })} label="Email Login" />
                    <Toggle checked={auth.mobile_otp} onChange={(v) => mark(setAuth, { mobile_otp: v })} label="Mobile OTP Login" />
                    <Toggle checked={auth.google_login} onChange={(v) => mark(setAuth, { google_login: v })} label="Google Login" />
                    <Toggle checked={auth.apple_login} onChange={(v) => mark(setAuth, { apple_login: v })} label="Apple Login" />
                    <Toggle checked={auth.two_factor} onChange={(v) => mark(setAuth, { two_factor: v })} label="Two-Factor Authentication" />
                    <Toggle checked={auth.password_require_special} onChange={(v) => mark(setAuth, { password_require_special: v })} label="Require Special Characters" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Session Timeout (minutes)"><input type="number" className={inputClass} value={auth.session_timeout_minutes} onChange={(e) => mark(setAuth, { session_timeout_minutes: Number(e.target.value) })} /></Field>
                    <Field label="Password Min Length"><input type="number" className={inputClass} value={auth.password_min_length} onChange={(e) => mark(setAuth, { password_min_length: Number(e.target.value) })} /></Field>
                    <Field label="Device Limit"><input type="number" className={inputClass} value={auth.device_limit} onChange={(e) => mark(setAuth, { device_limit: Number(e.target.value) })} /></Field>
                    <Field label="Lock After Failures"><input type="number" className={inputClass} value={auth.lock_after_failures} onChange={(e) => mark(setAuth, { lock_after_failures: Number(e.target.value) })} /></Field>
                    <Field label="Lock Duration (minutes)"><input type="number" className={inputClass} value={auth.lock_duration_minutes} onChange={(e) => mark(setAuth, { lock_duration_minutes: Number(e.target.value) })} /></Field>
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "notifications" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Notification Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Toggle checked={notif.push} onChange={(v) => mark(setNotif, { push: v })} label="Push Notifications" />
                    <Toggle checked={notif.email} onChange={(v) => mark(setNotif, { email: v })} label="Email Notifications" />
                    <Toggle checked={notif.sms} onChange={(v) => mark(setNotif, { sms: v })} label="SMS Notifications" />
                    <Toggle checked={notif.whatsapp} onChange={(v) => mark(setNotif, { whatsapp: v })} label="WhatsApp Notifications" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Retry Count"><input type="number" className={inputClass} value={notif.retry_count} onChange={(e) => mark(setNotif, { retry_count: Number(e.target.value) })} /></Field>
                    <Field label="Expiry (hours)"><input type="number" className={inputClass} value={notif.expiry_hours} onChange={(e) => mark(setNotif, { expiry_hours: Number(e.target.value) })} /></Field>
                    <Field label="Quiet Hours Start"><input type="time" className={inputClass} value={notif.quiet_hours_start} onChange={(e) => mark(setNotif, { quiet_hours_start: e.target.value })} /></Field>
                    <Field label="Quiet Hours End"><input type="time" className={inputClass} value={notif.quiet_hours_end} onChange={(e) => mark(setNotif, { quiet_hours_end: e.target.value })} /></Field>
                    <Field label="Default Template"><input className={inputClass} value={notif.default_template} onChange={(e) => mark(setNotif, { default_template: e.target.value })} /></Field>
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "ai" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">AI Configuration</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="AI Provider"><select className={inputClass} value={ai.provider} onChange={(e) => mark(setAi, { provider: e.target.value })}><option>OpenAI</option><option>Gemini</option><option>OpenRouter</option></select></Field>
                    <Field label="AI Model"><input className={inputClass} value={ai.model} onChange={(e) => mark(setAi, { model: e.target.value })} /></Field>
                    <Field label="API Key (encrypted)"><input type="password" className={inputClass} value={ai.api_key} onChange={(e) => mark(setAi, { api_key: e.target.value })} /></Field>
                    <Field label="Rate Limit (RPM)"><input type="number" className={inputClass} value={ai.rate_limit_rpm} onChange={(e) => mark(setAi, { rate_limit_rpm: Number(e.target.value) })} /></Field>
                    <Field label="Token Limit"><input type="number" className={inputClass} value={ai.token_limit} onChange={(e) => mark(setAi, { token_limit: Number(e.target.value) })} /></Field>
                    <Field label="Temperature"><input type="number" step="0.1" min="0" max="2" className={inputClass} value={ai.temperature} onChange={(e) => mark(setAi, { temperature: Number(e.target.value) })} /></Field>
                    <div className="sm:col-span-2"><Field label="Prompt Template"><textarea className={inputClass} rows={3} value={ai.prompt_template} onChange={(e) => mark(setAi, { prompt_template: e.target.value })} /></Field></div>
                    <Toggle checked={ai.logging_enabled} onChange={(v) => mark(setAi, { logging_enabled: v })} label="AI Logging" />
                    <Toggle checked={ai.analytics_enabled} onChange={(v) => mark(setAi, { analytics_enabled: v })} label="AI Analytics" />
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "storage" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Storage Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Max Upload (MB)"><input type="number" className={inputClass} value={storage.max_upload_mb} onChange={(e) => mark(setStorage, { max_upload_mb: Number(e.target.value) })} /></Field>
                    <Field label="Allowed File Types"><input className={inputClass} value={storage.allowed_types} onChange={(e) => mark(setStorage, { allowed_types: e.target.value })} /></Field>
                    <Field label="Storage Provider"><select className={inputClass} value={storage.provider} onChange={(e) => mark(setStorage, { provider: e.target.value })}><option>AWS S3</option><option>Cloudinary</option><option>Local</option></select></Field>
                    <Field label="Backup Location"><input className={inputClass} value={storage.backup_location} onChange={(e) => mark(setStorage, { backup_location: e.target.value })} /></Field>
                    <Field label="CDN URL"><input className={inputClass} value={storage.cdn_url} onChange={(e) => mark(setStorage, { cdn_url: e.target.value })} /></Field>
                    <Field label="Cache TTL (seconds)"><input type="number" className={inputClass} value={storage.cache_ttl_seconds} onChange={(e) => mark(setStorage, { cache_ttl_seconds: Number(e.target.value) })} /></Field>
                    <Toggle checked={storage.image_compression} onChange={(v) => mark(setStorage, { image_compression: v })} label="Image Compression" />
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "security" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Security Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="JWT Expiration (hours)"><input type="number" className={inputClass} value={security.jwt_expiry_hours} onChange={(e) => mark(setSecurity, { jwt_expiry_hours: Number(e.target.value) })} /></Field>
                    <Field label="API Rate Limit"><input type="number" className={inputClass} value={security.api_rate_limit} onChange={(e) => mark(setSecurity, { api_rate_limit: Number(e.target.value) })} /></Field>
                    <Field label="Allowed Origins"><input className={inputClass} value={security.allowed_origins} onChange={(e) => mark(setSecurity, { allowed_origins: e.target.value })} /></Field>
                    <Field label="IP Whitelist"><input className={inputClass} value={security.ip_whitelist} onChange={(e) => mark(setSecurity, { ip_whitelist: e.target.value })} placeholder="Optional comma-separated IPs" /></Field>
                    <Field label="API Key Rotation (days)"><input type="number" className={inputClass} value={security.api_key_rotation_days} onChange={(e) => mark(setSecurity, { api_key_rotation_days: Number(e.target.value) })} /></Field>
                    <Toggle checked={security.cors_enabled} onChange={(v) => mark(setSecurity, { cors_enabled: v })} label="CORS Enabled" />
                    <Toggle checked={security.security_headers} onChange={(v) => mark(setSecurity, { security_headers: v })} label="Security Headers" />
                    <Toggle checked={security.encryption_at_rest} onChange={(v) => mark(setSecurity, { encryption_at_rest: v })} label="Encryption at Rest" />
                    <Toggle checked={security.audit_logs_enabled} onChange={(v) => mark(setSecurity, { audit_logs_enabled: v })} label="Audit Logs" />
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "integrations" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Third-Party Integrations</h2>
                  <div className="space-y-3">
                    {integrations.map((i) => (
                      <div key={i.key} className="rounded-lg border border-outline-variant/40 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{i.label}</p>
                            <p className="text-[10px] text-text-muted">Last sync: {i.last_sync ? formatDateTime(i.last_sync) : "—"} · Last test: {i.last_test ? formatDateTime(i.last_test) : "—"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={i.health === "healthy" ? "success" : i.health === "degraded" ? "warning" : i.health === "down" ? "danger" : "default"}>{i.health}</Badge>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={i.enabled}
                              onClick={() => { i.enabled = !i.enabled; addToast(`${i.label} ${i.enabled ? "enabled" : "disabled"}`); bumpRefresh(); }}
                              className={cn("w-11 h-6 rounded-full", i.enabled ? "bg-primary" : "bg-surface-elevated")}
                            >
                              <span className={cn("block w-5 h-5 rounded-full bg-white shadow transform", i.enabled ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(i.credentials).map(([k, v]) => (
                            <Field key={k} label={k}>
                              <input className={inputClass} type="password" defaultValue={v} onBlur={(e) => { i.credentials[k] = e.target.value; }} />
                            </Field>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            testIntegration(i.key, adminEmail || "Admin");
                            addToast(`${i.label} connection test completed`, "success");
                            bumpRefresh();
                          }}
                          className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold hover:bg-surface-elevated"
                        >
                          Test Connection
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tab === "api" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">API Settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Base URL"><input className={inputClass} value={api.base_url} onChange={(e) => mark(setApi, { base_url: e.target.value })} /></Field>
                    <Field label="Public API Key"><input className={inputClass} value={api.public_key} onChange={(e) => mark(setApi, { public_key: e.target.value })} /></Field>
                    <Field label="Rate Limit Burst"><input type="number" className={inputClass} value={api.rate_limit_burst} onChange={(e) => mark(setApi, { rate_limit_burst: Number(e.target.value) })} /></Field>
                    <Field label="Webhook URL"><input className={inputClass} value={api.webhook_url} onChange={(e) => mark(setApi, { webhook_url: e.target.value })} /></Field>
                    <Toggle checked={api.sandbox_mode} onChange={(v) => mark(setApi, { sandbox_mode: v })} label="Sandbox Mode" />
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "system" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">System Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      ["Environment", systemInfo.environment],
                      ["App Version", systemInfo.app_version],
                      ["Database", systemInfo.database_version],
                      ["Server Status", systemInfo.server_status],
                      ["Storage", `${systemInfo.storage_used_gb} / ${systemInfo.storage_total_gb} GB`],
                      ["Active Users", String(systemInfo.active_users)],
                      ["Queue", systemInfo.queue_status],
                      ["Cache", systemInfo.cache_status],
                      ["Background Jobs", String(systemInfo.background_jobs)],
                      ["Last Deployment", formatDateTime(systemInfo.last_deployment)],
                      ["Last Backup", formatDateTime(systemInfo.last_backup)],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-outline-variant/40 p-3">
                        <p className="text-[10px] uppercase font-semibold text-text-muted">{k}</p>
                        <p className="text-sm font-semibold mt-1 break-words">{v}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tab === "history" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Configuration History</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-surface-low border-y border-outline-variant/50">
                          {["Changed By", "Time", "Module", "Key", "Previous", "New", "Reason", ""].map((h) => (
                            <th key={h || "a"} className="p-3 text-[11px] uppercase text-text-muted font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {configAuditLogs.map((l) => (
                          <tr key={l.id} className="border-b border-outline-variant/30">
                            <td className="p-3 whitespace-nowrap">{l.changed_by}</td>
                            <td className="p-3 text-text-muted whitespace-nowrap">{formatDateTime(l.timestamp)}</td>
                            <td className="p-3">{l.module}</td>
                            <td className="p-3 font-mono text-xs">{l.config_key}</td>
                            <td className="p-3 text-xs max-w-[100px] truncate">{l.previous_value}</td>
                            <td className="p-3 text-xs max-w-[100px] truncate">{l.new_value}</td>
                            <td className="p-3 text-xs text-text-muted max-w-[140px] truncate">{l.reason}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                className="text-xs font-semibold text-primary hover:underline"
                                onClick={() => {
                                  rollbackAudit(l.id, adminEmail || "Admin");
                                  addToast("Change rolled back", "info");
                                  bumpRefresh();
                                }}
                              >
                                Rollback
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={!!confirmLeave} onClose={() => setConfirmLeave(null)} title="Unsaved Changes">
        <p className="text-sm text-text-muted mb-4">You have unsaved changes. Switch tabs anyway?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirmLeave(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Stay</button>
          <button type="button" onClick={() => { if (confirmLeave) { setDirty(false); setTab(confirmLeave); setConfirmLeave(null); } }} className="flex-1 rounded-lg bg-primary text-white py-2.5 text-sm font-semibold">Switch</button>
        </div>
      </Modal>

      <Modal open={confirmAction === "rollback"} onClose={() => setConfirmAction(null)} title="Confirm Rollback">
        <p className="text-sm text-text-muted mb-4">Rollback this version release? Current stable will revert to previous.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={() => { if (rollbackTarget) { rollbackVersion(rollbackTarget, adminEmail || "Admin"); addToast("Version rolled back", "info"); bumpRefresh(); } setConfirmAction(null); setRollbackTarget(null); }} className="flex-1 rounded-lg bg-amber-600 text-white py-2.5 text-sm font-semibold">Rollback</button>
        </div>
      </Modal>
    </div>
  );
}
