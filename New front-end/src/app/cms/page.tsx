"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/Primitives";
import { StaticPagesTab } from "@/components/cms/StaticPagesTab";
import { BlogPanel } from "@/components/cms/BlogPanel";
import { VideosPanel } from "@/components/cms/VideosPanel";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "pages", label: "Static Pages", icon: "article" },
  { id: "blog", label: "Blog", icon: "menu_book" },
  { id: "videos", label: "Videos", icon: "videocam" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_META: Record<TabId, { title: string; description: string; createHref?: string; createLabel?: string }> = {
  pages: {
    title: "Content Management",
    description: "Manage healthcare content pages, legal policies, and SEO metadata for SehatVaani.",
    createHref: "/cms/pages/create",
    createLabel: "Create New Page",
  },
  blog: {
    title: "Blog Management",
    description: "Manage health education articles shown on the website blog and homepage insights section.",
    createHref: "/cms/blog/create",
    createLabel: "Create Article",
  },
  videos: {
    title: "Video Library",
    description: "Manage product walkthroughs, tutorials, and awareness videos for the website video library.",
    createHref: "/cms/videos/create",
    createLabel: "Add Video",
  },
};

function CmsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: TabId =
    tabParam === "blog" || tabParam === "videos" || tabParam === "pages" ? tabParam : "pages";
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    if (tabParam === "blog" || tabParam === "videos" || tabParam === "pages") {
      setTab(tabParam);
    }
  }, [tabParam]);

  const meta = TAB_META[tab];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <PageHeader title={meta.title} />
          <p className="text-sm text-text-muted mt-1 max-w-2xl">{meta.description}</p>
        </div>
        {meta.createHref && (
          <Link
            href={meta.createHref}
            className="bg-primary text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors shrink-0 flex items-center gap-2 self-start"
          >
            <MaterialIcon name="add" size={18} />
            {meta.createLabel}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-outline-variant/50 pb-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "pages" ? "/cms" : `/cms?tab=${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2",
              tab === t.id
                ? "border-primary text-primary bg-primary-fixed/30"
                : "border-transparent text-text-muted hover:text-text hover:bg-surface-elevated"
            )}
          >
            <MaterialIcon name={t.icon} size={18} />
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "pages" && <StaticPagesTab />}
      {tab === "blog" && <BlogPanel />}
      {tab === "videos" && <VideosPanel />}
    </div>
  );
}

export default function CmsPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout>
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg shimmer" />
              ))}
            </div>
          }
        >
          <CmsContent />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
