"use client";

import { useState } from "react";
import {
  APP_CONFIG_KEYS,
  AppConfigKey,
  LANGUAGE_OPTIONS,
  getAppConfig,
} from "@/data/cmsData";
import { saveAppConfigContent } from "@/lib/cmsService";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Primitives";
import { cn, formatDateTime } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors font-mono text-xs";

export function AppConfigurationTab() {
  const { addToast, adminEmail, bumpRefresh } = useApp();
  const [language, setLanguage] = useState("en");
  const [activeKey, setActiveKey] = useState<AppConfigKey>("terms_conditions");
  const [content, setContent] = useState(() => getAppConfig("terms_conditions", "en")?.content ?? "");
  const [saving, setSaving] = useState(false);

  const selectKey = (key: AppConfigKey) => {
    setActiveKey(key);
    setContent(getAppConfig(key, language)?.content ?? "");
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    setContent(getAppConfig(activeKey, lang)?.content ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAppConfigContent(activeKey, content, language, adminEmail || "Admin");
      addToast("Configuration saved", "success");
      bumpRefresh();
    } catch {
      addToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const entry = getAppConfig(activeKey, language);
  const label = APP_CONFIG_KEYS.find((k) => k.key === activeKey)?.label;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5">Language</label>
          <select value={language} onChange={(e) => changeLanguage(e.target.value)} className={inputClass}>
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}{l.fallback ? " (fallback)" : ""}</option>
            ))}
          </select>
        </div>
        <nav className="space-y-1" aria-label="App configuration sections">
          {APP_CONFIG_KEYS.map((item) => {
            const e = getAppConfig(item.key, language);
            const active = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => selectKey(item.key)}
                className={cn(
                  "w-full text-left rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between gap-2",
                  active ? "bg-primary-fixed text-on-primary-fixed" : "hover:bg-surface-elevated text-text-muted"
                )}
              >
                <span className="truncate">{item.label}</span>
                {e && (
                  <Badge variant={e.status === "published" ? "success" : "default"}>
                    {e.status === "published" ? "Active" : "Inactive"}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
        <p className="text-[10px] text-text-muted flex items-center gap-1">
          <MaterialIcon name="info" size={14} />
          Region-specific pages use language fallback to English when unavailable.
        </p>
      </div>

      <div className="lg:col-span-2 rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/40 pb-4">
          <div>
            <h3 className="text-lg font-semibold">{label}</h3>
            {entry && (
              <p className="text-xs text-text-muted mt-0.5">
                Last updated by {entry.updated_by} · {formatDateTime(entry.updated_at)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white text-xs font-semibold uppercase px-5 py-2.5 rounded-lg hover:bg-primary-container disabled:opacity-50 shrink-0"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className={inputClass}
          aria-label={`${label} content`}
          placeholder="HTML or rich text content…"
        />
      </div>
    </div>
  );
}
