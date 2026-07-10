export type BillingCycle =
  | "free"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "yearly"
  | "lifetime"
  | "custom";

export type PlanStatus = "active" | "draft" | "hidden" | "archived" | "disabled";

export type PlanBadge = "none" | "recommended" | "popular" | "best_value" | "new";

export type PlanVisibility = "public" | "invite_only" | "internal";

export type FeatureCategory =
  | "ai"
  | "consultations"
  | "health"
  | "family"
  | "premium"
  | "support"
  | "custom";

export type PlanFeatureDef = {
  key: string;
  label: string;
  category: FeatureCategory;
};

export type PlanFeatureValue = {
  key: string;
  enabled: boolean;
  value?: string | number | boolean;
  customLabel?: string;
};

export type PlanLimits = {
  max_devices: number;
  max_family_members: number;
  daily_ai_requests: number;
  monthly_ai_requests: number;
  consultation_credits: number;
  storage_limit_mb: number;
  report_upload_limit: number;
  appointment_limit: number;
  ai_credits: number;
};

export type PlanPricing = {
  price: number;
  discounted_price: number | null;
  currency: string;
  billing_cycle: BillingCycle;
  trial_days: number;
  setup_fee: number;
  renewal_price: number | null;
  tax_inclusive: boolean;
  tax_percent: number;
  custom_cycle_days?: number;
};

export type PlanVisibilitySettings = {
  visibility: PlanVisibility;
  regions: string[];
  platforms: ("android" | "ios" | "web")[];
};

export type PlanSubscriptionRules = {
  auto_renewal: boolean;
  grace_period_days: number;
  allow_upgrade: boolean;
  allow_downgrade: boolean;
  cancellation_policy: string;
  refund_eligible: boolean;
  prorate_upgrades: boolean;
  prorate_downgrades: boolean;
};

export type PlanRecommendation = {
  is_recommended: boolean;
  is_featured: boolean;
  is_popular: boolean;
  display_priority: number;
  badge: PlanBadge;
};

export type PlanAnalytics = {
  active_subscribers: number;
  new_subscribers: number;
  revenue: number;
  renewal_rate: number;
  churn_rate: number;
  conversion_rate: number;
  avg_duration_days: number;
  most_used_features: { feature: string; usage: number }[];
  monthly_growth: number;
};

export type PlanAuditLog = {
  id: number;
  plan_id: number;
  action: string;
  changed_by: string;
  previous_value?: string;
  new_value?: string;
  reason?: string;
  timestamp: string;
};

export type SubscriptionPlan = {
  id: number;
  plan_id: string;
  name: string;
  slug: string;
  internal_code: string;
  description: string;
  icon: string;
  display_color: string;
  status: PlanStatus;
  rank: number;
  pricing: PlanPricing;
  limits: PlanLimits;
  features: PlanFeatureValue[];
  visibility: PlanVisibilitySettings;
  rules: PlanSubscriptionRules;
  recommendation: PlanRecommendation;
  analytics: PlanAnalytics;
  version: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PlanFormData = {
  name: string;
  slug: string;
  internal_code: string;
  description: string;
  icon: string;
  display_color: string;
  status: PlanStatus;
  pricing: PlanPricing;
  limits: PlanLimits;
  features: PlanFeatureValue[];
  visibility: PlanVisibilitySettings;
  rules: PlanSubscriptionRules;
  recommendation: PlanRecommendation;
};

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half-Yearly" },
  { value: "yearly", label: "Yearly" },
  { value: "lifetime", label: "Lifetime" },
  { value: "custom", label: "Custom" },
];

export const PLAN_STATUSES: { value: PlanStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "hidden", label: "Hidden" },
  { value: "archived", label: "Archived" },
  { value: "disabled", label: "Disabled" },
];

export const PLAN_BADGES: { value: PlanBadge; label: string }[] = [
  { value: "none", label: "None" },
  { value: "recommended", label: "Recommended" },
  { value: "popular", label: "Popular" },
  { value: "best_value", label: "Best Value" },
  { value: "new", label: "New" },
];

export const VISIBILITY_OPTIONS: { value: PlanVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "invite_only", label: "Invite Only" },
  { value: "internal", label: "Internal" },
];

export const DISPLAY_COLORS = [
  { value: "primary", label: "Primary" },
  { value: "teal", label: "Teal" },
  { value: "sky", label: "Sky" },
  { value: "amber", label: "Amber" },
  { value: "violet", label: "Violet" },
  { value: "green", label: "Green" },
];

