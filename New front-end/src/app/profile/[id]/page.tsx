"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserDetailsHub } from "@/components/profile/UserDetailsHub";
import { use } from "react";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);

  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="User Details" subtitle="Individual patient profile hub">
        <UserDetailsHub userId={userId} />
      </DashboardLayout>
    </AuthGuard>
  );
}
