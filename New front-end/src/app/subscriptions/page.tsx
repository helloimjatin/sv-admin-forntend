"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlansPanel } from "@/components/subscriptions/PlansPanel";

export default function SubscriptionsPage() {
  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout title="Subscriptions" subtitle="Plans, pricing, and entitlements">
        <PlansPanel />
      </DashboardLayout>
    </AuthGuard>
  );
}