export const REGION_OPTIONS = ["IN", "US", "AE", "SG", "GB", "Global"];

export const FEATURE_CATALOG: PlanFeatureDef[] = [
  { key: "unlimited_ai", label: "Unlimited AI Health Assistant", category: "ai" },
  { key: "doctor_credits", label: "Doctor Consultation Credits", category: "consultations" },
  { key: "video_consultation", label: "Video Consultation", category: "consultations" },
  { key: "appointment_booking", label: "Appointment Booking", category: "consultations" },
  { key: "digital_prescriptions", label: "Digital Prescriptions", category: "health" },
  { key: "health_reports", label: "Health Reports", category: "health" },
  { key: "lab_report_analysis", label: "Lab Report Analysis", category: "health" },
  { key: "medicine_reminder", label: "Medicine Reminder", category: "health" },
  { key: "health_tracking", label: "Health Tracking", category: "health" },
  { key: "premium_content", label: "Premium Content", category: "premium" },
  { key: "family_access", label: "Family Member Access", category: "family" },
  { key: "priority_support", label: "Priority Support", category: "support" },
  { key: "wearable_integration", label: "Wearable Integration", category: "health" },
  { key: "cloud_backup", label: "Cloud Backup", category: "premium" },
  { key: "emergency_sos", label: "Emergency SOS", category: "support" },
  { key: "advanced_analytics", label: "Advanced Analytics", category: "premium" },
  { key: "personalized_insights", label: "Personalized Health Insights", category: "ai" },
  { key: "diet_plans", label: "Diet Plans", category: "health" },
  { key: "mental_wellness", label: "Mental Wellness Programs", category: "health" },
  { key: "exclusive_features", label: "Exclusive Features", category: "premium" },
];

export const FEATURE_CATEGORY_LABELS: Record<FeatureCategory, string> = {
  ai: "AI & Insights",
  consultations: "Consultations",
  health: "Health & Tracking",
  family: "Family",
  premium: "Premium",
  support: "Support",
  custom: "Custom",
};

let nextId = 10;
let nextAuditId = 1;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function defaultFeatures(enabledKeys: string[]): PlanFeatureValue[] {
  return FEATURE_CATALOG.map((f) => ({
    key: f.key,
    enabled: enabledKeys.includes(f.key),
  }));
}

function emptyAnalytics(partial?: Partial<PlanAnalytics>): PlanAnalytics {
  return {
    active_subscribers: 0,
    new_subscribers: 0,
    revenue: 0,
    renewal_rate: 0,
    churn_rate: 0,
    conversion_rate: 0,
    avg_duration_days: 0,
    most_used_features: [],
    monthly_growth: 0,
    ...partial,
  };
}

export function getDefaultPlanForm(): PlanFormData {
  return {
    name: "",
    slug: "",
    internal_code: "",
    description: "",
    icon: "workspace_premium",
    display_color: "primary",
    status: "draft",
    pricing: {
      price: 0,
      discounted_price: null,
      currency: "INR",
      billing_cycle: "monthly",
      trial_days: 0,
      setup_fee: 0,
      renewal_price: null,
      tax_inclusive: true,
      tax_percent: 18,
    },
    limits: {
      max_devices: 1,
      max_family_members: 1,
      daily_ai_requests: 10,
      monthly_ai_requests: 100,
      consultation_credits: 0,
      storage_limit_mb: 100,
      report_upload_limit: 5,
      appointment_limit: 2,
      ai_credits: 50,
    },
    features: defaultFeatures([]),
    visibility: {
      visibility: "public",
      regions: ["IN"],
      platforms: ["android", "ios", "web"],
    },
    rules: {
      auto_renewal: true,
      grace_period_days: 3,
      allow_upgrade: true,
      allow_downgrade: true,
      cancellation_policy: "Cancel anytime before renewal. No refunds after trial.",
      refund_eligible: false,
      prorate_upgrades: true,
      prorate_downgrades: false,
    },
    recommendation: {
      is_recommended: false,
      is_featured: false,
      is_popular: false,
      display_priority: 0,
      badge: "none",
    },
  };
}

