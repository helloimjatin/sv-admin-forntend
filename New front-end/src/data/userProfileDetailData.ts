export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "rescheduled";

export type UserAppointment = {
  id: number;
  doctor: string;
  type: string;
  datetime: string;
  status: AppointmentStatus;
  payment_status: string;
  notes?: string;
};

export type UserPrescription = {
  id: number;
  medicine: string;
  dosage: string;
  prescribed_by: string;
  issued_at: string;
  expires_at: string;
  status: "active" | "expired" | "completed";
};

export type LabReportDetail = {
  id: number;
  title: string;
  uploaded_at: string;
  ai_summary: string;
  doctor_review: string;
  risk: string;
  status: string;
};

export type AiChatSession = {
  id: number;
  title: string;
  started_at: string;
  messages: number;
  tokens: number;
  topics: string[];
  insight: string;
  saved: boolean;
};

export type UserNotificationItem = {
  id: number;
  channel: "push" | "email" | "sms" | "whatsapp";
  title: string;
  body: string;
  sent_at: string;
  delivery: "delivered" | "failed" | "pending";
  read: boolean;
};

export type SecurityEvent = {
  id: number;
  type: "login" | "failed_login" | "otp" | "password_change" | "mfa" | "session";
  detail: string;
  timestamp: string;
  ip?: string;
};

export type CareTeamMember = {
  name: string;
  role: string;
};

export type UserProfileExtras = {
  user_id: number;
  profile_completion: number;
  preferred_language: string;
  timezone: string;
  last_active: string | null;
  occupation: string;
  insurance: {
    provider: string;
    policy_number: string;
    valid_till: string;
  };
  care_team: CareTeamMember[];
  last_consultation: string | null;
  upcoming_appointment: string | null;
  health_goals: string[];
  risk_factors: string[];
  lifestyle: { smoking: string; alcohol: string; exercise: string };
  ai_usage: { total_chats: number; tokens_used: number; recommendations: string[] };
  usage_summary: {
    appointments: number;
    prescriptions: number;
    reports: number;
    login_count: number;
  };
  mfa_enabled: boolean;
  appointments: UserAppointment[];
  prescriptions: UserPrescription[];
  lab_reports: LabReportDetail[];
  ai_sessions: AiChatSession[];
  notifications: UserNotificationItem[];
  security_events: SecurityEvent[];
};

