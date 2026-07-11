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
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CmsPage() {
  const [tab, setTab] = useState<TabId>("pages");

  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <PageHeader title="Static Pages" />
              <p className="text-sm text-text-muted mt-1 max-w-2xl">
                Manage healthcare content pages, legal policies, and SEO metadata for SehatVaani.
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

          {tab === "pages" && <StaticPagesTab />}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
