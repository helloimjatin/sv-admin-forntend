"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserForm } from "@/components/users/UserForm";

function Editor() {
  const params = useSearchParams();
  const editParam = params.get("edit");
  const editId = editParam ? Number(editParam) : undefined;
  return <UserForm editId={editId && !Number.isNaN(editId) ? editId : undefined} />;
}

export default function NewUserPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="User Editor" subtitle="Create or update a patient account">
        <Suspense fallback={<div className="h-40 rounded-lg shimmer" />}>
          <Editor />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