export function planToForm(plan: SubscriptionPlan): PlanFormData {
  return {
    name: plan.name,
    slug: plan.slug,
    internal_code: plan.internal_code,
    description: plan.description,
    icon: plan.icon,
    display_color: plan.display_color,
    status: plan.status,
    pricing: { ...plan.pricing },
    limits: { ...plan.limits },
    features: plan.features.map((f) => ({ ...f })),
    visibility: {
      ...plan.visibility,
      regions: [...plan.visibility.regions],
      platforms: [...plan.visibility.platforms],
    },
    rules: { ...plan.rules },
    recommendation: { ...plan.recommendation },
  };
}

export let planAuditLogs: PlanAuditLog[] = [];

export function addPlanAudit(entry: Omit<PlanAuditLog, "id" | "timestamp">) {
  planAuditLogs = [
    {
      ...entry,
      id: nextAuditId++,
      timestamp: new Date().toISOString(),
    },
    ...planAuditLogs,
  ].slice(0, 200);
}

export let subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    plan_id: "PLN-FREE",
    name: "Free",
    slug: "free",
    internal_code: "SV_FREE",
    description: "Essential health tools to get started with SehatVaani.",
    icon: "favorite",
    display_color: "green",
    status: "active",
    rank: 1,
    pricing: {
      price: 0,
      discounted_price: null,
      currency: "INR",
      billing_cycle: "free",
      trial_days: 0,
      setup_fee: 0,
      renewal_price: null,
      tax_inclusive: true,
      tax_percent: 0,
    },
    limits: {
      max_devices: 1,
      max_family_members: 1,
      daily_ai_requests: 5,
      monthly_ai_requests: 50,
      consultation_credits: 0,
      storage_limit_mb: 50,
      report_upload_limit: 5,
      appointment_limit: 1,
      ai_credits: 25,
    },
    features: defaultFeatures(["medicine_reminder", "health_tracking", "health_reports"]),
    visibility: { visibility: "public", regions: ["IN", "Global"], platforms: ["android", "ios", "web"] },
    rules: {
      auto_renewal: false,
      grace_period_days: 0,
      allow_upgrade: true,
      allow_downgrade: false,
      cancellation_policy: "Free plan has no cancellation.",
      refund_eligible: false,
      prorate_upgrades: true,
      prorate_downgrades: false,
    },
    recommendation: {
      is_recommended: false,
      is_featured: false,
      is_popular: false,
      display_priority: 10,
      badge: "none",
    },
    analytics: emptyAnalytics({
      active_subscribers: 1840,
      new_subscribers: 120,
      revenue: 0,
      renewal_rate: 0,
      churn_rate: 8.2,
      conversion_rate: 12.5,
      avg_duration_days: 45,
      most_used_features: [
        { feature: "Health Tracking", usage: 78 },
        { feature: "Medicine Reminder", usage: 65 },
      ],
      monthly_growth: 4.2,
    }),
    version: 1,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-01-01T10:00:00",
    updated_at: "2026-06-01T12:00:00",
    deleted_at: null,
  },
  {
    id: 2,
    plan_id: "PLN-PRO-M",
    name: "Pro Monthly",
    slug: "pro-monthly",
    internal_code: "SV_PRO_M",
    description: "Full AI assistant, consultations, and premium health insights billed monthly.",
    icon: "workspace_premium",
    display_color: "primary",
    status: "active",
    rank: 2,
    pricing: {
      price: 399,
      discounted_price: 299,
      currency: "INR",
      billing_cycle: "monthly",
      trial_days: 7,
      setup_fee: 0,
      renewal_price: 299,
      tax_inclusive: true,
      tax_percent: 18,
    },
    limits: {
      max_devices: 3,
      max_family_members: 5,
      daily_ai_requests: 50,
      monthly_ai_requests: 500,
      consultation_credits: 4,
      storage_limit_mb: 1024,
      report_upload_limit: 50,
      appointment_limit: 8,
      ai_credits: 500,
    },
    features: defaultFeatures([
      "unlimited_ai",
      "doctor_credits",
      "video_consultation",
      "appointment_booking",
      "digital_prescriptions",
      "health_reports",
      "lab_report_analysis",
      "medicine_reminder",
      "health_tracking",
      "premium_content",
      "family_access",
      "personalized_insights",
      "cloud_backup",
    ]),
    visibility: { visibility: "public", regions: ["IN"], platforms: ["android", "ios", "web"] },
    rules: {
      auto_renewal: true,
      grace_period_days: 3,
      allow_upgrade: true,
      allow_downgrade: true,
      cancellation_policy: "Cancel anytime. Access continues until period end.",
      refund_eligible: true,
      prorate_upgrades: true,
      prorate_downgrades: false,
    },
    recommendation: {
      is_recommended: true,
      is_featured: true,
      is_popular: true,
      display_priority: 100,
      badge: "recommended",
    },
    analytics: emptyAnalytics({
      active_subscribers: 312,
      new_subscribers: 48,
      revenue: 93300,
      renewal_rate: 82.4,
      churn_rate: 4.1,
      conversion_rate: 18.6,
      avg_duration_days: 210,
      most_used_features: [
        { feature: "AI Health Assistant", usage: 92 },
        { feature: "Lab Report Analysis", usage: 71 },
        { feature: "Video Consultation", usage: 54 },
      ],
      monthly_growth: 9.8,
    }),
    version: 3,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-02-15T09:00:00",
    updated_at: "2026-07-01T11:30:00",
    deleted_at: null,
  },
  {
    id: 3,
    plan_id: "PLN-PRO-Y",
    name: "Pro Yearly",
    slug: "pro-yearly",
    internal_code: "SV_PRO_Y",
    description: "Best value annual Pro plan with extra AI credits and priority support.",
    icon: "diamond",
    display_color: "amber",
    status: "active",
    rank: 3,
    pricing: {
      price: 3599,
      discounted_price: 2499,
      currency: "INR",
      billing_cycle: "yearly",
      trial_days: 14,
      setup_fee: 0,
      renewal_price: 2499,
      tax_inclusive: true,
      tax_percent: 18,
    },
    limits: {
      max_devices: 5,
      max_family_members: 8,
      daily_ai_requests: 100,
      monthly_ai_requests: 1500,
      consultation_credits: 24,
      storage_limit_mb: 5120,
      report_upload_limit: 200,
      appointment_limit: 36,
      ai_credits: 2000,
    },
    features: defaultFeatures([
      "unlimited_ai",
      "doctor_credits",
      "video_consultation",
      "appointment_booking",
      "digital_prescriptions",
      "health_reports",
      "lab_report_analysis",
      "medicine_reminder",
      "health_tracking",
      "premium_content",
      "family_access",
      "priority_support",
      "wearable_integration",
      "cloud_backup",
      "emergency_sos",
      "advanced_analytics",
      "personalized_insights",
      "diet_plans",
      "mental_wellness",
      "exclusive_features",
    ]),
    visibility: { visibility: "public", regions: ["IN", "AE", "SG"], platforms: ["android", "ios", "web"] },
    rules: {
      auto_renewal: true,
      grace_period_days: 7,
      allow_upgrade: true,
      allow_downgrade: true,
      cancellation_policy: "Annual plans refundable within 14 days of purchase.",
      refund_eligible: true,
      prorate_upgrades: true,
      prorate_downgrades: true,
    },
    recommendation: {
      is_recommended: false,
      is_featured: true,
      is_popular: false,
      display_priority: 90,
      badge: "best_value",
    },
    analytics: emptyAnalytics({
      active_subscribers: 98,
      new_subscribers: 14,
      revenue: 244902,
      renewal_rate: 91.2,
      churn_rate: 2.3,
      conversion_rate: 11.4,
      avg_duration_days: 380,
      most_used_features: [
        { feature: "Priority Support", usage: 88 },
        { feature: "Wearable Integration", usage: 62 },
      ],
      monthly_growth: 6.1,
    }),
    version: 2,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-03-01T10:00:00",
    updated_at: "2026-06-20T16:00:00",
    deleted_at: null,
  },
  {
    id: 4,
    plan_id: "PLN-FAM",
    name: "Family Plus",
    slug: "family-plus",
    internal_code: "SV_FAM",
    description: "Share SehatVaani with your family — more devices, members, and consultations.",
    icon: "family_restroom",
    display_color: "violet",
    status: "active",
    rank: 4,
    pricing: {
      price: 599,
      discounted_price: 499,
      currency: "INR",
      billing_cycle: "monthly",
      trial_days: 7,
      setup_fee: 0,
      renewal_price: 499,
      tax_inclusive: true,
      tax_percent: 18,
    },
    limits: {
      max_devices: 6,
      max_family_members: 10,
      daily_ai_requests: 80,
      monthly_ai_requests: 800,
      consultation_credits: 8,
      storage_limit_mb: 2048,
      report_upload_limit: 100,
      appointment_limit: 16,
      ai_credits: 800,
    },
    features: defaultFeatures([
      "unlimited_ai",
      "doctor_credits",
      "video_consultation",
      "appointment_booking",
      "digital_prescriptions",
      "health_reports",
      "lab_report_analysis",
      "medicine_reminder",
      "health_tracking",
      "family_access",
      "priority_support",
      "emergency_sos",
      "personalized_insights",
      "diet_plans",
      "cloud_backup",
    ]),
    visibility: { visibility: "public", regions: ["IN"], platforms: ["android", "ios", "web"] },
    rules: {
      auto_renewal: true,
      grace_period_days: 5,
      allow_upgrade: true,
      allow_downgrade: true,
      cancellation_policy: "Family plan can be cancelled anytime.",
      refund_eligible: true,
      prorate_upgrades: true,
      prorate_downgrades: false,
    },
    recommendation: {
      is_recommended: false,
      is_featured: false,
      is_popular: true,
      display_priority: 80,
      badge: "popular",
    },
    analytics: emptyAnalytics({
      active_subscribers: 76,
      new_subscribers: 11,
      revenue: 37924,
      renewal_rate: 79.5,
      churn_rate: 5.0,
      conversion_rate: 9.2,
      avg_duration_days: 165,
      most_used_features: [
        { feature: "Family Member Access", usage: 95 },
        { feature: "Emergency SOS", usage: 40 },
      ],
      monthly_growth: 7.4,
    }),
    version: 2,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2025-04-10T08:00:00",
    updated_at: "2026-07-05T09:15:00",
    deleted_at: null,
  },
  {
    id: 5,
    plan_id: "PLN-LIFE",
    name: "Lifetime Care",
    slug: "lifetime-care",
    internal_code: "SV_LIFE",
    description: "One-time payment for lifetime Pro access. Limited invite-only release.",
    icon: "all_inclusive",
    display_color: "sky",
    status: "hidden",
    rank: 5,
    pricing: {
      price: 14999,
      discounted_price: 9999,
      currency: "INR",
      billing_cycle: "lifetime",
      trial_days: 0,
      setup_fee: 0,
      renewal_price: null,
      tax_inclusive: true,
      tax_percent: 18,
    },
    limits: {
      max_devices: 8,
      max_family_members: 12,
      daily_ai_requests: 200,
      monthly_ai_requests: 5000,
      consultation_credits: 48,
      storage_limit_mb: 10240,
      report_upload_limit: 500,
      appointment_limit: 100,
      ai_credits: 10000,
    },
    features: defaultFeatures(FEATURE_CATALOG.map((f) => f.key)),
    visibility: { visibility: "invite_only", regions: ["IN"], platforms: ["android", "ios", "web"] },
    rules: {
      auto_renewal: false,
      grace_period_days: 0,
      allow_upgrade: false,
      allow_downgrade: false,
      cancellation_policy: "Lifetime plans are non-refundable after 7 days.",
      refund_eligible: true,
      prorate_upgrades: false,
      prorate_downgrades: false,
    },
    recommendation: {
      is_recommended: false,
      is_featured: false,
      is_popular: false,
      display_priority: 50,
      badge: "new",
    },
    analytics: emptyAnalytics({
      active_subscribers: 12,
      new_subscribers: 2,
      revenue: 119988,
      renewal_rate: 100,
      churn_rate: 0,
      conversion_rate: 3.1,
      avg_duration_days: 400,
      most_used_features: [{ feature: "Exclusive Features", usage: 70 }],
      monthly_growth: 2.0,
    }),
    version: 1,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-01T10:00:00",
    updated_at: "2026-06-15T14:00:00",
    deleted_at: null,
  },
  {
    id: 6,
    plan_id: "PLN-DRAFT",
    name: "Student Care",
    slug: "student-care",
    internal_code: "SV_STU",
    description: "Discounted plan for students — draft, not yet published.",
    icon: "school",
    display_color: "teal",
    status: "draft",
    rank: 6,
    pricing: {
      price: 149,
      discounted_price: 99,
      currency: "INR",
      billing_cycle: "monthly",
      trial_days: 14,
      setup_fee: 0,
      renewal_price: 99,
      tax_inclusive: true,
      tax_percent: 18,
    },
    limits: {
      max_devices: 2,
      max_family_members: 1,
      daily_ai_requests: 20,
      monthly_ai_requests: 200,
      consultation_credits: 1,
      storage_limit_mb: 256,
      report_upload_limit: 20,
      appointment_limit: 4,
      ai_credits: 150,
    },
    features: defaultFeatures([
      "unlimited_ai",
      "health_reports",
      "medicine_reminder",
      "health_tracking",
      "mental_wellness",
      "diet_plans",
    ]),
    visibility: { visibility: "internal", regions: ["IN"], platforms: ["android", "ios"] },
    rules: {
      auto_renewal: true,
      grace_period_days: 3,
      allow_upgrade: true,
      allow_downgrade: true,
      cancellation_policy: "Student verification required.",
      refund_eligible: false,
      prorate_upgrades: true,
      prorate_downgrades: false,
    },
    recommendation: {
      is_recommended: false,
      is_featured: false,
      is_popular: false,
      display_priority: 20,
      badge: "none",
    },
    analytics: emptyAnalytics(),
    version: 1,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-07-01T09:00:00",
    updated_at: "2026-07-08T10:00:00",
    deleted_at: null,
  },
];

