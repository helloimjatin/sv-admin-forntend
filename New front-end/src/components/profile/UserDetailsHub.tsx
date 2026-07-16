"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Modal, ProgressBar } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  getUserProfile,
  toggleUserBlock,
  updateUserPersonal,
  updateMedicalInfo,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  addAdminNote,
  deleteAdminNote,
  resetApiCalls,
  deleteUser,
  plans,
} from "@/data/mockData";
import {
  assignPlan,
  cancelUserSubscription,
  extendSubscription,
  forceLogoutDevice,
  getManagedUser,
  removeDevice,
  setUserStatus,
  softDeleteManagedUser,
  statusBadgeVariant,
  updateManagedUser,
  userAuditLogs,
  userToForm,
} from "@/data/userManagementData";
import {
  addUserNotification,
  deleteUserNotification,
  forceLogoutAllSessions,
  getUserProfileExtras,
  resendUserNotification,
  scheduleAppointment,
  setMfaEnabled,
  updateAppointmentStatus,
} from "@/data/userProfileDetailData";
import { useApp } from "@/context/AppContext";
import { calcAge, calcBMI, daysRemaining, formatCurrency, formatDate, formatDateTime, getInitials, cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "personal", label: "Personal Information", icon: "person" },
  { id: "medical", label: "Medical Profile", icon: "medical_information" },
  { id: "appointments", label: "Appointments", icon: "event" },
  { id: "prescriptions", label: "Prescriptions", icon: "medication" },
  { id: "labs", label: "Lab Reports", icon: "biotech" },
  { id: "ai", label: "AI Health Assistant", icon: "smart_toy" },
  { id: "devices", label: "Devices", icon: "devices" },
  { id: "billing", label: "Subscription & Billing", icon: "payments" },
  { id: "activity", label: "Activity Timeline", icon: "timeline" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "security", label: "Security", icon: "security" },
  { id: "audit", label: "Audit Logs", icon: "policy" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MEDICAL_ESSENTIAL_FIELDS = [
  "allergies",
  "chronic_conditions",
  "current_medications",
] as const;

const MEDICAL_ALL_FIELDS = [
  ...MEDICAL_ESSENTIAL_FIELDS,
  "surgery_history",
  "family_medical_history",
  "smoking_status",
  "alcohol_consumption",
  "vaccination_status",
  "last_checkup_date",
  "regular_doctor_name",
  "regular_doctor_phone",
  "insurance_provider",
  "insurance_policy_number",
  "insurance_valid_till",
] as const;

const PERSONAL_ESSENTIAL_FIELDS = ["name", "phone", "dob", "gender"] as const;

const CONTACT_ESSENTIAL_FIELDS = ["contact_name", "relationship", "phone"] as const;

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-outline-variant/30 last:border-0">
      <span className="text-sm text-text-muted shrink-0">{label}</span>
      <span className="text-sm font-semibold text-right">{value || "—"}</span>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return <p className="text-sm text-text-muted italic text-center py-8">{message}</p>;
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-lg shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-lg shimmer" />
        <div className="h-40 rounded-lg shimmer" />
      </div>
    </div>
  );
}

