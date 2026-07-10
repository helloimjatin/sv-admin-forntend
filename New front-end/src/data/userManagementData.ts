import { users as mockUsers, addUser as mockAddUser, updateUserPersonal, deleteUser as mockDeleteUser, plans, subscriptions, updateSubscriptionPlan, cancelSubscription } from "@/data/mockData";

export type AccountStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "blocked"
  | "pending_verification"
  | "deleted"
  | "trial";

export type UserRole = "patient" | "premium_member" | "caregiver" | "doctor_linked";

export type PatientType = "individual" | "family" | "corporate" | "student";

export type VerificationFlags = {
  mobile: boolean;
  email: boolean;
  kyc: boolean;
  doctor: boolean;
  premium: boolean;
};

export type UserDevice = {
  id: string;
  device_type: string;
  os_version: string;
  app_version: string;
  last_active: string;
  is_active: boolean;
};

export type LoginHistoryEntry = {
  id: number;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  success: boolean;
};

export type ActivityLogEntry = {
  id: number;
  type: string;
  message: string;
  timestamp: string;
};

export type UserAuditLog = {
  id: number;
  user_id: number;
  action: string;
  changed_by: string;
  previous_value?: string;
  new_value?: string;
  reason?: string;
  timestamp: string;
};

export type ManagedUser = {
  id: number;
  user_id: string;
  full_name: string;
  profile_photo?: string;
  email: string;
  mobile: string;
  health_id: string;
  aadhaar_masked: string;
  role: UserRole;
  status: AccountStatus;
  verification: VerificationFlags;
  subscription_plan: string;
  subscription_plan_id: number;
  subscription_expiry: string | null;
  assigned_doctor: string | null;
  health_score: number | null;
  gender: string;
  dob: string;
  blood_group: string;
  city: string;
  state: string;
  country: string;
  address: string;
  height?: number;
  weight?: number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  patient_type: PatientType;
  tags: string[];
  auth_method: string;
  last_login: string | null;
  devices: UserDevice[];
  login_history: LoginHistoryEntry[];
  activity_logs: ActivityLogEntry[];
  medical_conditions: string[];
  allergies: string[];
  medications: string[];
  family_history: string;
  vaccinations: string[];
  preferences: Record<string, string>;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type UserFormData = {
  full_name: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  blood_group: string;
  city: string;
  state: string;
  country: string;
  address: string;
  height: string;
  weight: string;
  role: UserRole;
  status: AccountStatus;
  patient_type: PatientType;
  subscription_plan_id: number;
  assigned_doctor: string;
  tags: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  health_id: string;
};

export const ACCOUNT_STATUSES: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "blocked", label: "Blocked" },
  { value: "pending_verification", label: "Pending Verification" },
  { value: "deleted", label: "Deleted" },
  { value: "trial", label: "Trial" },
];

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "patient", label: "Patient" },
  { value: "premium_member", label: "Premium Member" },
  { value: "caregiver", label: "Caregiver" },
  { value: "doctor_linked", label: "Doctor Linked" },
];

export const PATIENT_TYPES: { value: PatientType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "family", label: "Family" },
  { value: "corporate", label: "Corporate" },
  { value: "student", label: "Student" },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
export const AGE_GROUPS = [
  { value: "all", label: "All ages" },
  { value: "0-17", label: "0–17" },
  { value: "18-30", label: "18–30" },
  { value: "31-45", label: "31–45" },
  { value: "46-60", label: "46–60" },
  { value: "60+", label: "60+" },
];
export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
export const DOCTORS = ["Dr. Mehta", "Dr. Kapoor", "Dr. Nair", "Dr. Banerjee", "Unassigned"];
export const TAG_OPTIONS = ["VIP", "High Risk", "Diabetes", "Cardiac", "New User", "Corporate", "Student"];

let nextId = 20;
let nextAuditId = 1;
export let userAuditLogs: UserAuditLog[] = [];

export function addUserAudit(entry: Omit<UserAuditLog, "id" | "timestamp">) {
  userAuditLogs = [
    { ...entry, id: nextAuditId++, timestamp: new Date().toISOString() },
    ...userAuditLogs,
  ].slice(0, 300);
}

function maskAadhaar(last4: string) {
  return `XXXX-XXXX-${last4}`;
}

