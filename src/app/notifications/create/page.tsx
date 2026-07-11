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
      <DashboardLayout fillHeight title="Create Notification" subtitle="Compose and schedule push notifications">
        <div className="flex min-h-0 flex-1 flex-col">
          <Suspense
            fallback={
              <div className="flex-1 p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-lg shimmer" />
                ))}
              </div>
            }
          >
            <CreatePageContent />
          </Suspense>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