export function UserDetailsHub({ userId }: { userId: number }) {
  const router = useRouter();
  const { addToast, adminEmail, bumpRefresh, refreshKey, role } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";
  const isSuper = role === "Super Admin";

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [planId, setPlanId] = useState(2);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<"push" | "email" | "sms" | "whatsapp">("push");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [apptOpen, setApptOpen] = useState(false);
  const [apptForm, setApptForm] = useState({ doctor: "Dr. Mehta", type: "Video Consultation", datetime: "", payment_status: "pending" });
  const [editPersonal, setEditPersonal] = useState(false);
  const [editMedical, setEditMedical] = useState(false);
  const [personalForm, setPersonalForm] = useState<Record<string, string>>({});
  const [medicalForm, setMedicalForm] = useState<Record<string, string>>({});
  const [contactModal, setContactModal] = useState<{ mode: "add" | "edit"; id?: number } | null>(null);
  const [contactForm, setContactForm] = useState({ contact_name: "", relationship: "Other", phone: "", email: "", address: "" });
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [userId, refreshKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#subscription") {
      setTab("billing");
    }
  }, []);

  const profile = getUserProfile(userId);
  const managed = getManagedUser(userId);
  const extras = useMemo(() => getUserProfileExtras(userId), [userId, refreshKey]);

  if (!profile && !managed) {
    return (
      <div className="text-center py-20 text-text-muted">
        <MaterialIcon name="error" size={48} className="text-red-500 mb-4" />
        <p>User not found.</p>
        <Link href="/users" className="text-primary font-semibold mt-4 inline-block hover:underline">← Back to Users</Link>
      </div>
    );
  }

  const user = profile?.user;
  const subscription = profile?.subscription;
  const medical_info = profile?.medical_info ?? {};
  const family_members = profile?.family_members ?? [];
  const emergency_contacts = profile?.emergency_contacts ?? [];
  const reports = profile?.reports ?? [];
  const payments = profile?.payments ?? [];
  const admin_notes = profile?.admin_notes ?? [];
  const total_spent = profile?.total_spent ?? 0;
  const usage = profile?.usage ?? { reports_used: 0, chats_used: 0, current_period: "—" };

  const name = managed?.full_name || user?.name || "User";
  const phone = managed?.mobile || user?.phone || "—";
  const email = managed?.email || user?.email || "—";
  const height = managed?.height ?? user?.height;
  const weight = managed?.weight ?? user?.weight;
  const dob = managed?.dob || user?.dob || "";
  const gender = managed?.gender || user?.gender || "—";
  const bmi = calcBMI(height, weight);
  const remaining = subscription ? daysRemaining(subscription.expiry_date) : managed?.subscription_expiry ? daysRemaining(managed.subscription_expiry) : null;
  const status = managed?.status || (user?.is_blocked ? "inactive" : "active");
  const isInactive = status === "inactive" || !!user?.is_blocked;
  const audits = userAuditLogs.filter((a) => a.user_id === userId);

  function exportData() {
    const payload = { managed, profile, extras };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `user-${userId}-profile.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addToast("User data exported", "success");
  }

  function printProfile() {
    window.print();
  }

  return (
    <div className="space-y-5" key={refreshKey}>
      {/* Sticky header / actions */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-background/95 backdrop-blur border-b border-outline-variant/40 print:static print:border-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/users")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-text w-fit"
            >
              <MaterialIcon name="arrow_back" size={16} /> Back
            </button>

            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="h-14 w-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-lg font-bold shrink-0">
                {getInitials(name)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold truncate">{name}</h1>
                  <Badge variant={statusBadgeVariant(status)}>{status === "active" ? "Active" : "Inactive"}</Badge>
                  <Badge variant="purple">{managed?.subscription_plan || subscription?.plan_name || "Free"}</Badge>
                </div>
                <p className="text-sm text-text-muted mt-0.5 font-mono">
                  {managed?.user_id || `#${userId}`} · {phone}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {managed?.verification.mobile && <Badge variant="success">Mobile Verified</Badge>}
                  {managed?.verification.email && <Badge variant="info">Email Verified</Badge>}
                  {managed?.verification.kyc && <Badge variant="purple">KYC</Badge>}
                  {managed?.verification.doctor && <Badge variant="default">Doctor Verified</Badge>}
                  {managed?.verification.premium && <Badge variant="warning">Premium</Badge>}
                  <span className="text-[11px] text-text-muted self-center ml-1">
                    Last active: {extras.last_active ? formatDateTime(extras.last_active) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Link href={`/users/new?edit=${userId}`} className="rounded-lg bg-primary text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-primary-container inline-flex items-center gap-1">
              <MaterialIcon name="edit" size={16} /> Edit User
            </Link>
            <button
              type="button"
              onClick={() => {
                const next = isInactive ? "active" : "inactive";
                setUserStatus(userId, next, editor);
                if (user) {
                  const shouldBlock = next === "inactive";
                  if (!!user.is_blocked !== shouldBlock) toggleUserBlock(userId);
                }
                addToast(next === "active" ? "User activated" : "User deactivated", "success");
                bumpRefresh();
              }}
              className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated"
            >
              {isInactive ? "Activate" : "Deactivate"}
            </button>
            <button type="button" onClick={() => setPlanOpen(true)} className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated">Assign Subscription</button>
            <button type="button" onClick={() => { setNotifyChannel("push"); setNotifyOpen(true); }} className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated">Send Notification</button>
            <button type="button" onClick={() => { setNotifyChannel("email"); setNotifyOpen(true); }} className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated">Send Email</button>
            <button type="button" onClick={exportData} className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated">Export</button>
            <button type="button" onClick={printProfile} className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated">Print</button>
            <button type="button" onClick={() => setDeleteOpen(true)} className="rounded-lg bg-red-600 text-white text-xs font-semibold uppercase tracking-wide px-4 py-2">Delete</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <div className="min-w-0 space-y-4">
          {/* Tabs */}
          <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-2 overflow-x-auto print:hidden" role="tablist" aria-label="User detail tabs">
            <div className="flex gap-1 min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
                    tab === t.id
                      ? "bg-primary-fixed text-on-primary-fixed"
                      : "text-text-muted hover:bg-surface-elevated"
                  )}
                >
                  <MaterialIcon name={t.icon} size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Skeleton />
          ) : (
            <div className="animate-fade-in" role="tabpanel">
              {tab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card title="Account Overview">
                    <Field label="Mobile" value={phone} />
                    <Field label="Email" value={email} />
                    <Field label="Verification" value={
                      managed
                        ? [managed.verification.mobile && "Mobile", managed.verification.email && "Email", managed.verification.kyc && "KYC"].filter(Boolean).join(", ") || "Pending"
                        : "—"
                    } />
                    <Field label="Registered" value={formatDate(managed?.created_at || user?.created_at)} />
                    <Field label="Last Login" value={managed?.last_login ? formatDateTime(managed.last_login) : "Never"} />
                    <Field label="Last Active" value={extras.last_active ? formatDateTime(extras.last_active) : "—"} />
                    <Field label="Login Method" value={managed?.auth_method} />
                    <Field label="Language" value={extras.preferred_language} />
                    <Field label="Timezone" value={extras.timezone} />
                    <Field label="Profile Completion" value={`${extras.profile_completion}%`} />
                  </Card>

                  <Card title="Subscription Summary">
                    <Field label="Current Plan" value={managed?.subscription_plan || subscription?.plan_name} />
                    <Field label="Status" value={subscription?.status || managed?.status} />
                    <Field label="Started On" value={formatDate(subscription?.start_date)} />
                    <Field label="Expiry" value={formatDate(managed?.subscription_expiry || subscription?.expiry_date)} />
                    <Field label="Renewal" value={formatDate(managed?.subscription_expiry || subscription?.expiry_date)} />
                    <Field label="Auto Renewal" value={subscription?.auto_renew ? "Yes" : "No"} />
                    <Field label="Days Remaining" value={remaining != null ? `${remaining} days` : "—"} />
                    <Field label="Total Spent" value={formatCurrency(total_spent)} />
                  </Card>

                  <Card title="Health Summary">
                    <Field label="Age" value={calcAge(dob)} />
                    <Field label="Gender" value={gender} />
                    <Field label="Blood Group" value={managed?.blood_group} />
                    <Field label="Height" value={height ? `${height} cm` : "—"} />
                    <Field label="Weight" value={weight ? `${weight} kg` : "—"} />
                    <Field label="BMI" value={typeof bmi === "object" ? `${bmi.value} (${bmi.label})` : "—"} />
                    <Field label="Conditions" value={managed?.medical_conditions?.join(", ") || user?.medical_conditions} />
                    <Field label="Allergies" value={managed?.allergies?.join(", ")} />
                    <Field label="Emergency" value={managed?.emergency_contact_name ? `${managed.emergency_contact_name} (${managed.emergency_contact_phone})` : emergency_contacts[0]?.contact_name} />
                  </Card>

                  <Card title="Doctor Assignment">
                    <Field label="Primary Doctor" value={managed?.assigned_doctor || extras.care_team[0]?.name} />
                    <Field label="Care Team" value={extras.care_team.map((c) => `${c.name} — ${c.role}`).join("; ") || "—"} />
                    <Field label="Last Consultation" value={extras.last_consultation ? formatDateTime(extras.last_consultation) : "—"} />
                    <Field label="Upcoming" value={extras.upcoming_appointment ? formatDateTime(extras.upcoming_appointment) : "None"} />
                  </Card>

                  <Card title="Usage Statistics" action={<span className="text-[10px] text-text-muted">{usage.current_period}</span>}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {[
                        ["AI Chats", extras.ai_usage.total_chats || usage.chats_used],
                        ["Appointments", extras.usage_summary.appointments],
                        ["Reports", extras.usage_summary.reports || reports.length],
                        ["Prescriptions", extras.usage_summary.prescriptions],
                        ["Health Score", managed?.health_score ?? "—"],
                        ["Logins", extras.usage_summary.login_count],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="rounded-lg bg-surface-low p-3">
                          <p className="text-[10px] uppercase text-text-muted font-semibold">{k}</p>
                          <p className="text-lg font-bold mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                    {subscription && (
                      <div className="space-y-3">
                        <ProgressBar label="Reports Used" used={usage.reports_used} limit={subscription.reports_limit} />
                        <ProgressBar label="AI Chats Used" used={usage.chats_used} limit={subscription.chat_limit} />
                      </div>
                    )}
                  </Card>

                  <Card title="Admin Notes">
                    <div className="flex gap-2 mb-3">
                      <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" className="flex-1 rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary" />
                      <button type="button" onClick={() => { if (noteText.trim()) { addAdminNote(userId, noteText.trim(), editor); setNoteText(""); addToast("Note added"); bumpRefresh(); } }} className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2">Add</button>
                    </div>
                    {admin_notes.length === 0 && <Empty message="No admin notes." />}
                    {admin_notes.map((n) => (
                      <div key={n.id} className="flex justify-between gap-2 py-2 border-b border-outline-variant/30 last:border-0">
                        <div>
                          <p className="text-sm">{n.note_text}</p>
                          <p className="text-[10px] text-text-muted">{n.admin_email} · {formatDate(n.created_at)}</p>
                        </div>
                        <button type="button" onClick={() => { deleteAdminNote(userId, n.id); addToast("Note deleted", "info"); bumpRefresh(); }} className="text-red-600" aria-label="Delete note"><MaterialIcon name="delete" size={16} /></button>
                      </div>
                    ))}
                  </Card>
                </div>
              )}

              {tab === "personal" && (
                <div className="space-y-4">
                  <Card title="Complete Profile" action={<button type="button" onClick={() => { setPersonalForm({ name, phone, dob: dob.slice(0, 10), gender }); setEditPersonal(true); }} className="text-xs font-semibold text-primary">Quick Edit</button>}>
                    <Field label="Full Name" value={name} />
                    <Field label="User ID" value={managed?.user_id || `#${userId}`} />
                    <Field label="Email" value={email} />
                    <Field label="Mobile" value={phone} />
                    <Field label="DOB / Age" value={`${formatDate(dob)} · ${calcAge(dob)}`} />
                    <Field label="Gender" value={gender} />
                    <Field label="Blood Group" value={managed?.blood_group} />
                    <Field label="Occupation" value={extras.occupation} />
                    <Field label="Health ID" value={managed?.health_id} />
                    <Field label="Aadhaar (masked)" value={managed?.aadhaar_masked} />
                  </Card>
                  <Card title="Address & Contact">
                    <Field label="Address" value={managed?.address} />
                    <Field label="City" value={managed?.city} />
                    <Field label="State" value={managed?.state} />
                    <Field label="Country" value={managed?.country} />
                    <Field label="Emergency Name" value={managed?.emergency_contact_name} />
                    <Field label="Emergency Phone" value={managed?.emergency_contact_phone} />
                  </Card>
                  <Card title="Insurance">
                    <Field label="Provider" value={(medical_info as Record<string, string>).insurance_provider || extras.insurance.provider} />
                    <Field label="Policy" value={(medical_info as Record<string, string>).insurance_policy_number || extras.insurance.policy_number} />
                    <Field label="Valid Till" value={(medical_info as Record<string, string>).insurance_valid_till || extras.insurance.valid_till} />
                  </Card>
                  <Card title="Family Members" action={<Badge variant="default">{family_members.length}</Badge>}>
                    {family_members.length === 0 && <Empty message="No family members." />}
                    {family_members.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 py-2 border-b border-outline-variant/30 last:border-0">
                        <div className="h-9 w-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">{getInitials(f.name)}</div>
                        <div>
                          <p className="text-sm font-semibold">{f.name}</p>
                          <p className="text-xs text-text-muted">{f.gender} · {calcAge(f.date_of_birth)} · {f.blood_group}</p>
                        </div>
                      </div>
                    ))}
                  </Card>
                  <Card
                    title="Emergency Contacts"
                    action={
                      <button type="button" onClick={() => { setContactForm({ contact_name: "", relationship: "Other", phone: "", email: "", address: "" }); setContactModal({ mode: "add" }); }} className="text-xs font-semibold text-primary">Add</button>
                    }
                  >
                    {emergency_contacts.length === 0 && <Empty message="No emergency contacts." />}
                    {emergency_contacts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2 py-2 border-b border-outline-variant/30 last:border-0">
                        <div>
                          <p className="text-sm font-semibold">{c.contact_name}</p>
                          <p className="text-xs text-text-muted">{c.relationship} · {c.phone}</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => { setContactForm({ contact_name: c.contact_name, relationship: c.relationship, phone: c.phone, email: c.email, address: c.address }); setContactModal({ mode: "edit", id: c.id }); }} className="text-primary p-1" aria-label={`Edit ${c.contact_name}`}><MaterialIcon name="edit" size={16} /></button>
                          <button type="button" onClick={() => { deleteEmergencyContact(userId, c.id); addToast("Contact deleted", "info"); bumpRefresh(); }} className="text-red-600 p-1" aria-label={`Delete ${c.contact_name}`}><MaterialIcon name="delete" size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              )}

              {tab === "medical" && (
                <div className="space-y-4">
                  <Card title="Medical Profile" action={<button type="button" onClick={() => { const form: Record<string, string> = { blood_group: managed?.blood_group || "" }; MEDICAL_ALL_FIELDS.forEach((f) => { form[f] = (medical_info as Record<string, string>)?.[f] || ""; }); setMedicalForm(form); setEditMedical(true); }} className="text-xs font-semibold text-primary">Edit</button>}>
                    <Field label="blood group" value={managed?.blood_group} />
                    {MEDICAL_ESSENTIAL_FIELDS.map((f) => (
                      <Field key={f} label={f.replace(/_/g, " ")} value={(medical_info as Record<string, string>)?.[f]} />
                    ))}
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card title="Health Goals">
                      {extras.health_goals.length === 0 && <Empty message="No goals set." />}
                      <ul className="space-y-1">{extras.health_goals.map((g) => <li key={g} className="text-sm flex items-center gap-2"><MaterialIcon name="flag" size={14} className="text-primary" />{g}</li>)}</ul>
                    </Card>
                    <Card title="Risk Factors">
                      {extras.risk_factors.length === 0 && <Empty message="No risk factors." />}
                      <ul className="space-y-1">{extras.risk_factors.map((g) => <li key={g} className="text-sm flex items-center gap-2"><MaterialIcon name="warning" size={14} className="text-amber-600" />{g}</li>)}</ul>
                    </Card>
                    <Card title="Lifestyle">
                      <Field label="Smoking" value={extras.lifestyle.smoking} />
                      <Field label="Alcohol" value={extras.lifestyle.alcohol} />
                      <Field label="Exercise" value={extras.lifestyle.exercise} />
                    </Card>
                    <Card title="Vaccinations">
                      {(managed?.vaccinations?.length ? managed.vaccinations : []).map((v) => (
                        <p key={v} className="text-sm py-1 border-b border-outline-variant/30 last:border-0">{v}</p>
                      ))}
                      {!managed?.vaccinations?.length && <Empty message="No vaccination records." />}
                    </Card>
                  </div>
                  <Card title="Uploaded Health Documents">
                    {reports.length === 0 && <Empty message="No documents uploaded." />}
                    {reports.map((r) => (
                      <div key={r.id} className="flex justify-between items-center py-2 border-b border-outline-variant/30 last:border-0 text-sm">
                        <div>
                          <p className="font-semibold">{r.report_type}</p>
                          <p className="text-xs text-text-muted">{formatDate(r.created_at)}</p>
                        </div>
                        <Badge variant={r.risk_level === "high" ? "danger" : r.risk_level === "medium" ? "warning" : "success"}>{r.risk_level}</Badge>
                      </div>
                    ))}
                  </Card>
                </div>
              )}

              {tab === "appointments" && (
                <Card
                  title="Appointments"
                  action={<button type="button" onClick={() => setApptOpen(true)} className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-1.5">Schedule</button>}
                >
                  {extras.appointments.length === 0 && <Empty message="No appointments." />}
                  <div className="space-y-3">
                    {extras.appointments.map((a) => (
                      <div key={a.id} className="rounded-lg border border-outline-variant/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{a.doctor}</p>
                            <Badge variant={a.status === "upcoming" ? "info" : a.status === "completed" ? "success" : a.status === "cancelled" ? "danger" : "warning"}>{a.status}</Badge>
                            <Badge variant="default">{a.payment_status}</Badge>
                          </div>
                          <p className="text-xs text-text-muted">{a.type} · {formatDateTime(a.datetime)}</p>
                          {a.notes && <p className="text-xs mt-1">{a.notes}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {a.status === "upcoming" && (
                            <>
                              <button type="button" onClick={() => { updateAppointmentStatus(userId, a.id, "rescheduled"); addToast("Marked rescheduled", "info"); bumpRefresh(); }} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5">Reschedule</button>
                              <button type="button" onClick={() => { updateAppointmentStatus(userId, a.id, "cancelled"); addToast("Appointment cancelled", "info"); bumpRefresh(); }} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5 text-red-600">Cancel</button>
                            </>
                          )}
                          <button type="button" onClick={() => addToast("Summary download started", "success")} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5">Download</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "prescriptions" && (
                <Card title="Prescriptions">
                  {extras.prescriptions.length === 0 && <Empty message="No prescriptions." />}
                  <div className="space-y-3">
                    {extras.prescriptions.map((p) => (
                      <div key={p.id} className="rounded-lg border border-outline-variant/40 p-3 flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{p.medicine}</p>
                            <Badge variant={p.status === "active" ? "success" : p.status === "expired" ? "warning" : "default"}>{p.status}</Badge>
                          </div>
                          <p className="text-xs text-text-muted">{p.dosage} · {p.prescribed_by}</p>
                          <p className="text-xs text-text-muted mt-0.5">Issued {formatDate(p.issued_at)} · Expires {formatDate(p.expires_at)}</p>
                        </div>
                        <button type="button" onClick={() => addToast("Prescription PDF downloaded", "success")} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5 h-fit">Download PDF</button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "labs" && (
                <Card title="Lab Reports">
                  {extras.lab_reports.length === 0 && reports.length === 0 && <Empty message="No lab reports." />}
                  <div className="space-y-3">
                    {extras.lab_reports.map((r) => (
                      <div key={r.id} className="rounded-lg border border-outline-variant/40 p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{r.title}</p>
                            <Badge variant={r.risk === "high" ? "danger" : r.risk === "medium" ? "warning" : "success"}>{r.risk}</Badge>
                            <Badge variant="info">{r.status}</Badge>
                          </div>
                          <button type="button" onClick={() => addToast("Report downloaded", "success")} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5">Download</button>
                        </div>
                        <p className="text-xs text-text-muted">{formatDateTime(r.uploaded_at)}</p>
                        <p className="text-sm"><span className="font-semibold">AI:</span> {r.ai_summary}</p>
                        <p className="text-sm"><span className="font-semibold">Doctor:</span> {r.doctor_review}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "ai" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      ["Total Chats", extras.ai_usage.total_chats],
                      ["Tokens Used", extras.ai_usage.tokens_used.toLocaleString()],
                      ["Saved Conversations", extras.ai_sessions.filter((s) => s.saved).length],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="rounded-lg border border-outline-variant/50 bg-surface-card p-4">
                        <p className="text-[10px] uppercase text-text-muted font-semibold">{k}</p>
                        <p className="text-xl font-bold mt-1">{v}</p>
                      </div>
                    ))}
                  </div>
                  <Card title="AI Recommendations">
                    {extras.ai_usage.recommendations.length === 0 && <Empty message="No recommendations." />}
                    <ul className="space-y-2">
                      {extras.ai_usage.recommendations.map((r) => (
                        <li key={r} className="text-sm flex items-start gap-2"><MaterialIcon name="lightbulb" size={16} className="text-amber-600 mt-0.5" />{r}</li>
                      ))}
                    </ul>
                  </Card>
                  <Card title="Chat History">
                    {extras.ai_sessions.length === 0 && <Empty message="No AI chat sessions." />}
                    <div className="space-y-3">
                      {extras.ai_sessions.map((s) => (
                        <div key={s.id} className="rounded-lg border border-outline-variant/40 p-3">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{s.title}</p>
                            {s.saved && <Badge variant="purple">Saved</Badge>}
                          </div>
                          <p className="text-xs text-text-muted">{formatDateTime(s.started_at)} · {s.messages} messages · {s.tokens} tokens</p>
                          <p className="text-xs mt-1">Topics: {s.topics.join(", ")}</p>
                          <p className="text-sm mt-1">{s.insight}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {tab === "devices" && (
                <Card title="Devices & Sessions">
                  {(!managed?.devices || managed.devices.length === 0) && <Empty message="No devices registered." />}
                  <div className="space-y-3">
                    {managed?.devices.map((d) => (
                      <div key={d.id} className="rounded-lg border border-outline-variant/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{d.device_type}</p>
                            <Badge variant={d.is_active ? "success" : "default"}>{d.is_active ? "Active" : "Logged out"}</Badge>
                          </div>
                          <p className="text-xs text-text-muted">{d.os_version} · App {d.app_version}</p>
                          <p className="text-xs text-text-muted">Last sync / login: {formatDateTime(d.last_active)}</p>
                        </div>
                        <div className="flex gap-2">
                          {d.is_active && (
                            <button type="button" onClick={() => { forceLogoutDevice(userId, d.id, editor); addToast("Device logged out", "success"); bumpRefresh(); }} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5">Force Logout</button>
                          )}
                          <button type="button" onClick={() => { removeDevice(userId, d.id, editor); addToast("Device removed", "info"); bumpRefresh(); }} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5 text-red-600">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => { forceLogoutAllSessions(userId); managed?.devices.forEach((d) => forceLogoutDevice(userId, d.id, editor)); addToast("All sessions revoked", "success"); bumpRefresh(); }} className="mt-4 rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-4 py-2 hover:bg-surface-elevated">
                    Revoke All Sessions
                  </button>
                </Card>
              )}

              {tab === "billing" && (
                <div className="space-y-4" id="subscription">
                  <Card title="Current Plan">
                    <Field label="Plan" value={managed?.subscription_plan || subscription?.plan_name} />
                    <Field label="Price" value={subscription ? formatCurrency(subscription.price) : "—"} />
                    <Field label="Status" value={subscription?.status || managed?.status} />
                    <Field label="Expiry" value={formatDate(managed?.subscription_expiry || subscription?.expiry_date)} />
                    <Field label="Auto Renew" value={subscription?.auto_renew ? "Yes" : "No"} />
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button type="button" onClick={() => setPlanOpen(true)} className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2">Upgrade / Assign</button>
                      <button type="button" onClick={() => { extendSubscription(userId, 30, editor); addToast("Extended +30 days", "success"); bumpRefresh(); }} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2">Extend +30d</button>
                      <button type="button" onClick={() => { cancelUserSubscription(userId, editor); addToast("Subscription cancelled", "info"); bumpRefresh(); }} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2 text-red-600">Cancel</button>
                      <button type="button" onClick={() => addToast("Refund request logged", "info")} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2">Refund</button>
                    </div>
                  </Card>
                  <Card title="Payment History & Invoices">
                    {payments.length === 0 && <Empty message="No payments found." />}
                    {payments.map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-outline-variant/30 last:border-0 text-sm">
                        <span className="font-mono text-xs text-primary">{p.transaction_id}</span>
                        <span>{formatCurrency(p.amount)}</span>
                        <span className="text-xs text-text-muted">{formatDate(p.payment_date)}</span>
                        <Badge variant={p.status === "captured" ? "success" : "warning"}>{p.status}</Badge>
                      </div>
                    ))}
                    <p className="text-xs text-text-muted mt-3">Coupons / refunds / upgrade history appear in audit logs when applied.</p>
                  </Card>
                </div>
              )}

              {tab === "activity" && (
                <Card title="Activity Timeline">
                  {(!managed?.activity_logs || managed.activity_logs.length === 0) && <Empty message="No activity yet." />}
                  <div className="space-y-2">
                    {managed?.activity_logs.map((a) => (
                      <div key={a.id} className="flex justify-between gap-3 p-3 rounded-lg border border-outline-variant/30">
                        <div>
                          <p className="text-sm font-medium">{a.message}</p>
                          <p className="text-[10px] uppercase text-text-muted mt-0.5">{a.type.replace("_", " ")}</p>
                        </div>
                        <span className="text-xs text-text-muted whitespace-nowrap">{formatDateTime(a.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "notifications" && (
                <Card
                  title="Notification History"
                  action={<button type="button" onClick={() => setNotifyOpen(true)} className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-1.5">Send Custom</button>}
                >
                  {extras.notifications.length === 0 && <Empty message="No notifications." />}
                  <div className="space-y-3">
                    {extras.notifications.map((n) => (
                      <div key={n.id} className="rounded-lg border border-outline-variant/40 p-3 flex flex-col sm:flex-row justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge variant="info">{n.channel}</Badge>
                            <Badge variant={n.delivery === "delivered" ? "success" : n.delivery === "failed" ? "danger" : "warning"}>{n.delivery}</Badge>
                            <Badge variant={n.read ? "default" : "purple"}>{n.read ? "Read" : "Unread"}</Badge>
                          </div>
                          <p className="font-semibold text-sm">{n.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-text-muted mt-1">{formatDateTime(n.sent_at)}</p>
                        </div>
                        <div className="flex gap-2 h-fit">
                          <button type="button" onClick={() => { resendUserNotification(userId, n.id); addToast("Notification resent", "success"); bumpRefresh(); }} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5">Resend</button>
                          <button type="button" onClick={() => { deleteUserNotification(userId, n.id); addToast("Notification deleted", "info"); bumpRefresh(); }} className="text-xs font-semibold border border-outline-variant rounded-lg px-3 py-1.5 text-red-600">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "security" && (
                <div className="space-y-4">
                  <Card title="Security Controls">
                    <Field label="Two-Factor Auth" value={extras.mfa_enabled ? "Enabled" : "Disabled"} />
                    <Field label="Trusted Devices" value={managed?.devices.filter((d) => d.is_active).length ?? 0} />
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button type="button" onClick={() => addToast(`Password reset sent to ${email}`, "success")} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2">Reset Password</button>
                      <button type="button" onClick={() => { forceLogoutAllSessions(userId); managed?.devices.forEach((d) => forceLogoutDevice(userId, d.id, editor)); addToast("All devices logged out", "success"); bumpRefresh(); }} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2">Force Logout All</button>
                      <button type="button" onClick={() => { setMfaEnabled(userId, !extras.mfa_enabled); addToast(extras.mfa_enabled ? "MFA disabled" : "MFA enabled", "success"); bumpRefresh(); }} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2">{extras.mfa_enabled ? "Disable MFA" : "Enable MFA"}</button>
                      <button type="button" onClick={() => { setUserStatus(userId, "inactive", editor); addToast("Account disabled", "info"); bumpRefresh(); }} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-2 text-red-600">Disable Account</button>
                    </div>
                  </Card>
                  <Card title="Login & Security Events">
                    {extras.security_events.length === 0 && <Empty message="No security events." />}
                    {extras.security_events.map((e) => (
                      <div key={e.id} className="flex flex-wrap justify-between gap-2 py-2 border-b border-outline-variant/30 last:border-0 text-sm">
                        <div>
                          <p className="font-medium capitalize">{e.type.replace("_", " ")}</p>
                          <p className="text-xs text-text-muted">{e.detail}{e.ip ? ` · ${e.ip}` : ""}</p>
                        </div>
                        <span className="text-xs text-text-muted">{formatDateTime(e.timestamp)}</span>
                      </div>
                    ))}
                  </Card>
                  <Card title="Login History (Devices)">
                    {(!managed?.login_history || managed.login_history.length === 0) && <Empty message="No login history." />}
                    {managed?.login_history.map((l) => (
                      <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-outline-variant/30 last:border-0 text-sm">
                        <span className="text-xs">{formatDateTime(l.timestamp)}</span>
                        <span className="font-mono text-xs">{l.ip}</span>
                        <span className="text-xs">{l.device} · {l.location}</span>
                        <Badge variant={l.success ? "success" : "danger"}>{l.success ? "OK" : "Failed"}</Badge>
                      </div>
                    ))}
                  </Card>
                </div>
              )}

              {tab === "audit" && (
                <Card title="Audit Logs">
                  {audits.length === 0 && <Empty message="No audit entries for this user yet. Actions you take will appear here." />}
                  <div className="space-y-2">
                    {audits.map((a) => (
                      <div key={a.id} className="rounded-lg border border-outline-variant/30 p-3 text-sm">
                        <div className="flex justify-between gap-2">
                          <p className="font-semibold capitalize">{a.action.replace(/_/g, " ")}</p>
                          <span className="text-xs text-text-muted">{formatDateTime(a.timestamp)}</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">{a.changed_by}{a.reason ? ` · ${a.reason}` : ""}</p>
                        {(a.previous_value || a.new_value) && (
                          <p className="text-xs font-mono mt-1">{a.previous_value || "—"} → {a.new_value || "—"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {isSuper && <p className="text-[10px] text-text-muted mt-3">Super Admin: full audit trail retained in session memory.</p>}
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar widgets */}
        <aside className="space-y-4 print:hidden xl:sticky xl:top-0 xl:self-start">
          <Card title="Quick Snapshot">
            <Field label="Status" value={<Badge variant={statusBadgeVariant(status as never)}>{String(status).replace("_", " ")}</Badge>} />
            <Field label="Plan" value={managed?.subscription_plan || subscription?.plan_name || "Free"} />
            <Field label="Health Score" value={managed?.health_score ?? "—"} />
            <Field label="Doctor" value={managed?.assigned_doctor || "Unassigned"} />
            <Field label="Last Login" value={managed?.last_login ? formatDate(managed.last_login) : "Never"} />
            <Field label="AI Usage" value={`${extras.ai_usage.total_chats} chats`} />
            <Field label="Upcoming Appt" value={extras.upcoming_appointment ? formatDate(extras.upcoming_appointment) : "None"} />
            <Field label="Profile" value={`${extras.profile_completion}%`} />
          </Card>
          <Card title="Shortcuts">
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setTab("billing")} className="text-left text-xs font-semibold px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-elevated">Manage Subscription</button>
              <button type="button" onClick={() => setTab("devices")} className="text-left text-xs font-semibold px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-elevated">Manage Devices</button>
              <button type="button" onClick={() => setTab("security")} className="text-left text-xs font-semibold px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-elevated">Security Settings</button>
              <button type="button" onClick={() => setTab("labs")} className="text-left text-xs font-semibold px-3 py-2 rounded-lg border border-outline-variant hover:bg-surface-elevated">Open Lab Reports</button>
            </div>
          </Card>
        </aside>
      </div>

      {/* Modals */}
      <Modal open={planOpen} onClose={() => setPlanOpen(false)} title="Assign Subscription" size="sm">
        <select value={planId} onChange={(e) => setPlanId(Number(e.target.value))} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm mb-4">
          {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name} — {formatCurrency(p.price)}</option>)}
        </select>
        <button type="button" onClick={() => { assignPlan(userId, planId, editor); addToast("Plan assigned", "success"); setPlanOpen(false); bumpRefresh(); }} className="w-full rounded-lg bg-primary text-white text-xs font-semibold uppercase py-2.5">Apply</button>
      </Modal>

      <Modal open={notifyOpen} onClose={() => setNotifyOpen(false)} title={`Message ${name}`} size="md">
        <div className="space-y-3">
          <select value={notifyChannel} onChange={(e) => setNotifyChannel(e.target.value as typeof notifyChannel)} className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm">
            <option value="push">Push</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <textarea value={notifyMsg} onChange={(e) => setNotifyMsg(e.target.value)} rows={4} placeholder="Write message…" className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" />
          <button type="button" onClick={() => {
            if (!notifyMsg.trim()) { addToast("Enter a message", "error"); return; }
            addUserNotification(userId, { channel: notifyChannel, title: "Admin message", body: notifyMsg.trim() });
            addToast(`${notifyChannel.toUpperCase()} queued`, "success");
            setNotifyMsg("");
            setNotifyOpen(false);
            bumpRefresh();
          }} className="w-full rounded-lg bg-primary text-white text-xs font-semibold uppercase py-2.5">Send</button>
        </div>
      </Modal>

      <Modal open={apptOpen} onClose={() => setApptOpen(false)} title="Schedule Appointment" size="md">
        <div className="space-y-3">
          <input className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" value={apptForm.doctor} onChange={(e) => setApptForm({ ...apptForm, doctor: e.target.value })} placeholder="Doctor" />
          <input className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" value={apptForm.type} onChange={(e) => setApptForm({ ...apptForm, type: e.target.value })} placeholder="Consultation type" />
          <input type="datetime-local" className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" value={apptForm.datetime} onChange={(e) => setApptForm({ ...apptForm, datetime: e.target.value })} />
          <select className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" value={apptForm.payment_status} onChange={(e) => setApptForm({ ...apptForm, payment_status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button type="button" onClick={() => {
            if (!apptForm.datetime) { addToast("Pick a date/time", "error"); return; }
            scheduleAppointment(userId, { ...apptForm, datetime: new Date(apptForm.datetime).toISOString() });
            addToast("Appointment scheduled", "success");
            setApptOpen(false);
            bumpRefresh();
          }} className="w-full rounded-lg bg-primary text-white text-xs font-semibold uppercase py-2.5">Schedule</button>
        </div>
      </Modal>

      <Modal open={editPersonal} onClose={() => setEditPersonal(false)} title="Edit Personal Details">
        <div className="space-y-3">
          {PERSONAL_ESSENTIAL_FIELDS.map((f) => (
            <div key={f}>
              <label className="text-xs font-semibold uppercase text-text-muted capitalize">{f.replace(/_/g, " ")}</label>
              <input
                type={f === "dob" ? "date" : "text"}
                value={personalForm[f] || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, [f]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
          <button type="button" onClick={() => {
            updateUserPersonal(userId, {
              name: personalForm.name,
              phone: personalForm.phone,
              dob: personalForm.dob,
              gender: personalForm.gender,
            });
            addToast("Personal details updated");
            setEditPersonal(false);
            bumpRefresh();
          }} className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold">Save Changes</button>
        </div>
      </Modal>

      <Modal open={editMedical} onClose={() => setEditMedical(false)} title="Edit Medical Information" size="md">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-text-muted">Blood group</label>
            <input value={medicalForm.blood_group || ""} onChange={(e) => setMedicalForm({ ...medicalForm, blood_group: e.target.value })} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          {MEDICAL_ESSENTIAL_FIELDS.map((f) => (
            <div key={f}>
              <label className="text-xs font-semibold uppercase text-text-muted capitalize">{f.replace(/_/g, " ")}</label>
              <input value={medicalForm[f] || ""} onChange={(e) => setMedicalForm({ ...medicalForm, [f]: e.target.value })} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => {
          const payload: Record<string, string> = {};
          MEDICAL_ALL_FIELDS.forEach((f) => {
            payload[f] = medicalForm[f] ?? (medical_info as Record<string, string>)?.[f] ?? "";
          });
          updateMedicalInfo(userId, payload);
          if (managed && medicalForm.blood_group !== managed.blood_group) {
            updateManagedUser(userId, { ...userToForm(managed), blood_group: medicalForm.blood_group }, editor);
          }
          addToast("Medical information updated");
          setEditMedical(false);
          bumpRefresh();
        }} className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold">Save Medical Info</button>
      </Modal>

      <Modal open={!!contactModal} onClose={() => setContactModal(null)} title={contactModal?.mode === "edit" ? "Edit Contact" : "Add Contact"}>
        <div className="space-y-3">
          {CONTACT_ESSENTIAL_FIELDS.map((f) => (
            <div key={f}>
              <label className="text-xs font-semibold uppercase text-text-muted capitalize">{f.replace(/_/g, " ")}</label>
              <input value={contactForm[f]} onChange={(e) => setContactForm({ ...contactForm, [f]: e.target.value })} className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          ))}
          <button type="button" onClick={() => {
            const payload = { ...contactForm, email: contactForm.email || "", address: contactForm.address || "" };
            if (contactModal?.mode === "edit" && contactModal.id) {
              updateEmergencyContact(userId, contactModal.id, payload);
              addToast("Emergency contact updated");
            } else {
              addEmergencyContact(userId, payload);
              addToast("Emergency contact added");
            }
            setContactModal(null);
            bumpRefresh();
          }} className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold">Save</button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete User?" size="sm">
        <p className="text-sm text-text-muted mb-3">Type <strong>DELETE</strong> to confirm soft-delete of {name}.</p>
        <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm mb-4" placeholder="DELETE" />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase">Cancel</button>
          <button
            type="button"
            disabled={deleteConfirm !== "DELETE"}
            onClick={() => {
              softDeleteManagedUser(userId, editor);
              deleteUser(userId);
              resetApiCalls(userId);
              addToast("User deleted", "info");
              router.push("/users");
            }}
            className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