function makeDevices(seed: number): UserDevice[] {
  return [
    {
      id: `dev-${seed}-1`,
      device_type: seed % 2 === 0 ? "Android Phone" : "iPhone",
      os_version: seed % 2 === 0 ? "Android 14" : "iOS 17.5",
      app_version: "3.2.1",
      last_active: "2026-07-09T18:20:00",
      is_active: true,
    },
    {
      id: `dev-${seed}-2`,
      device_type: "Web Browser",
      os_version: "Chrome 126",
      app_version: "web-2.4.0",
      last_active: "2026-07-08T10:00:00",
      is_active: seed % 3 !== 0,
    },
  ];
}

function makeLoginHistory(seed: number): LoginHistoryEntry[] {
  return [
    { id: seed * 10 + 1, timestamp: "2026-07-09T18:20:00", ip: "103.21.244.12", device: "Android", location: "Mumbai, IN", success: true },
    { id: seed * 10 + 2, timestamp: "2026-07-07T09:10:00", ip: "103.21.244.12", device: "Web", location: "Mumbai, IN", success: true },
    { id: seed * 10 + 3, timestamp: "2026-07-01T22:05:00", ip: "49.36.12.8", device: "iOS", location: "Pune, IN", success: false },
  ];
}

function makeActivity(name: string): ActivityLogEntry[] {
  return [
    { id: 1, type: "login", message: `${name} logged in`, timestamp: "2026-07-09T18:20:00" },
    { id: 2, type: "ai_chat", message: "AI health chat session (12 messages)", timestamp: "2026-07-09T18:35:00" },
    { id: 3, type: "appointment", message: "Booked consultation with Dr. Mehta", timestamp: "2026-07-08T11:00:00" },
    { id: 4, type: "lab", message: "Uploaded CBC lab report", timestamp: "2026-07-06T14:20:00" },
    { id: 5, type: "reminder", message: "Medicine reminder acknowledged", timestamp: "2026-07-05T08:00:00" },
    { id: 6, type: "device", message: "Synced Fitbit wearable", timestamp: "2026-07-04T07:30:00" },
  ];
}

function statusFromMock(u: { subscription_status: string; is_blocked: number }): AccountStatus {
  if (u.is_blocked) return "blocked";
  if (u.subscription_status === "expired") return "inactive";
  if (u.subscription_status === "free") return "active";
  return "active";
}

function planFromMock(status: string): { name: string; id: number } {
  const found = plans.find((p) => p.plan_code === status || p.plan_name.toLowerCase().includes(status.replace("_", " ")));
  if (status === "pro_monthly") return { name: "Pro Monthly", id: 2 };
  if (status === "pro_yearly") return { name: "Pro Yearly", id: 3 };
  if (status === "active") return { name: "Pro Monthly", id: 2 };
  if (status === "expired") return { name: "Free", id: 1 };
  if (found) return { name: found.plan_name, id: found.id };
  return { name: "Free", id: 1 };
}

