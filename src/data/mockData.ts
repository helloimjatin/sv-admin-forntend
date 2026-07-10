export type User = {
  id: number;
  name: string;
  phone: string;
  dob: string;
  gender: string;
  subscription_status: string;
  is_blocked: number;
  created_at: string;
  email?: string;
  height?: number;
  weight?: number;
  medical_conditions?: string | null;
  api_calls?: number;
  api_quota?: number;
};

export type Payment = {
  id: number;
  transaction_id: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
};

export type Subscription = {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  plan: string;
  price: number;
  start_date: string;
  expiry_date: string;
  status: string;
  auto_renew: number;
  current_plan_id: number;
};

export type StaffMember = {
  id: number;
  name: string;
  username?: string;
  email: string;
  role: string;
  last_login: string | null;
};

export type MedicalRecord = {
  id: number;
  patient_name: string;
  report_type: string;
  risk_level: string;
  created_at: string;
  account_holder: string;
};

export type Plan = {
  id: number;
  plan_code: string;
  plan_name: string;
  price: number;
  duration_days: number;
  reports_limit: number;
  chat_limit: number;
  family_members_limit: number;
};

export type EmergencyContact = {
  id: number;
  contact_name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
};

export type AdminNote = {
  id: number;
  note_text: string;
  admin_email: string;
  created_at: string;
};

export const DEMO_CREDENTIALS = {
  email: "admin@sehatvaani.com",
  password: "admin123",
};

export const plans: Plan[] = [
  { id: 1, plan_code: "free", plan_name: "Free", price: 0, duration_days: 0, reports_limit: 5, chat_limit: 5, family_members_limit: 1 },
  { id: 2, plan_code: "pro_monthly", plan_name: "Pro Monthly", price: 299, duration_days: 30, reports_limit: 50, chat_limit: 100, family_members_limit: 5 },
  { id: 3, plan_code: "pro_yearly", plan_name: "Pro Yearly", price: 2499, duration_days: 365, reports_limit: 100, chat_limit: 250, family_members_limit: 8 },
  { id: 4, plan_code: "family", plan_name: "Family Plus", price: 499, duration_days: 30, reports_limit: 75, chat_limit: 150, family_members_limit: 10 },
];

export let users: User[] = [
  { id: 1, name: "Rahul Sharma", phone: "+91 98765 43210", dob: "1990-05-15", gender: "Male", subscription_status: "active", is_blocked: 0, created_at: "2025-01-10T08:00:00", email: "rahul@email.com", height: 175, weight: 72, api_calls: 42, api_quota: 100 },
  { id: 2, name: "Priya Patel", phone: "+91 91234 56789", dob: "1995-08-22", gender: "Female", subscription_status: "pro_monthly", is_blocked: 0, created_at: "2025-03-14T10:30:00", email: "priya@email.com", height: 162, weight: 58, api_calls: 18, api_quota: 100 },
  { id: 3, name: "Amit Kumar", phone: "+91 99887 76655", dob: "1988-12-03", gender: "Male", subscription_status: "free", is_blocked: 1, created_at: "2024-11-20T14:15:00", email: "amit@email.com", height: 180, weight: 85, api_calls: 5, api_quota: 5 },
  { id: 4, name: "Sneha Reddy", phone: "+91 97654 32109", dob: "1992-02-28", gender: "Female", subscription_status: "active", is_blocked: 0, created_at: "2026-07-08T09:00:00", email: "sneha@email.com", height: 165, weight: 60, api_calls: 3, api_quota: 100 },
  { id: 5, name: "Vikram Singh", phone: "+91 90123 45678", dob: "1985-07-11", gender: "Male", subscription_status: "expired", is_blocked: 0, created_at: "2024-06-05T11:00:00", email: "vikram@email.com", height: 178, weight: 78, api_calls: 0, api_quota: 5 },
  { id: 6, name: "Ananya Iyer", phone: "+91 93456 78901", dob: "1998-04-19", gender: "Female", subscription_status: "pro_yearly", is_blocked: 0, created_at: "2025-09-01T16:45:00", email: "ananya@email.com", height: 158, weight: 52, api_calls: 67, api_quota: 250 },
];