export function getActivePlans() {
  return subscriptionPlans.filter((p) => !p.deleted_at).sort((a, b) => a.rank - b.rank);
}

export function getPlanById(id: number) {
  return subscriptionPlans.find((p) => p.id === id && !p.deleted_at) || null;
}

export function getPlanStats() {
  const plans = getActivePlans();
  return {
    total: plans.length,
    active: plans.filter((p) => p.status === "active").length,
    draft: plans.filter((p) => p.status === "draft").length,
    subscribers: plans.reduce((s, p) => s + p.analytics.active_subscribers, 0),
    revenue: plans.reduce((s, p) => s + p.analytics.revenue, 0),
  };
}

export function createPlan(form: PlanFormData, editor: string): SubscriptionPlan {
  const id = nextId++;
  const slug = form.slug || slugify(form.name);
  const plan: SubscriptionPlan = {
    id,
    plan_id: `PLN-${String(id).padStart(4, "0")}`,
    name: form.name.trim(),
    slug,
    internal_code: form.internal_code.trim() || `SV_${slug.toUpperCase().replace(/-/g, "_")}`,
    description: form.description.trim(),
    icon: form.icon,
    display_color: form.display_color,
    status: form.status,
    rank: getActivePlans().length + 1,
    pricing: { ...form.pricing },
    limits: { ...form.limits },
    features: form.features.map((f) => ({ ...f })),
    visibility: {
      ...form.visibility,
      regions: [...form.visibility.regions],
      platforms: [...form.visibility.platforms],
    },
    rules: { ...form.rules },
    recommendation: { ...form.recommendation },
    analytics: emptyAnalytics(),
    version: 1,
    created_by: editor,
    updated_by: editor,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };

  if (plan.recommendation.is_recommended) {
    subscriptionPlans = subscriptionPlans.map((p) =>
      p.deleted_at
        ? p
        : {
            ...p,
            recommendation: {
              ...p.recommendation,
              is_recommended: false,
              badge: p.recommendation.badge === "recommended" ? "none" : p.recommendation.badge,
            },
          }
    );
  }

  subscriptionPlans = [...subscriptionPlans, plan];
  addPlanAudit({
    plan_id: id,
    action: "created",
    changed_by: editor,
    new_value: plan.name,
    reason: "Plan created",
  });
  return plan;
}