export let managedUsers: ManagedUser[] = [
  {
    id: 1,
    user_id: "SVU-1001",
    full_name: "Rahul Sharma",
    email: "rahul@email.com",
    mobile: "+91 98765 43210",
    health_id: "HID-RAH-001",
    aadhaar_masked: maskAadhaar("4521"),
    role: "premium_member",
    status: "active",
    verification: { mobile: true, email: true, kyc: true, doctor: true, premium: true },
    subscription_plan: "Pro Monthly",
    subscription_plan_id: 2,
    subscription_expiry: "2026-08-01",
    assigned_doctor: "Dr. Mehta",
    health_score: 78,
    gender: "Male",
    dob: "1990-05-15",
    blood_group: "B+",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "12 Marine Drive, Mumbai",
    height: 175,
    weight: 72,
    emergency_contact_name: "Sunita Sharma",
    emergency_contact_phone: "+91 98765 00011",
    patient_type: "family",
    tags: ["VIP", "Cardiac"],
    auth_method: "Mobile OTP + Google",
    last_login: "2026-07-09T18:20:00",
    devices: makeDevices(1),
    login_history: makeLoginHistory(1),
    activity_logs: makeActivity("Rahul Sharma"),
    medical_conditions: ["Hypertension"],
    allergies: ["Penicillin"],
    medications: ["Amlodipine 5mg"],
    family_history: "Father — diabetes",
    vaccinations: ["COVID-19", "Influenza 2025"],
    preferences: { locale: "en-IN", notifications: "all" },
    created_by: "system",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-01-10T08:00:00",
    updated_at: "2026-07-01T10:00:00",
    deleted_at: null,
  },
  {
    id: 2,
    user_id: "SVU-1002",
    full_name: "Priya Patel",
    email: "priya@email.com",
    mobile: "+91 91234 56789",
    health_id: "HID-PRI-002",
    aadhaar_masked: maskAadhaar("8832"),
    role: "premium_member",
    status: "active",
    verification: { mobile: true, email: true, kyc: false, doctor: true, premium: true },
    subscription_plan: "Pro Monthly",
    subscription_plan_id: 2,
    subscription_expiry: "2026-08-02",
    assigned_doctor: "Dr. Kapoor",
    health_score: 85,
    gender: "Female",
    dob: "1995-08-22",
    blood_group: "O+",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    address: "44 CG Road, Ahmedabad",
    height: 162,
    weight: 58,
    emergency_contact_name: "Ravi Patel",
    emergency_contact_phone: "+91 91234 00022",
    patient_type: "individual",
    tags: ["New User"],
    auth_method: "Email + OTP",
    last_login: "2026-07-08T12:00:00",
    devices: makeDevices(2),
    login_history: makeLoginHistory(2),
    activity_logs: makeActivity("Priya Patel"),
    medical_conditions: [],
    allergies: ["Dust"],
    medications: [],
    family_history: "None reported",
    vaccinations: ["COVID-19"],
    preferences: { locale: "en-IN", notifications: "push" },
    created_by: "system",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-03-14T10:30:00",
    updated_at: "2026-07-02T09:00:00",
    deleted_at: null,
  },
  {
    id: 3,
    user_id: "SVU-1003",
    full_name: "Amit Kumar",
    email: "amit@email.com",
    mobile: "+91 99887 76655",
    health_id: "HID-AMI-003",
    aadhaar_masked: maskAadhaar("1190"),
    role: "patient",
    status: "blocked",
    verification: { mobile: true, email: false, kyc: false, doctor: false, premium: false },
    subscription_plan: "Free",
    subscription_plan_id: 1,
    subscription_expiry: null,
    assigned_doctor: null,
    health_score: 52,
    gender: "Male",
    dob: "1988-12-03",
    blood_group: "A+",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    address: "9 Karol Bagh, Delhi",
    height: 180,
    weight: 85,
    emergency_contact_name: "Neha Kumar",
    emergency_contact_phone: "+91 99887 00033",
    patient_type: "individual",
    tags: ["High Risk"],
    auth_method: "Mobile OTP",
    last_login: "2026-06-20T16:00:00",
    devices: makeDevices(3),
    login_history: makeLoginHistory(3),
    activity_logs: makeActivity("Amit Kumar"),
    medical_conditions: ["Fatty liver"],
    allergies: [],
    medications: ["Metformin"],
    family_history: "Mother — hypertension",
    vaccinations: [],
    preferences: { locale: "hi-IN", notifications: "sms" },
    created_by: "system",
    updated_by: "admin@sehatvaani.com",
    created_at: "2024-11-20T14:15:00",
    updated_at: "2026-06-28T12:00:00",
    deleted_at: null,
  },
  {
    id: 4,
    user_id: "SVU-1004",
    full_name: "Sneha Reddy",
    email: "sneha@email.com",
    mobile: "+91 97654 32109",
    health_id: "HID-SNE-004",
    aadhaar_masked: maskAadhaar("7744"),
    role: "premium_member",
    status: "trial",
    verification: { mobile: true, email: true, kyc: false, doctor: false, premium: false },
    subscription_plan: "Family Plus",
    subscription_plan_id: 4,
    subscription_expiry: "2026-07-22",
    assigned_doctor: "Dr. Nair",
    health_score: 91,
    gender: "Female",
    dob: "1992-02-28",
    blood_group: "AB+",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    address: "21 Banjara Hills, Hyderabad",
    height: 165,
    weight: 60,
    emergency_contact_name: "Kiran Reddy",
    emergency_contact_phone: "+91 97654 00044",
    patient_type: "family",
    tags: ["New User", "VIP"],
    auth_method: "Apple + OTP",
    last_login: "2026-07-10T08:00:00",
    devices: makeDevices(4),
    login_history: makeLoginHistory(4),
    activity_logs: makeActivity("Sneha Reddy"),
    medical_conditions: [],
    allergies: [],
    medications: [],
    family_history: "None",
    vaccinations: ["COVID-19", "Hep B"],
    preferences: { locale: "en-IN", notifications: "all" },
    created_by: "system",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-07-08T09:00:00",
    updated_at: "2026-07-08T09:00:00",
    deleted_at: null,
  },
  {
    id: 5,
    user_id: "SVU-1005",
    full_name: "Vikram Singh",
    email: "vikram@email.com",
    mobile: "+91 90123 45678",
    health_id: "HID-VIK-005",
    aadhaar_masked: maskAadhaar("3301"),
    role: "patient",
    status: "inactive",
    verification: { mobile: true, email: true, kyc: true, doctor: false, premium: false },
    subscription_plan: "Free",
    subscription_plan_id: 1,
    subscription_expiry: "2025-12-01",
    assigned_doctor: "Dr. Banerjee",
    health_score: 64,
    gender: "Male",
    dob: "1985-07-11",
    blood_group: "O-",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    address: "5 MI Road, Jaipur",
    height: 178,
    weight: 78,
    emergency_contact_name: "Anita Singh",
    emergency_contact_phone: "+91 90123 00055",
    patient_type: "individual",
    tags: ["Diabetes"],
    auth_method: "Mobile OTP",
    last_login: "2026-01-15T11:00:00",
    devices: makeDevices(5).map((d) => ({ ...d, is_active: false })),
    login_history: makeLoginHistory(5),
    activity_logs: makeActivity("Vikram Singh"),
    medical_conditions: ["Type 2 Diabetes"],
    allergies: ["Sulfa"],
    medications: ["Glimepiride"],
    family_history: "Both parents — diabetes",
    vaccinations: ["COVID-19"],
    preferences: { locale: "en-IN", notifications: "email" },
    created_by: "system",
    updated_by: "admin@sehatvaani.com",
    created_at: "2024-06-05T11:00:00",
    updated_at: "2026-01-15T11:00:00",
    deleted_at: null,
  },
  {
    id: 6,
    user_id: "SVU-1006",
    full_name: "Ananya Iyer",
    email: "ananya@email.com",
    mobile: "+91 93456 78901",
    health_id: "HID-ANA-006",
    aadhaar_masked: maskAadhaar("5566"),
    role: "premium_member",
    status: "active",
    verification: { mobile: true, email: true, kyc: true, doctor: true, premium: true },
    subscription_plan: "Pro Yearly",
    subscription_plan_id: 3,
    subscription_expiry: "2027-06-15",
    assigned_doctor: "Dr. Mehta",
    health_score: 88,
    gender: "Female",
    dob: "1998-04-19",
    blood_group: "B-",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: "88 Indiranagar, Bengaluru",
    height: 158,
    weight: 52,
    emergency_contact_name: "Lakshmi Iyer",
    emergency_contact_phone: "+91 93456 00066",
    patient_type: "corporate",
    tags: ["Corporate", "VIP"],
    auth_method: "Google + 2FA",
    last_login: "2026-07-09T21:00:00",
    devices: makeDevices(6),
    login_history: makeLoginHistory(6),
    activity_logs: makeActivity("Ananya Iyer"),
    medical_conditions: [],
    allergies: ["Peanuts"],
    medications: [],
    family_history: "None",
    vaccinations: ["COVID-19", "HPV"],
    preferences: { locale: "en-IN", notifications: "all" },
    created_by: "system",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-09-01T16:45:00",
    updated_at: "2026-06-15T09:00:00",
    deleted_at: null,
  },
  {
    id: 7,
    user_id: "SVU-1007",
    full_name: "Farhan Qureshi",
    email: "farhan@email.com",
    mobile: "+91 95555 11223",
    health_id: "HID-FAR-007",
    aadhaar_masked: maskAadhaar("2211"),
    role: "patient",
    status: "pending_verification",
    verification: { mobile: true, email: false, kyc: false, doctor: false, premium: false },
    subscription_plan: "Free",
    subscription_plan_id: 1,
    subscription_expiry: null,
    assigned_doctor: null,
    health_score: null,
    gender: "Male",
    dob: "1993-11-02",
    blood_group: "Unknown",
    city: "Lucknow",
    state: "Uttar Pradesh",
    country: "India",
    address: "3 Hazratganj, Lucknow",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    patient_type: "student",
    tags: ["Student", "New User"],
    auth_method: "Mobile OTP",
    last_login: null,
    devices: [],
    login_history: [],
    activity_logs: [{ id: 1, type: "signup", message: "Account created", timestamp: "2026-07-09T10:00:00" }],
    medical_conditions: [],
    allergies: [],
    medications: [],
    family_history: "",
    vaccinations: [],
    preferences: { locale: "en-IN", notifications: "push" },
    created_by: "system",
    updated_by: "system",
    created_at: "2026-07-09T10:00:00",
    updated_at: "2026-07-09T10:00:00",
    deleted_at: null,
  },
  {
    id: 8,
    user_id: "SVU-1008",
    full_name: "Meera Joshi",
    email: "meera@email.com",
    mobile: "+91 96666 44556",
    health_id: "HID-MEE-008",
    aadhaar_masked: maskAadhaar("9090"),
    role: "caregiver",
    status: "suspended",
    verification: { mobile: true, email: true, kyc: true, doctor: false, premium: false },
    subscription_plan: "Pro Monthly",
    subscription_plan_id: 2,
    subscription_expiry: "2026-07-20",
    assigned_doctor: "Dr. Kapoor",
    health_score: 70,
    gender: "Female",
    dob: "1980-03-18",
    blood_group: "A-",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    address: "17 FC Road, Pune",
    height: 160,
    weight: 65,
    emergency_contact_name: "Arjun Joshi",
    emergency_contact_phone: "+91 96666 00088",
    patient_type: "family",
    tags: ["High Risk"],
    auth_method: "Email + OTP",
    last_login: "2026-06-30T15:00:00",
    devices: makeDevices(8),
    login_history: makeLoginHistory(8),
    activity_logs: makeActivity("Meera Joshi"),
    medical_conditions: ["Asthma"],
    allergies: ["Pollen"],
    medications: ["Inhaler"],
    family_history: "Sister — asthma",
    vaccinations: ["COVID-19"],
    preferences: { locale: "mr-IN", notifications: "whatsapp" },
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-05-12T08:00:00",
    updated_at: "2026-06-30T16:00:00",
    deleted_at: null,
  },
];

