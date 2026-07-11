"use client";

import { use, useState, useEffect } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getManagedUser } from "@/data/userManagementData";
import { toggleUserBlock, deleteUser } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Calendar, Shield, Activity, FileText, Settings, Heart } from "lucide-react";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();
  const { addToast, bumpRefresh } = useApp();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getManagedUser(userId);
    if (u) {
      setUser(u);
    }
  }, [userId]);

  if (!user) {
    return (
      <AuthGuard roles={["Super Admin", "Admin"]}>
        <DashboardLayout>
          <div className="p-6 text-center text-text-muted">User not found</div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const handleBlock = () => {
    toggleUserBlock(user.id);
    addToast(`${user.full_name} block status updated`, "success");
    setUser({ ...user, is_blocked: !user.is_blocked });
    bumpRefresh();
  };

  const handleDelete = () => {
    deleteUser(user.id);
    addToast(`${user.full_name} deleted successfully`, "success");
    bumpRefresh();
    router.push("/users");
  };

  const handleResetSubscription = () => {
    addToast("Subscription reset successfully", "success");
  };

  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/users" className="text-text-muted hover:text-text">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Basic & Physical Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <User className="h-4 w-4" /> Basic & Physical Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted">Name</label>
                    <p className="font-medium text-sm mt-0.5">{user.full_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Mobile Number</label>
                    <p className="font-medium text-sm mt-0.5">{user.mobile}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Date of Birth</label>
                    <p className="font-medium text-sm mt-0.5">{user.dob || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Gender</label>
                    <p className="font-medium text-sm mt-0.5 capitalize">{user.gender || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Height</label>
                    <p className="font-medium text-sm mt-0.5">175 cm</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Weight</label>
                    <p className="font-medium text-sm mt-0.5">70 kg</p>
                  </div>
                </div>
              </div>

              {/* Family Members */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Heart className="h-4 w-4" /> Family Members
                </h2>
                <p className="text-sm text-text-muted">No linked family members found.</p>
              </div>

              {/* Reports */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <FileText className="h-4 w-4" /> Medical Reports
                </h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Total Reports: 3</p>
                    <p className="text-xs text-text-muted mt-0.5">Latest: Annual Lipid Panel (2026-06-15)</p>
                  </div>
                  <button className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-elevated">
                    View Reports
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Subscription, Activity & Actions */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Shield className="h-4 w-4" /> Subscription Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-text-muted">Current Plan</label>
                    <p className="font-semibold capitalize mt-0.5 text-primary">{user.subscription_plan || "Free Trial"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Purchase Date</label>
                    <p className="font-medium mt-0.5">2026-04-12</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Expiry Date</label>
                    <p className="font-medium mt-0.5">2027-04-12</p>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Activity className="h-4 w-4" /> Activity
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-text-muted">Registration Date</label>
                    <p className="font-medium mt-0.5">2025-12-10</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Last Login</label>
                    <p className="font-medium mt-0.5">2026-07-09</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">App Version</label>
                    <p className="font-medium mt-0.5">v2.4.1</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Device Info</label>
                    <p className="font-medium mt-0.5 truncate">iPhone 14 (iOS 17.4)</p>
                  </div>
                </div>
              </div>

              {/* User Actions */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Settings className="h-4 w-4" /> Actions
                </h2>
                <div className="flex flex-col gap-2">
                  <button onClick={handleBlock} className="rounded-lg border border-outline-variant py-2.5 text-xs font-semibold hover:bg-surface-elevated text-left px-3">
                    {user.is_blocked ? "Unblock User" : "Block User"}
                  </button>
                  <button onClick={handleResetSubscription} className="rounded-lg border border-outline-variant py-2.5 text-xs font-semibold hover:bg-surface-elevated text-left px-3">
                    Reset Subscription
                  </button>
                  <button onClick={() => router.push("/billing")} className="rounded-lg border border-outline-variant py-2.5 text-xs font-semibold hover:bg-surface-elevated text-left px-3">
                    View Payments
                  </button>
                  <button onClick={() => router.push("/notifications/create")} className="rounded-lg border border-outline-variant py-2.5 text-xs font-semibold hover:bg-surface-elevated text-left px-3">
                    Send Notification
                  </button>
                  <button onClick={handleDelete} className="rounded-lg bg-red-600 text-white py-2.5 text-xs font-semibold hover:bg-red-700 text-left px-3">
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
