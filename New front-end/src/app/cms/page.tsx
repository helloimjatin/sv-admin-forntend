"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/Primitives";
import { StaticPagesTab } from "@/components/cms/StaticPagesTab";
import { AppConfigurationTab } from "@/components/cms/AppConfigurationTab";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "pages", label: "Static Pages", icon: "article" },
  { id: "config", label: "App Configuration", icon: "settings_applications" },
  { id: "future", label: "More Modules", icon: "extension", disabled: true },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CmsPage() {
  const [tab, setTab] = useState<TabId>("pages");

  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="CMS" subtitle="Static pages and app configuration">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <PageHeader title="Static Pages & CMS" />
              <p className="text-sm text-text-muted mt-1 max-w-2xl">
                Manage healthcare content pages, legal policies, SEO metadata, and localized app configuration for SehatVaani.
              </p>
            </div>
            {tab === "pages" && (
              <Link
                href="/cms/pages/create"
                className="bg-primary text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors shrink-0 flex items-center gap-2 self-start"
              >
                <MaterialIcon name="add" size={18} />
                Create New Page
              </Link>
            )}
          </div>

          <nav className="flex flex-wrap gap-2 border-b border-outline-variant/50 pb-1" aria-label="CMS sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={"disabled" in t && t.disabled}
                onClick={() => !("disabled" in t && t.disabled) && setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors",
                  tab === t.id
                    ? "border-primary text-primary bg-primary-fixed/20"
                    : "border-transparent text-text-muted hover:text-text hover:bg-surface-elevated/50",
                  "disabled" in t && t.disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <MaterialIcon name={t.icon} size={18} />
                {t.label}
                {"disabled" in t && t.disabled && <span className="text-[10px] font-normal">(Soon)</span>}
              </button>
            ))}
          </nav>

          {tab === "pages" && <StaticPagesTab />}
          {tab === "config" && <AppConfigurationTab />}
          {tab === "future" && (
            <div className="rounded-lg border border-dashed border-outline-variant p-12 text-center text-text-muted">
              <MaterialIcon name="construction" size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-semibold">Additional CMS modules coming soon</p>
              <p className="text-sm mt-1">Blog posts, landing page builder, and email templates.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
