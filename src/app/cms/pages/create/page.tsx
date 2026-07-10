"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageEditor } from "@/components/cms/PageEditor";

function EditorContent() {
  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");
  const editId = edit ? Number(edit) : undefined;
  return <PageEditor pageId={editId && !isNaN(editId) ? editId : undefined} />;
}

export default function CreateCmsPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Page Editor" subtitle="Create or edit static content">
        <Suspense fallback={<div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-lg shimmer" />)}</div>}>
          <EditorContent />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
