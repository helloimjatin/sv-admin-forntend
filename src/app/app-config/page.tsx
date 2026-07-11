"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AppConfigPanel } from "@/components/app-config/AppConfigPanel";

export default function AppConfigPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout>
        <AppConfigPanel />
      </DashboardLayout>
    </AuthGuard>
  );
}