const defaultExtras = (userId: number, name: string): UserProfileExtras => ({
  user_id: userId,
  profile_completion: 72,
  preferred_language: "en-IN",
  timezone: "Asia/Kolkata",
  last_active: "2026-07-09T18:40:00",
  occupation: "Professional",
  insurance: {
    provider: "Star Health",
    policy_number: "SH-****-8821",
    valid_till: "2027-03-31",
  },
  care_team: [
    { name: "Dr. Mehta", role: "Primary Physician" },
    { name: "Nurse Priya", role: "Care Coordinator" },
  ],
  last_consultation: "2026-06-28T11:00:00",
  upcoming_appointment: "2026-07-15T16:30:00",
  health_goals: ["Reduce BP", "Walk 8k steps/day", "Improve sleep"],
  risk_factors: ["Family history of diabetes"],
  lifestyle: { smoking: "Never", alcohol: "Occasional", exercise: "3x / week" },
  ai_usage: {
    total_chats: 24,
    tokens_used: 18420,
    recommendations: ["Schedule lipid panel", "Increase hydration", "Review BP readings weekly"],
  },
  usage_summary: {
    appointments: 6,
    prescriptions: 3,
    reports: 4,
    login_count: 48,
  },
  mfa_enabled: false,
  appointments: [
    {
      id: 1,
      doctor: "Dr. Mehta",
      type: "Video Consultation",
      datetime: "2026-07-15T16:30:00",
      status: "upcoming",
      payment_status: "paid",
      notes: "Follow-up for BP",
    },
    {
      id: 2,
      doctor: "Dr. Kapoor",
      type: "In-clinic",
      datetime: "2026-06-28T11:00:00",
      status: "completed",
      payment_status: "paid",
    },
    {
      id: 3,
      doctor: "Dr. Nair",
      type: "Video Consultation",
      datetime: "2026-06-10T09:00:00",
      status: "cancelled",
      payment_status: "refunded",
    },
    {
      id: 4,
      doctor: "Dr. Mehta",
      type: "Phone",
      datetime: "2026-05-20T14:00:00",
      status: "rescheduled",
      payment_status: "paid",
    },
  ],
  prescriptions: [
    {
      id: 1,
      medicine: "Amlodipine 5mg",
      dosage: "1 tablet daily",
      prescribed_by: "Dr. Mehta",
      issued_at: "2026-06-28",
      expires_at: "2026-09-28",
      status: "active",
    },
    {
      id: 2,
      medicine: "Vitamin D3 60k",
      dosage: "Weekly",
      prescribed_by: "Dr. Kapoor",
      issued_at: "2026-04-01",
      expires_at: "2026-06-01",
      status: "expired",
    },
    {
      id: 3,
      medicine: "Paracetamol 650",
      dosage: "SOS",
      prescribed_by: "Dr. Mehta",
      issued_at: "2026-03-12",
      expires_at: "2026-04-12",
      status: "completed",
    },
  ],
  lab_reports: [
    {
      id: 1,
      title: "Complete Blood Count",
      uploaded_at: "2026-07-06T14:20:00",
      ai_summary: "Mild anemia indicators; hemoglobin slightly below range.",
      doctor_review: "Recommend iron-rich diet; recheck in 6 weeks.",
      risk: "medium",
      status: "reviewed",
    },
    {
      id: 2,
      title: "Lipid Profile",
      uploaded_at: "2026-05-18T10:00:00",
      ai_summary: "LDL elevated; HDL within normal limits.",
      doctor_review: "Lifestyle counseling advised.",
      risk: "medium",
      status: "reviewed",
    },
    {
      id: 3,
      title: "Blood Pressure Log",
      uploaded_at: "2026-07-01T08:00:00",
      ai_summary: "Average readings trending downward this month.",
      doctor_review: "Continue current medication.",
      risk: "normal",
      status: "ai_analyzed",
    },
  ],
  ai_sessions: [
    {
      id: 1,
      title: "BP management tips",
      started_at: "2026-07-09T18:35:00",
      messages: 12,
      tokens: 1840,
      topics: ["Blood pressure", "Diet", "Exercise"],
      insight: "User frequently asks about salt intake and evening walks.",
      saved: true,
    },
    {
      id: 2,
      title: "Lab report explanation",
      started_at: "2026-07-06T15:00:00",
      messages: 8,
      tokens: 1220,
      topics: ["CBC", "Anemia"],
      insight: "Recommended follow-up with primary doctor.",
      saved: false,
    },
    {
      id: 3,
      title: "Sleep quality",
      started_at: "2026-06-20T21:10:00",
      messages: 6,
      tokens: 900,
      topics: ["Sleep", "Stress"],
      insight: "Suggest consistent bedtime routine.",
      saved: true,
    },
  ],
  notifications: [
    {
      id: 1,
      channel: "push",
      title: "Appointment reminder",
      body: `Hi ${name}, your consultation is tomorrow at 4:30 PM.`,
      sent_at: "2026-07-14T09:00:00",
      delivery: "delivered",
      read: true,
    },
    {
      id: 2,
      channel: "email",
      title: "Lab report ready",
      body: "Your CBC report analysis is available.",
      sent_at: "2026-07-06T16:00:00",
      delivery: "delivered",
      read: true,
    },
    {
      id: 3,
      channel: "sms",
      title: "OTP login",
      body: "Your SehatVaani OTP is ****12",
      sent_at: "2026-07-09T18:18:00",
      delivery: "delivered",
      read: true,
    },
    {
      id: 4,
      channel: "whatsapp",
      title: "Medicine reminder",
      body: "Time to take Amlodipine 5mg.",
      sent_at: "2026-07-09T08:00:00",
      delivery: "pending",
      read: false,
    },
  ],
  security_events: [
    { id: 1, type: "login", detail: "Successful login via Mobile OTP", timestamp: "2026-07-09T18:20:00", ip: "103.21.244.12" },
    { id: 2, type: "failed_login", detail: "Invalid OTP attempt", timestamp: "2026-07-01T22:05:00", ip: "49.36.12.8" },
    { id: 3, type: "otp", detail: "OTP sent to mobile", timestamp: "2026-07-09T18:18:00" },
    { id: 4, type: "password_change", detail: "Password changed by user", timestamp: "2026-05-02T12:00:00" },
    { id: 5, type: "session", detail: "New web session created", timestamp: "2026-07-08T10:00:00", ip: "103.21.244.12" },
    { id: 6, type: "mfa", detail: "MFA currently disabled", timestamp: "2026-01-01T00:00:00" },
  ],
});

