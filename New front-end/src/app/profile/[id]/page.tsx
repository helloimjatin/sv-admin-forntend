"use client";

import { use, useState, useEffect, useMemo } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getManagedUser, setUserStatus, softDeleteManagedUser } from "@/data/userManagementData";
import { getUserProfile } from "@/data/mockData";
import { getUserProfileExtras } from "@/data/userProfileDetailData";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Shield, Activity, FileText, Heart, MessageSquare } from "lucide-react";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();
  const { addToast, bumpRefresh, adminEmail, refreshKey } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";
  const [user, setUser] = useState<ReturnType<typeof getManagedUser>>(null);

  useEffect(() => {
    setUser(getManagedUser(userId));
  }, [userId, refreshKey]);

  const engagement = useMemo(() => {
    const profile = getUserProfile(userId);
    const extras = getUserProfileExtras(userId);
    const analyzedFromLabs = extras.lab_reports.filter((r) => r.status === "ai_analyzed").length;
    const analyzedReports = analyzedFromLabs || extras.usage_summary.reports || profile?.usage.reports_used || 0;
    const vaaniChats =
      extras.ai_sessions.length ||
      extras.ai_usage.total_chats ||
      profile?.usage.chats_used ||
      0;
    return { analyzedReports, vaaniChats };
  }, [userId, refreshKey]);

  if (!user) {
    return (
      <AuthGuard roles={["Super Admin", "Admin"]}>
        <DashboardLayout>
          <div className="p-6 text-center text-text-muted">User not found</div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const isBlocked = user.status === "inactive";

  const handleBlock = () => {
    const next = isBlocked ? "active" : "inactive";
    setUserStatus(user.id, next, editor);
    addToast(next === "inactive" ? `${user.full_name} blocked` : `${user.full_name} unblocked`, "success");
    setUser(getManagedUser(userId));
    bumpRefresh();
  };

  const handleDelete = () => {
    softDeleteManagedUser(user.id, editor);
    addToast(`${user.full_name} deleted successfully`, "success");
    bumpRefresh();
    router.push("/users");
  };

  return (
    <AuthGuard roles={["Super Admin", "Admin"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/users" className="text-text-muted hover:text-text">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold">User Details</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleBlock}
                className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-surface-elevated"
              >
                {isBlocked ? "Unblock User" : "Block User"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
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
                    <p className="font-medium text-sm mt-0.5">{user.height ? `${user.height} cm` : "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Weight</label>
                    <p className="font-medium text-sm mt-0.5">{user.weight ? `${user.weight} kg` : "—"}</p>
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

              {/* Reports & Vaani AI engagement */}
              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <FileText className="h-4 w-4" /> Medical Reports
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-outline-variant/40 bg-surface px-4 py-3">
                    <p className="text-xs text-text-muted">Analyzed reports</p>
                    <p className="text-2xl font-bold mt-1 tabular-nums">{engagement.analyzedReports}</p>
                    <p className="text-xs text-text-muted mt-1">Reports analyzed for this user</p>
                  </div>
                  <div className="rounded-lg border border-outline-variant/40 bg-surface px-4 py-3">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> Chats with Vaani AI
                    </p>
                    <p className="text-2xl font-bold mt-1 tabular-nums">{engagement.vaaniChats}</p>
                    <p className="text-xs text-text-muted mt-1">Conversations with Vaani AI</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Subscription & Activity */}
            <div className="space-y-6">
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
                    <p className="font-medium mt-0.5">{user.subscription_expiry || "2027-04-12"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Activity className="h-4 w-4" /> Activity
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs text-text-muted">Registration Date</label>
                    <p className="font-medium mt-0.5">{user.created_at?.slice(0, 10) || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Last Login</label>
                    <p className="font-medium mt-0.5">{user.last_login?.slice(0, 10) || "Never"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">App Version</label>
                    <p className="font-medium mt-0.5">{user.devices[0]?.app_version || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Device Info</label>
                    <p className="font-medium mt-0.5 truncate">
                      {user.devices[0]
                        ? `${user.devices[0].device_type} (${user.devices[0].os_version})`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
