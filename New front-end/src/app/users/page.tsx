"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UsersPanel } from "@/components/users/UsersPanel";

export default function UsersPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin", "Support", "Moderator"]}>
      <DashboardLayout>
        <UsersPanel />
      </DashboardLayout>
    </AuthGuard>
  );
}