export let userProfileExtras: Record<number, UserProfileExtras> = {
  1: {
    ...defaultExtras(1, "Rahul"),
    profile_completion: 92,
    mfa_enabled: true,
    occupation: "Software Engineer",
  },
  2: {
    ...defaultExtras(2, "Priya"),
    profile_completion: 80,
    care_team: [{ name: "Dr. Kapoor", role: "Primary Physician" }],
    upcoming_appointment: "2026-07-18T10:00:00",
  },
  3: {
    ...defaultExtras(3, "Amit"),
    profile_completion: 55,
    last_active: "2026-06-20T16:10:00",
    upcoming_appointment: null,
    mfa_enabled: false,
    risk_factors: ["Fatty liver", "Sedentary lifestyle"],
  },
  4: {
    ...defaultExtras(4, "Sneha"),
    profile_completion: 68,
    occupation: "Designer",
    last_active: "2026-07-10T08:05:00",
  },
  5: {
    ...defaultExtras(5, "Vikram"),
    profile_completion: 74,
    last_active: "2026-01-15T11:05:00",
    upcoming_appointment: null,
    health_goals: ["Control blood sugar", "Lose 5kg"],
  },
  6: {
    ...defaultExtras(6, "Ananya"),
    profile_completion: 88,
    mfa_enabled: true,
    occupation: "Product Manager",
    ai_usage: { total_chats: 67, tokens_used: 42100, recommendations: ["Annual checkup due", "Maintain current fitness routine"] },
  },
  7: {
    ...defaultExtras(7, "Farhan"),
    profile_completion: 28,
    last_active: null,
    upcoming_appointment: null,
    last_consultation: null,
    appointments: [],
    prescriptions: [],
    lab_reports: [],
    ai_sessions: [],
    notifications: [],
    security_events: [
      { id: 1, type: "login", detail: "Account created", timestamp: "2026-07-09T10:00:00" },
    ],
    usage_summary: { appointments: 0, prescriptions: 0, reports: 0, login_count: 0 },
    ai_usage: { total_chats: 0, tokens_used: 0, recommendations: [] },
  },
  8: {
    ...defaultExtras(8, "Meera"),
    profile_completion: 70,
    occupation: "Teacher",
    risk_factors: ["Asthma"],
  },
};

export function getUserProfileExtras(userId: number): UserProfileExtras {
  if (!userProfileExtras[userId]) {
    userProfileExtras[userId] = defaultExtras(userId, "User");
  }
  return userProfileExtras[userId];
}

export function updateAppointmentStatus(userId: number, appointmentId: number, status: AppointmentStatus) {
  const extras = getUserProfileExtras(userId);
  extras.appointments = extras.appointments.map((a) => (a.id === appointmentId ? { ...a, status } : a));
  userProfileExtras[userId] = { ...extras };
  return true;
}

export function scheduleAppointment(
  userId: number,
  data: Omit<UserAppointment, "id" | "status"> & { status?: AppointmentStatus }
) {
  const extras = getUserProfileExtras(userId);
  const id = Math.max(0, ...extras.appointments.map((a) => a.id)) + 1;
  extras.appointments = [
    { id, status: data.status || "upcoming", doctor: data.doctor, type: data.type, datetime: data.datetime, payment_status: data.payment_status, notes: data.notes },
    ...extras.appointments,
  ];
  extras.upcoming_appointment = data.datetime;
  extras.usage_summary.appointments += 1;
  userProfileExtras[userId] = { ...extras };
  return id;
}

export function deleteUserNotification(userId: number, notificationId: number) {
  const extras = getUserProfileExtras(userId);
  extras.notifications = extras.notifications.filter((n) => n.id !== notificationId);
  userProfileExtras[userId] = { ...extras };
}

export function addUserNotification(
  userId: number,
  item: Omit<UserNotificationItem, "id" | "sent_at" | "delivery" | "read">
) {
  const extras = getUserProfileExtras(userId);
  const id = Math.max(0, ...extras.notifications.map((n) => n.id)) + 1;
  extras.notifications = [
    {
      id,
      ...item,
      sent_at: new Date().toISOString(),
      delivery: "pending",
      read: false,
    },
    ...extras.notifications,
  ];
  userProfileExtras[userId] = { ...extras };
  return id;
}

export function resendUserNotification(userId: number, notificationId: number) {
  const extras = getUserProfileExtras(userId);
  extras.notifications = extras.notifications.map((n) =>
    n.id === notificationId ? { ...n, delivery: "delivered", sent_at: new Date().toISOString() } : n
  );
  userProfileExtras[userId] = { ...extras };
}

export function setMfaEnabled(userId: number, enabled: boolean) {
  const extras = getUserProfileExtras(userId);
  extras.mfa_enabled = enabled;
  extras.security_events = [
    {
      id: Math.max(0, ...extras.security_events.map((e) => e.id)) + 1,
      type: "mfa",
      detail: enabled ? "MFA enabled by admin" : "MFA disabled by admin",
      timestamp: new Date().toISOString(),
    },
    ...extras.security_events,
  ];
  userProfileExtras[userId] = { ...extras };
}

export function forceLogoutAllSessions(userId: number) {
  const extras = getUserProfileExtras(userId);
  extras.security_events = [
    {
      id: Math.max(0, ...extras.security_events.map((e) => e.id)) + 1,
      type: "session",
      detail: "All sessions revoked by admin",
      timestamp: new Date().toISOString(),
    },
    ...extras.security_events,
  ];
  userProfileExtras[userId] = { ...extras };
}