export function updatePlan(id: number, form: PlanFormData, editor: string): SubscriptionPlan | null {
  const existing = getPlanById(id);
  if (!existing) return null;

  if (form.recommendation.is_recommended) {
    subscriptionPlans = subscriptionPlans.map((p) =>
      p.id === id || p.deleted_at
        ? p
        : {
            ...p,
            recommendation: {
              ...p.recommendation,
              is_recommended: false,
              badge: p.recommendation.badge === "recommended" ? "none" : p.recommendation.badge,
            },
          }
    );
  }

  const updated: SubscriptionPlan = {
    ...existing,
    name: form.name.trim(),
    slug: form.slug || slugify(form.name),
    internal_code: form.internal_code.trim(),
    description: form.description.trim(),
    icon: form.icon,
    display_color: form.display_color,
    status: form.status,
    pricing: { ...form.pricing },
    limits: { ...form.limits },
    features: form.features.map((f) => ({ ...f })),
    visibility: {
      ...form.visibility,
      regions: [...form.visibility.regions],
      platforms: [...form.visibility.platforms],
    },
    rules: { ...form.rules },
    recommendation: { ...form.recommendation },
    version: existing.version + 1,
    updated_by: editor,
    updated_at: new Date().toISOString(),
  };

  subscriptionPlans = subscriptionPlans.map((p) => (p.id === id ? updated : p));
  addPlanAudit({
    plan_id: id,
    action: "updated",
    changed_by: editor,
    previous_value: `v${existing.version}`,
    new_value: `v${updated.version}`,
    reason: "Plan edited",
  });
  return updated;
}

