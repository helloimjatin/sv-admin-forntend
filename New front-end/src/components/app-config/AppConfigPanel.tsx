"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Modal, PageHeader } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
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
  GeneralSettings,
  MaintenanceSettings,
  AuthSettings,
  NotificationSettings,
  AISettings,
  StorageSettings,
  SecuritySettings,
  ApiSettings,
  toggleFeatureFlag,
  testIntegration,
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

/** Tabs shown in the slimmed-down admin UI (full data model still persisted on save). */
const VISIBLE_TAB_IDS: AppConfigTabId[] = ["maintenance", "features", "integrations", "general"];

/** Core product feature toggles — obscure/niche flags stay in data but are hidden from UI. */
const CORE_FEATURE_FLAG_KEYS = new Set([
  "ai_chat",
  "ai_doctor",
  "video_consult",
  "appointments",
  "premium",
  "push_notifications",
  "emergency_sos",
]);

/** Primary payment, messaging, and push integrations only. */
const CORE_INTEGRATION_KEYS = new Set(["razorpay", "twilio", "sendgrid", "firebase"]);

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
  const [tab, setTab] = useState<AppConfigTabId>("maintenance");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<AppConfigTabId | null>(null);

  // Full editable state — hidden fields retain seed defaults and are included on save
  const [general, setGeneral] = useState<GeneralSettings>({ ...generalSeed });
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({ ...maintenanceSeed });
  const [auth, setAuth] = useState<AuthSettings>({ ...authSeed });
  const [notif, setNotif] = useState<NotificationSettings>({ ...notifSeed });
  const [ai, setAi] = useState<AISettings>({ ...aiSeed });
  const [storage, setStorage] = useState<StorageSettings>({ ...storageSeed });
  const [security, setSecurity] = useState<SecuritySettings>({ ...securitySeed });
  const [api, setApi] = useState<ApiSettings>({ ...apiSeed });

  const coreFeatureFlags = useMemo(
    () => featureFlags.filter((f) => CORE_FEATURE_FLAG_KEYS.has(f.key)),
    [refreshKey]
  );

  const coreIntegrations = useMemo(
    () => integrations.filter((i) => CORE_INTEGRATION_KEYS.has(i.key)),
    [refreshKey]
  );

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
    const visible = APP_CONFIG_TABS.filter((t) => VISIBLE_TAB_IDS.includes(t.id));
    if (!search.trim()) return visible;
    const q = search.toLowerCase();
    return visible.filter((t) => t.label.toLowerCase().includes(q) || t.id.includes(q));
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
          <PageHeader title="App Configuration" />
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Essential platform controls — maintenance mode, core feature flags, and primary integrations.
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
          placeholder="Search settings…"
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
              {tab === "maintenance" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Maintenance Mode</h2>
                  <Toggle checked={maintenance.enabled} onChange={(v) => mark(setMaintenance, { enabled: v })} label="Enable Maintenance Mode" />
                  <Toggle checked={maintenance.emergency} onChange={(v) => mark(setMaintenance, { emergency: v })} label="Emergency Maintenance" />
                  <Toggle checked={maintenance.allow_admin_access} onChange={(v) => mark(setMaintenance, { allow_admin_access: v })} label="Allow admin access during maintenance" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Title"><input className={inputClass} value={maintenance.title} onChange={(e) => mark(setMaintenance, { title: e.target.value })} /></Field>
                    <Field label="Estimated Downtime"><input className={inputClass} value={maintenance.estimated_downtime} onChange={(e) => mark(setMaintenance, { estimated_downtime: e.target.value })} /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Message"><textarea className={inputClass} rows={3} value={maintenance.description} onChange={(e) => mark(setMaintenance, { description: e.target.value })} /></Field>
                    </div>
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
                </section>
              )}

              {tab === "features" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Feature Flags</h2>
                  <p className="text-sm text-text-muted">Core product features. Changes apply immediately.</p>
                  <div className="space-y-2">
                    {coreFeatureFlags.map((f) => (
                      <div key={f.key} className="rounded-lg border border-outline-variant/40 p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{f.label}</p>
                          <p className="text-xs text-text-muted">{f.description}</p>
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

              {tab === "integrations" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">Integrations</h2>
                  <p className="text-sm text-text-muted">Payment, messaging, email, and push notification providers.</p>
                  <div className="space-y-3">
                    {coreIntegrations.map((i) => (
                      <div key={i.key} className="rounded-lg border border-outline-variant/40 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{i.label}</p>
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

              {tab === "general" && (
                <section className={sectionClass}>
                  <h2 className="text-base font-semibold">General</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="App Name"><input className={inputClass} value={general.app_name} onChange={(e) => mark(setGeneral, { app_name: e.target.value })} /></Field>
                    <Field label="Environment"><select className={inputClass} value={general.environment} onChange={(e) => mark(setGeneral, { environment: e.target.value })}><option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option></select></Field>
                    <div className="sm:col-span-2"><Field label="Support Email"><input className={inputClass} value={general.support_email} onChange={(e) => mark(setGeneral, { support_email: e.target.value })} /></Field></div>
                  </div>
                  <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onReset={() => { setGeneral({ ...generalSeed }); setDirty(false); }} />
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
    </div>
  );
}