export function getDefaultUserForm(): UserFormData {
  return {
    full_name: "",
    email: "",
    mobile: "",
    gender: "Male",
    dob: "",
    blood_group: "Unknown",
    city: "",
    state: "",
    country: "India",
    address: "",
    height: "",
    weight: "",
    role: "patient",
    status: "pending_verification",
    patient_type: "individual",
    subscription_plan_id: 1,
    assigned_doctor: "",
    tags: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    health_id: "",
  };
}

export function userToForm(u: ManagedUser): UserFormData {
  return {
    full_name: u.full_name,
    email: u.email,
    mobile: u.mobile,
    gender: u.gender,
    dob: u.dob?.slice(0, 10) || "",
    blood_group: u.blood_group,
    city: u.city,
    state: u.state,
    country: u.country,
    address: u.address,
    height: u.height != null ? String(u.height) : "",
    weight: u.weight != null ? String(u.weight) : "",
    role: u.role,
    status: u.status,
    patient_type: u.patient_type,
    subscription_plan_id: u.subscription_plan_id,
    assigned_doctor: u.assigned_doctor || "",
    tags: u.tags.join(", "),
    emergency_contact_name: u.emergency_contact_name,
    emergency_contact_phone: u.emergency_contact_phone,
    health_id: u.health_id,
  };
}

