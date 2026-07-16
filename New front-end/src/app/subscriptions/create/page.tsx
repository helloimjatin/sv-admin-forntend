"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlanForm } from "@/components/subscriptions/PlanForm";

function PlanEditor() {
  const params = useSearchParams();
  const editParam = params.get("edit");
  const editId = editParam ? Number(editParam) : undefined;
  return <PlanForm editId={editId && !Number.isNaN(editId) ? editId : undefined} />;
}

export default function CreatePlanPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Plan Details" subtitle="View or update a subscription plan">
        <Suspense fallback={<div className="h-40 rounded-lg shimmer" />}>
          <PlanEditor />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