export let payments: Payment[] = [
  { id: 1, transaction_id: "pay_abc123", customer_name: "Rahul Sharma", amount: 299, payment_method: "upi", status: "captured", payment_date: "2026-07-01T10:30:00" },
  { id: 2, transaction_id: "pay_def456", customer_name: "Priya Patel", amount: 299, payment_method: "card", status: "captured", payment_date: "2026-07-02T14:20:00" },
  { id: 3, transaction_id: "pay_ghi789", customer_name: "Ananya Iyer", amount: 2499, payment_method: "netbanking", status: "captured", payment_date: "2026-06-15T09:00:00" },
  { id: 4, transaction_id: "pay_jkl012", customer_name: "Vikram Singh", amount: 299, payment_method: "upi", status: "pending", payment_date: "2026-07-07T18:00:00" },
  { id: 5, transaction_id: "pay_mno345", customer_name: "Amit Kumar", amount: 299, payment_method: "card", status: "failed", payment_date: "2026-06-28T12:00:00" },
  { id: 6, transaction_id: "pay_pqr678", customer_name: "Sneha Reddy", amount: 499, payment_method: "upi", status: "captured", payment_date: "2026-07-08T08:15:00" },
];

export let subscriptions: Subscription[] = [
  { id: 1, user_id: 1, customer_name: "Rahul Sharma", customer_email: "+91 98765 43210", plan: "Pro Monthly", price: 299, start_date: "2026-06-01", expiry_date: "2026-07-01", status: "ACTIVE", auto_renew: 1, current_plan_id: 2 },
  { id: 2, user_id: 2, customer_name: "Priya Patel", customer_email: "+91 91234 56789", plan: "Pro Monthly", price: 299, start_date: "2026-06-02", expiry_date: "2026-07-12", status: "ACTIVE", auto_renew: 1, current_plan_id: 2 },
  { id: 3, user_id: 5, customer_name: "Vikram Singh", customer_email: "+91 90123 45678", plan: "Pro Monthly", price: 299, start_date: "2025-05-01", expiry_date: "2025-06-01", status: "EXPIRED", auto_renew: 0, current_plan_id: 2 },
  { id: 4, user_id: 6, customer_name: "Ananya Iyer", customer_email: "+91 93456 78901", plan: "Pro Yearly", price: 2499, start_date: "2025-09-01", expiry_date: "2026-09-01", status: "ACTIVE", auto_renew: 1, current_plan_id: 3 },
  { id: 5, user_id: 4, customer_name: "Sneha Reddy", customer_email: "+91 97654 32109", plan: "Family Plus", price: 499, start_date: "2026-07-08", expiry_date: "2026-08-08", status: "ACTIVE", auto_renew: 1, current_plan_id: 4 },
];

export let staff: StaffMember[] = [
  { id: 1, name: "Dr. Meera Nair", username: "meera_admin", email: "admin@sehatvaani.com", role: "Super Admin", last_login: "2026-07-08T08:00:00" },
  { id: 2, name: "Rajesh Gupta", username: "rajesh_g", email: "rajesh@sehatvaani.com", role: "Admin", last_login: "2026-07-07T16:30:00" },
  { id: 3, name: "Kavita Joshi", username: "kavita_s", email: "kavita@sehatvaani.com", role: "Support", last_login: "2026-07-06T11:00:00" },
  { id: 4, name: "Suresh Pillai", username: "suresh_m", email: "suresh@sehatvaani.com", role: "Moderator", last_login: null },
];

export const medicalRecords: MedicalRecord[] = [
  { id: 1, patient_name: "Rahul Sharma", report_type: "Complete Blood Count", risk_level: "medium", created_at: "2026-07-05T14:00:00", account_holder: "Rahul Sharma" },
  { id: 2, patient_name: "Priya Patel", report_type: "Lipid Profile", risk_level: "low", created_at: "2026-07-04T10:30:00", account_holder: "Priya Patel" },
  { id: 3, patient_name: "Amit Kumar", report_type: "Liver Function Test", risk_level: "high", created_at: "2026-07-03T09:15:00", account_holder: "Amit Kumar" },
  { id: 4, patient_name: "Sneha Reddy", report_type: "Thyroid Panel", risk_level: "low", created_at: "2026-07-08T08:00:00", account_holder: "Sneha Reddy" },
  { id: 5, patient_name: "Ananya Iyer", report_type: "HbA1c / Diabetes", risk_level: "medium", created_at: "2026-06-20T16:45:00", account_holder: "Ananya Iyer" },
  { id: 6, patient_name: "Vikram Singh", report_type: "Chest X-Ray", risk_level: "low", created_at: "2026-05-10T11:00:00", account_holder: "Vikram Singh" },
];