export function getManagedUsers(includeDeleted = false) {
  return managedUsers
    .filter((u) => includeDeleted || !u.deleted_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getManagedUser(id: number) {
  return managedUsers.find((u) => u.id === id && !u.deleted_at) || null;
}

export function getUserStats() {
  const list = getManagedUsers();
  return {
    total: list.length,
    active: list.filter((u) => u.status === "active" || u.status === "trial").length,
    blocked: list.filter((u) => u.status === "blocked" || u.status === "suspended").length,
    pending: list.filter((u) => u.status === "pending_verification").length,
    premium: list.filter((u) => u.verification.premium || u.role === "premium_member").length,
  };
}

function syncMockUser(u: ManagedUser) {
  const existing = mockUsers.find((m) => m.id === u.id);
  const payload = {
    name: u.full_name,
    phone: u.mobile,
    dob: u.dob,
    gender: u.gender,
    email: u.email,
    height: u.height,
    weight: u.weight,
    subscription_status: u.subscription_plan_id === 1 ? "free" : plans.find((p) => p.id === u.subscription_plan_id)?.plan_code || "active",
    is_blocked: u.status === "blocked" ? 1 : 0,
  };
  if (existing) {
    updateUserPersonal(u.id, payload);
  }
}

export function createManagedUser(form: UserFormData, editor: string): ManagedUser {
  const id = nextId++;
  const plan = plans.find((p) => p.id === form.subscription_plan_id) || plans[0];
  const user: ManagedUser = {
    id,
    user_id: `SVU-${1000 + id}`,
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    mobile: form.mobile.trim(),
    health_id: form.health_id.trim() || `HID-${id}`,
    aadhaar_masked: maskAadhaar(String(1000 + (id % 9000))),
    role: form.role,
    status: form.status,
    verification: {
      mobile: !!form.mobile,
      email: !!form.email,
      kyc: false,
      doctor: !!form.assigned_doctor,
      premium: plan.id > 1,
    },
    subscription_plan: plan.plan_name,
    subscription_plan_id: plan.id,
    subscription_expiry: plan.duration_days
      ? new Date(Date.now() + plan.duration_days * 86400000).toISOString().slice(0, 10)
      : null,
    assigned_doctor: form.assigned_doctor || null,
    health_score: null,
    gender: form.gender,
    dob: form.dob,
    blood_group: form.blood_group,
    city: form.city,
    state: form.state,
    country: form.country,
    address: form.address,
    height: form.height ? Number(form.height) : undefined,
    weight: form.weight ? Number(form.weight) : undefined,
    emergency_contact_name: form.emergency_contact_name,
    emergency_contact_phone: form.emergency_contact_phone,
    patient_type: form.patient_type,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    auth_method: "Mobile OTP",
    last_login: null,
    devices: [],
    login_history: [],
    activity_logs: [{ id: 1, type: "signup", message: "Account created by admin", timestamp: new Date().toISOString() }],
    medical_conditions: [],
    allergies: [],
    medications: [],
    family_history: "",
    vaccinations: [],
    preferences: { locale: "en-IN", notifications: "all" },
    created_by: editor,
    updated_by: editor,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  managedUsers = [...managedUsers, user];
  mockAddUser(user.full_name);
  const created = mockUsers[mockUsers.length - 1];
  if (created) {
    created.id = id;
    updateUserPersonal(id, {
      phone: user.mobile,
      dob: user.dob,
      gender: user.gender,
      email: user.email,
      height: user.height,
      weight: user.weight,
      subscription_status: plan.plan_code,
    });
  }
  addUserAudit({ user_id: id, action: "created", changed_by: editor, new_value: user.full_name });
  return user;
}

export function updateManagedUser(id: number, form: UserFormData, editor: string): ManagedUser | null {
  const existing = getManagedUser(id);
  if (!existing) return null;
  const plan = plans.find((p) => p.id === form.subscription_plan_id) || plans[0];
  const updated: ManagedUser = {
    ...existing,
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    mobile: form.mobile.trim(),
    health_id: form.health_id.trim() || existing.health_id,
    gender: form.gender,
    dob: form.dob,
    blood_group: form.blood_group,
    city: form.city,
    state: form.state,
    country: form.country,
    address: form.address,
    height: form.height ? Number(form.height) : undefined,
    weight: form.weight ? Number(form.weight) : undefined,
    role: form.role,
    status: form.status,
    patient_type: form.patient_type,
    subscription_plan: plan.plan_name,
    subscription_plan_id: plan.id,
    assigned_doctor: form.assigned_doctor || null,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    emergency_contact_name: form.emergency_contact_name,
    emergency_contact_phone: form.emergency_contact_phone,
    verification: {
      ...existing.verification,
      mobile: !!form.mobile,
      email: !!form.email,
      doctor: !!form.assigned_doctor,
      premium: plan.id > 1,
    },
    updated_by: editor,
    updated_at: new Date().toISOString(),
  };
  managedUsers = managedUsers.map((u) => (u.id === id ? updated : u));
  syncMockUser(updated);
  addUserAudit({ user_id: id, action: "updated", changed_by: editor, previous_value: existing.full_name, new_value: updated.full_name });
  return updated;
}

export function setUserStatus(id: number, status: AccountStatus, editor: string, reason?: string) {
  const user = getManagedUser(id);
  if (!user) return false;
  managedUsers = managedUsers.map((u) =>
    u.id === id
      ? {
          ...u,
          status,
          updated_by: editor,
          updated_at: new Date().toISOString(),
          deleted_at: status === "deleted" ? new Date().toISOString() : u.deleted_at,
        }
      : u
  );
  const mock = mockUsers.find((m) => m.id === id);
  if (mock) {
    mock.is_blocked = status === "blocked" ? 1 : 0;
  }
  addUserAudit({ user_id: id, action: "status_change", changed_by: editor, previous_value: user.status, new_value: status, reason });
  return true;
}

export function softDeleteManagedUser(id: number, editor: string) {
  const user = getManagedUser(id);
  if (!user) return false;
  managedUsers = managedUsers.map((u) =>
    u.id === id
      ? { ...u, status: "deleted" as AccountStatus, deleted_at: new Date().toISOString(), updated_by: editor, updated_at: new Date().toISOString() }
      : u
  );
  addUserAudit({ user_id: id, action: "soft_delete", changed_by: editor, previous_value: user.status, new_value: "deleted" });
  return true;
}

export function restoreManagedUser(id: number, editor: string) {
  const user = managedUsers.find((u) => u.id === id);
  if (!user || !user.deleted_at) return false;
  managedUsers = managedUsers.map((u) =>
    u.id === id
      ? { ...u, status: "active" as AccountStatus, deleted_at: null, updated_by: editor, updated_at: new Date().toISOString() }
      : u
  );
  addUserAudit({ user_id: id, action: "restored", changed_by: editor, new_value: "active" });
  return true;
}

export function hardDeleteManagedUser(id: number, editor: string) {
  managedUsers = managedUsers.filter((u) => u.id !== id);
  mockDeleteUser(id);
  addUserAudit({ user_id: id, action: "hard_delete", changed_by: editor });
  return true;
}

export function assignPlan(id: number, planId: number, editor: string) {
  const user = getManagedUser(id);
  const plan = plans.find((p) => p.id === planId);
  if (!user || !plan) return false;
  managedUsers = managedUsers.map((u) =>
    u.id === id
      ? {
          ...u,
          subscription_plan: plan.plan_name,
          subscription_plan_id: plan.id,
          subscription_expiry: plan.duration_days
            ? new Date(Date.now() + plan.duration_days * 86400000).toISOString().slice(0, 10)
            : null,
          verification: { ...u.verification, premium: plan.id > 1 },
          role: plan.id > 1 ? ("premium_member" as UserRole) : u.role,
          updated_by: editor,
          updated_at: new Date().toISOString(),
        }
      : u
  );
  const sub = subscriptions.find((s) => s.user_id === id);
  if (sub) updateSubscriptionPlan(sub.id, planId);
  syncMockUser({ ...user, subscription_plan_id: planId, subscription_plan: plan.plan_name, status: user.status });
  addUserAudit({ user_id: id, action: "plan_assign", changed_by: editor, previous_value: user.subscription_plan, new_value: plan.plan_name });
  return true;
}

export function extendSubscription(id: number, days: number, editor: string) {
  const user = getManagedUser(id);
  if (!user) return false;
  const base = user.subscription_expiry ? new Date(user.subscription_expiry) : new Date();
  base.setDate(base.getDate() + days);
  const next = base.toISOString().slice(0, 10);
  managedUsers = managedUsers.map((u) =>
    u.id === id ? { ...u, subscription_expiry: next, updated_by: editor, updated_at: new Date().toISOString() } : u
  );
  addUserAudit({ user_id: id, action: "extend_subscription", changed_by: editor, new_value: `+${days}d → ${next}` });
  return true;
}

export function cancelUserSubscription(id: number, editor: string) {
  const user = getManagedUser(id);
  if (!user) return false;
  assignPlan(id, 1, editor);
  const sub = subscriptions.find((s) => s.user_id === id);
  if (sub) cancelSubscription(sub.id);
  addUserAudit({ user_id: id, action: "cancel_subscription", changed_by: editor, previous_value: user.subscription_plan });
  return true;
}

export function forceLogoutDevice(userId: number, deviceId: string, editor: string) {
  managedUsers = managedUsers.map((u) =>
    u.id === userId
      ? {
          ...u,
          devices: u.devices.map((d) => (d.id === deviceId ? { ...d, is_active: false } : d)),
          updated_by: editor,
          updated_at: new Date().toISOString(),
        }
      : u
  );
  addUserAudit({ user_id: userId, action: "force_logout_device", changed_by: editor, new_value: deviceId });
  return true;
}

export function removeDevice(userId: number, deviceId: string, editor: string) {
  managedUsers = managedUsers.map((u) =>
    u.id === userId
      ? {
          ...u,
          devices: u.devices.filter((d) => d.id !== deviceId),
          updated_by: editor,
          updated_at: new Date().toISOString(),
        }
      : u
  );
  addUserAudit({ user_id: userId, action: "remove_device", changed_by: editor, new_value: deviceId });
  return true;
}

export function bulkSetStatus(ids: number[], status: AccountStatus, editor: string) {
  ids.forEach((id) => setUserStatus(id, status, editor, "Bulk action"));
  return true;
}

export function bulkAssignPlan(ids: number[], planId: number, editor: string) {
  ids.forEach((id) => assignPlan(id, planId, editor));
  return true;
}

export function bulkAssignDoctor(ids: number[], doctor: string, editor: string) {
  managedUsers = managedUsers.map((u) =>
    ids.includes(u.id)
      ? {
          ...u,
          assigned_doctor: doctor === "Unassigned" ? null : doctor,
          verification: { ...u.verification, doctor: doctor !== "Unassigned" },
          updated_by: editor,
          updated_at: new Date().toISOString(),
        }
      : u
  );
  addUserAudit({ user_id: ids[0] || 0, action: "bulk_assign_doctor", changed_by: editor, new_value: `${doctor} → ${ids.length} users` });
  return true;
}

export function bulkAddTags(ids: number[], tags: string[], editor: string) {
  managedUsers = managedUsers.map((u) =>
    ids.includes(u.id)
      ? {
          ...u,
          tags: Array.from(new Set([...u.tags, ...tags])),
          updated_by: editor,
          updated_at: new Date().toISOString(),
        }
      : u
  );
  addUserAudit({ user_id: ids[0] || 0, action: "bulk_tags", changed_by: editor, new_value: tags.join(", ") });
  return true;
}

export function calcAgeGroup(dob: string): string {
  if (!dob) return "unknown";
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  if (age < 18) return "0-17";
  if (age <= 30) return "18-30";
  if (age <= 45) return "31-45";
  if (age <= 60) return "46-60";
  return "60+";
}

export function statusBadgeVariant(status: AccountStatus): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  const map: Record<AccountStatus, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
    active: "success",
    inactive: "default",
    suspended: "warning",
    blocked: "danger",
    pending_verification: "info",
    deleted: "danger",
    trial: "purple",
  };
  return map[status];
}

export function exportUsersCsv(list: ManagedUser[]) {
  const headers = [
    "user_id", "full_name", "email", "mobile", "status", "plan", "city", "state", "gender", "dob", "doctor", "tags", "created_at",
  ];
  const rows = list.map((u) =>
    [u.user_id, u.full_name, u.email, u.mobile, u.status, u.subscription_plan, u.city, u.state, u.gender, u.dob, u.assigned_doctor || "", u.tags.join("|"), u.created_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

// Keep mock status helpers aligned for dashboard
void statusFromMock;
void planFromMock;