export function duplicatePlan(id: number, editor: string): SubscriptionPlan | null {
  const source = getPlanById(id);
  if (!source) return null;
  const form = planToForm(source);
  form.name = `${source.name} (Copy)`;
  form.slug = `${source.slug}-copy`;
  form.internal_code = `${source.internal_code}_COPY`;
  form.status = "draft";
  form.recommendation = {
    ...form.recommendation,
    is_recommended: false,
    is_featured: false,
    is_popular: false,
    badge: "none",
  };
  return createPlan(form, editor);
}

export function softDeletePlan(id: number, editor: string) {
  const plan = getPlanById(id);
  if (!plan) return false;
  subscriptionPlans = subscriptionPlans.map((p) =>
    p.id === id
      ? { ...p, deleted_at: new Date().toISOString(), status: "archived" as PlanStatus, updated_by: editor, updated_at: new Date().toISOString() }
      : p
  );
  addPlanAudit({ plan_id: id, action: "deleted", changed_by: editor, previous_value: plan.status, new_value: "archived", reason: "Soft delete" });
  return true;
}

export function archivePlan(id: number, editor: string) {
  return setPlanStatus(id, "archived", editor);
}

export function setPlanStatus(id: number, status: PlanStatus, editor: string) {
  const plan = getPlanById(id);
  if (!plan) return false;
  subscriptionPlans = subscriptionPlans.map((p) =>
    p.id === id ? { ...p, status, updated_by: editor, updated_at: new Date().toISOString(), version: p.version + 1 } : p
  );
  addPlanAudit({
    plan_id: id,
    action: "status_change",
    changed_by: editor,
    previous_value: plan.status,
    new_value: status,
  });
  return true;
}

