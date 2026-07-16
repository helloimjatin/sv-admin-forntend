"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserForm } from "@/components/users/UserForm";

function Editor() {
  const router = useRouter();
  const params = useSearchParams();
  const editParam = params.get("edit");
  const editId = editParam ? Number(editParam) : undefined;
  const validEditId = editId && !Number.isNaN(editId) ? editId : undefined;

  useEffect(() => {
    if (!validEditId) router.replace("/users");
  }, [validEditId, router]);

  if (!validEditId) {
    return <div className="h-40 rounded-lg shimmer" />;
  }

  return <UserForm editId={validEditId} />;
}

export default function EditUserPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Edit User" subtitle="Update a patient account">
        <Suspense fallback={<div className="h-40 rounded-lg shimmer" />}>
          <Editor />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  );
}