export const dashboardStats = {
  total_users: 1248,
  active_users: 1186,
  premium_users: 412,
  free_users: 836,
  today_signups: 14,
  today_reports: 47,
  today_ai_chats: 312,
  today_revenue: "₹18,450",
  pending_issues: 5,
  system_health: "100% Healthy",
};

export const subscriptionStats = {
  active_subs: 412,
  expired_subs: 38,
  expiring_soon: 12,
  total_revenue: 485200,
};

export const activityFeed = [
  { id: 1, type: "signup", message: "Sneha Reddy signed up", time: "2 min ago", icon: "user-plus" },
  { id: 2, type: "payment", message: "₹499 payment captured — Sneha Reddy", time: "5 min ago", icon: "credit-card" },
  { id: 3, type: "report", message: "New CBC report uploaded for Rahul Sharma", time: "12 min ago", icon: "file-text" },
  { id: 4, type: "ai", message: "AI chat session completed — Priya Patel", time: "18 min ago", icon: "bot" },
  { id: 5, type: "alert", message: "High-risk liver report flagged — Amit Kumar", time: "25 min ago", icon: "alert-triangle" },
  { id: 6, type: "subscription", message: "Pro Monthly renewed — Ananya Iyer", time: "1 hr ago", icon: "refresh-cw" },
];

export const chartData = {
  signups: [
    { day: "Mon", count: 8 }, { day: "Tue", count: 12 }, { day: "Wed", count: 10 },
    { day: "Thu", count: 15 }, { day: "Fri", count: 14 }, { day: "Sat", count: 9 }, { day: "Sun", count: 11 },
  ],
  revenue: [
    { day: "Mon", amount: 12400 }, { day: "Tue", amount: 15800 }, { day: "Wed", amount: 11200 },
    { day: "Thu", amount: 18900 }, { day: "Fri", amount: 18450 }, { day: "Sat", amount: 9800 }, { day: "Sun", amount: 7600 },
  ],
};

export const notifications = [
  { id: 1, title: "5 pending support tickets", body: "Review open tickets in the help center", time: "10m ago", read: false },
  { id: 2, title: "12 subscriptions expiring soon", body: "Send renewal reminders to users", time: "1h ago", read: false },
  { id: 3, title: "System health check passed", body: "All services running normally", time: "3h ago", read: true },
];

const medicalInfoStore: Record<number, Record<string, string | null>> = {
  1: {
    allergies: "Penicillin", chronic_conditions: "Mild hypertension", current_medications: "Amlodipine 5mg",
    surgery_history: "Appendectomy (2015)", family_medical_history: "Father — diabetes",
    smoking_status: "Never", alcohol_consumption: "Moderate", vaccination_status: "Complete",
    last_checkup_date: "2026-06-01", regular_doctor_name: "Dr. Sharma", regular_doctor_phone: "+91 98700 11111",
    insurance_provider: "Star Health", insurance_policy_number: "SH-2024-8891", insurance_valid_till: "2027-03-31",
  },
};

const emergencyContactsStore: Record<number, EmergencyContact[]> = {
  1: [
    { id: 1, contact_name: "Sunita Sharma", relationship: "Spouse", phone: "+91 98765 00001", email: "sunita@email.com", address: "Mumbai, MH" },
  ],
};

const adminNotesStore: Record<number, AdminNote[]> = {
  1: [
    { id: 1, note_text: "VIP user — priority support", admin_email: "admin@sehatvaani.com", created_at: "2026-06-15T10:00:00" },
  ],
};

const familyMembersStore: Record<number, { id: number; name: string; gender: string; date_of_birth: string; blood_group: string; is_primary: number }[]> = {
  1: [{ id: 1, name: "Sunita Sharma", gender: "Female", date_of_birth: "1992-08-10", blood_group: "O+", is_primary: 0 }],
};

export function getUserProfile(userId: number) {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const sub = subscriptions.find((s) => s.user_id === userId);
  const plan = plans.find((p) => p.id === sub?.current_plan_id) ?? plans[0];
  const userPayments = payments.filter((p) => p.customer_name === user.name);
  const userReports = medicalRecords.filter((r) => r.account_holder === user.name);

  return {
    user,
    subscription: sub
      ? { plan_name: sub.plan, plan_code: plan.plan_code, price: sub.price, status: sub.status, start_date: sub.start_date, expiry_date: sub.expiry_date, auto_renew: sub.auto_renew, reports_limit: plan.reports_limit, chat_limit: plan.chat_limit, family_members_limit: plan.family_members_limit }
      : null,
    medical_info: medicalInfoStore[userId] ?? {},
    family_members: familyMembersStore[userId] ?? [],
    emergency_contacts: emergencyContactsStore[userId] ?? [],
    reports: userReports,
    payments: userPayments,
    admin_notes: adminNotesStore[userId] ?? [],
    total_spent: userPayments.filter((p) => p.status === "captured").reduce((s, p) => s + p.amount, 0),
    usage: { reports_used: userReports.length, chats_used: user.api_calls ?? 0, current_period: "2026-07" },
    plans,
  };
}

