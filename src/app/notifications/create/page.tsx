"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateNotificationForm } from "@/components/notifications/CreateNotificationForm";

function CreatePageContent() {
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const editId = editParam ? Number(editParam) : undefined;

  return <CreateNotificationForm editId={editId && !isNaN(editId) ? editId : undefined} />;
}

export default function CreateNotificationPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Create Notification" subtitle="Compose and schedule push notifications">
        <Suspense fallback={<div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-lg shimmer" />)}</div>}>
          <CreatePageContent />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
