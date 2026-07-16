"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const { adminEmail, role, addToast } = useApp();

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-xl font-bold">Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="tune" size={20} className="text-primary" /> General</h2>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">System Name</span><span className="font-semibold text-sm">SehatVaani Console</span></div>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Timezone</span><span className="font-semibold text-sm">Asia/Kolkata</span></div>
            </div>

            <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="build" size={20} className="text-primary" /> Maintenance</h2>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Maintenance Mode</span><span className="font-semibold text-sm text-red-600">Disabled</span></div>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Backup Status</span><span className="font-semibold text-sm text-green-600">Healthy</span></div>
            </div>

            <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="api" size={20} className="text-primary" /> API Configuration</h2>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Production URL</span><span className="font-mono text-sm">https://api.sehatvaani.com</span></div>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">API Key Status</span><span className="font-semibold text-sm text-green-600">Active</span></div>
            </div>

            <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4">
              <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="storage" size={20} className="text-primary" /> Storage</h2>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Provider</span><span className="font-semibold text-sm">AWS S3</span></div>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Used Space</span><span className="font-semibold text-sm">45.2 GB</span></div>
            </div>

            <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 space-y-4 md:col-span-2">
              <h2 className="font-semibold flex items-center gap-2"><MaterialIcon name="security" size={20} className="text-primary" /> Security</h2>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Email</span><span className="font-mono text-sm">{adminEmail}</span></div>
              <div className="field-row flex justify-between"><span className="text-text-muted text-sm">Role</span><span className="font-semibold text-sm">{role}</span></div>
              <button onClick={() => addToast("Password change action triggered", "info")} className="text-primary text-sm font-semibold hover:underline">Change Password</button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
