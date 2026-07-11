"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const { adminEmail, role, addToast } = useApp();

  return (
    <AuthGuard>
      <DashboardLayout title="Settings" subtitle="Admin console preferences">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="account_circle" size={20} className="text-primary" /> Account</h2>
            <div className="field-row"><span className="text-text-muted text-sm">Email</span><span className="font-mono text-sm">{adminEmail}</span></div>
            <div className="field-row"><span className="text-text-muted text-sm">Role</span><span className="font-semibold text-sm">{role}</span></div>
            <button onClick={() => addToast("Password change is available when connected to backend", "info")} className="text-primary text-sm font-semibold hover:underline">Change Password</button>
          </div>

          <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="info" size={20} className="text-primary" /> About</h2>
            <p className="text-sm text-text-muted">SehatVaani Admin Console — UI prototype mirroring the original PHP admin panel. Connect to the PHP backend API to enable live data.</p>
            <p className="text-xs font-mono text-text-muted">API Key: sehat_live_2026_secure_key · Version 2.0 (Next.js)</p>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
