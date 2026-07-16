"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VideoForm } from "@/components/cms/VideoForm";

function EditorContent() {
  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");
  const editId = edit ? Number(edit) : undefined;
  return <VideoForm editId={editId && !isNaN(editId) ? editId : undefined} />;
}

export default function CreateVideoPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Video Editor" subtitle="Create or edit video library entries">
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg shimmer" />
              ))}
            </div>
          }
        >
          <EditorContent />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