export function toggleUserBlock(userId: number) {
  const user = users.find((u) => u.id === userId);
  if (user) user.is_blocked = user.is_blocked ? 0 : 1;
}

export function addUser(username: string) {
  const id = Math.max(...users.map((u) => u.id), 0) + 1;
  users.push({
    id, name: username, phone: "—", dob: "", gender: "—",
    subscription_status: "free", is_blocked: 0, created_at: new Date().toISOString(),
  });
}

export function addStaffMember(data: { name: string; username?: string; email: string; role: string; password?: string }) {
  const id = Math.max(...staff.map((s) => s.id), 0) + 1;
  staff.push({ id, name: data.name, username: data.username || data.email.split("@")[0], email: data.email, role: data.role, last_login: null });
}

export function updateStaffMember(id: number, data: Partial<StaffMember>) {
  const idx = staff.findIndex((s) => s.id === id);
  if (idx >= 0) staff[idx] = { ...staff[idx], ...data };
}

export function deleteStaffMember(id: number) {
  staff = staff.filter((s) => s.id !== id);
}

export function updateSubscriptionPlan(subId: number, planId: number) {
  const sub = subscriptions.find((s) => s.id === subId);
  const plan = plans.find((p) => p.id === planId);
  if (sub && plan) {
    sub.plan = plan.plan_name;
    sub.price = plan.price;
    sub.current_plan_id = plan.id;
  }
}

export function cancelSubscription(subId: number) {
  const sub = subscriptions.find((s) => s.id === subId);
  if (sub) {
    sub.status = "CANCELLED";
    sub.auto_renew = 0;
    sub.plan = "Free";
    sub.price = 0;
    sub.current_plan_id = 1;
  }
}

export function updateUserPersonal(userId: number, data: Partial<User>) {
  const user = users.find((u) => u.id === userId);
  if (user) Object.assign(user, data);
}

export function updateMedicalInfo(userId: number, data: Record<string, string | null>) {
  if (!medicalInfoStore[userId]) medicalInfoStore[userId] = {};
  Object.assign(medicalInfoStore[userId], data);
}

export function addEmergencyContact(userId: number, data: Omit<EmergencyContact, "id">) {
  if (!emergencyContactsStore[userId]) emergencyContactsStore[userId] = [];
  const id = Math.max(0, ...emergencyContactsStore[userId].map((c) => c.id)) + 1;
  emergencyContactsStore[userId].push({ id, ...data });
}

export function updateEmergencyContact(userId: number, contactId: number, data: Partial<EmergencyContact>) {
  const list = emergencyContactsStore[userId];
  if (!list) return;
  const idx = list.findIndex((c) => c.id === contactId);
  if (idx >= 0) list[idx] = { ...list[idx], ...data };
}

export function deleteEmergencyContact(userId: number, contactId: number) {
  if (emergencyContactsStore[userId]) {
    emergencyContactsStore[userId] = emergencyContactsStore[userId].filter((c) => c.id !== contactId);
  }
}

export function addAdminNote(userId: number, noteText: string, adminEmail: string) {
  if (!adminNotesStore[userId]) adminNotesStore[userId] = [];
  const id = Math.max(0, ...adminNotesStore[userId].map((n) => n.id)) + 1;
  adminNotesStore[userId].push({ id, note_text: noteText, admin_email: adminEmail, created_at: new Date().toISOString() });
}

export function deleteAdminNote(userId: number, noteId: number) {
  if (adminNotesStore[userId]) {
    adminNotesStore[userId] = adminNotesStore[userId].filter((n) => n.id !== noteId);
  }
}

export function resetApiCalls(userId: number) {
  const user = users.find((u) => u.id === userId);
  if (user) user.api_calls = 0;
}

export function deleteUser(userId: number) {
  users = users.filter((u) => u.id !== userId);
}