export function setRecommendedPlan(id: number, editor: string) {
  const plan = getPlanById(id);
  if (!plan) return false;
  subscriptionPlans = subscriptionPlans.map((p) => {
    if (p.deleted_at) return p;
    if (p.id === id) {
      return {
        ...p,
        recommendation: { ...p.recommendation, is_recommended: true, badge: "recommended" as PlanBadge },
        updated_by: editor,
        updated_at: new Date().toISOString(),
      };
    }
    return {
      ...p,
      recommendation: {
        ...p.recommendation,
        is_recommended: false,
        badge: p.recommendation.badge === "recommended" ? "none" : p.recommendation.badge,
      },
    };
  });
  addPlanAudit({ plan_id: id, action: "set_recommended", changed_by: editor, new_value: plan.name });
  return true;
}

export function reorderPlans(orderedIds: number[], editor: string) {
  subscriptionPlans = subscriptionPlans.map((p) => {
    const idx = orderedIds.indexOf(p.id);
    if (idx === -1) return p;
    return { ...p, rank: idx + 1, updated_by: editor, updated_at: new Date().toISOString() };
  });
  addPlanAudit({
    plan_id: orderedIds[0] || 0,
    action: "reordered",
    changed_by: editor,
    new_value: orderedIds.join(","),
    reason: "Drag-and-drop reorder",
  });
}

export function changePlanRank(id: number, direction: "up" | "down", editor: string) {
  const plans = getActivePlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index < 0) return false;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= plans.length) return false;
  const ids = plans.map((p) => p.id);
  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
  reorderPlans(ids, editor);
  return true;
}

export function getFeatureLabel(key: string, customLabel?: string) {
  if (customLabel) return customLabel;
  return FEATURE_CATALOG.find((f) => f.key === key)?.label || key;
}

export function billingCycleLabel(cycle: BillingCycle) {
  return BILLING_CYCLES.find((c) => c.value === cycle)?.label || cycle;
}

export function effectivePrice(plan: SubscriptionPlan) {
  return plan.pricing.discounted_price ?? plan.pricing.price;
}
