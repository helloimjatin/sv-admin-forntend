export type PageStatus = "draft" | "published" | "scheduled" | "archived" | "disabled";
export type PageVisibility =
  | "public"
  | "authenticated"
  | "doctors_only"
  | "patients_only"
  | "premium"
  | "admin_only"
  | "private";
export type SeoStatus = "complete" | "partial" | "missing";
export type ContentBlockType =
  | "rich_text"
  | "heading"
  | "image"
  | "video"
  | "faq"
  | "accordion"
  | "table"
  | "list"
  | "quote"
  | "code"
  | "callout"
  | "divider"
  | "button"
  | "embed"
  | "cta"
  | "card"
  | "html";

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  data: Record<string, unknown>;
};

export type PageVersion = {
  version: number;
  title: string;
  slug: string;
  content: string;
  blocks: ContentBlock[];
  editor_name: string;
  created_at: string;
  change_summary: string;
  revision_notes?: string;
};

export type StaticPage = {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  content: string;
  blocks: ContentBlock[];
  featured_image: string | null;
  banner_image: string | null;
  gallery: string[];
  attachments: string[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  canonical_url: string;
  robots: string;
  sitemap_include: boolean;
  is_active: boolean;
  custom_css: string;
  custom_js: string;
  internal_notes: string;
  revision_notes: string;
  visibility: PageVisibility;
  status: PageStatus;
  language: string;
  version: number;
  published_at: string | null;
  scheduled_at: string | null;
  scheduled_unpublish_at: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  versions: PageVersion[];
};

export type AppConfigKey =
  | "terms_conditions"
  | "privacy_policy"
  | "refund_policy"
  | "about_us"
  | "contact_info"
  | "help_center"
  | "faqs"
  | "emergency_disclaimer"
  | "cookie_policy"
  | "data_retention"
  | "user_agreement"
  | "doctor_guidelines"
  | "community_guidelines";

export type AppConfigEntry = {
  key: AppConfigKey;
  label: string;
  language: string;
  content: string;
  status: PageStatus;
  updated_by: string;
  updated_at: string;
};

export type PageFormData = {
  title: string;
  slug: string;
  slug_manual: boolean;
  category: string;
  short_description: string;
  content: string;
  blocks: ContentBlock[];
  featured_image: string;
  banner_image: string;
  gallery: string[];
  attachments: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  robots: string;
  sitemap_include: boolean;
  is_active: boolean;
  custom_css: string;
  custom_js: string;
  internal_notes: string;
  revision_notes: string;
  visibility: PageVisibility;
  status: PageStatus;
  language: string;
  scheduled_at: string;
  scheduled_time: string;
  unpublish_at: string;
  unpublish_time: string;
};

export const VISIBILITY_OPTIONS: { label: string; value: PageVisibility }[] = [
  { label: "Public", value: "public" },
  { label: "Logged-in Users", value: "authenticated" },
  { label: "Doctors Only", value: "doctors_only" },
  { label: "Patients Only", value: "patients_only" },
  { label: "Premium Users", value: "premium" },
  { label: "Admin Only", value: "admin_only" },
  { label: "Private", value: "private" },
];

export const MEDIA_LIBRARY = [
  { id: "m1", name: "Hero Banner", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800", type: "image" },
  { id: "m2", name: "Clinic Interior", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800", type: "image" },
  { id: "m3", name: "Doctor Consult", url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800", type: "image" },
  { id: "m4", name: "Health App UI", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", type: "image" },
];

export const PAGE_CATEGORIES = [
  "Legal",
  "Healthcare",
  "Marketing",
  "Support",
  "Doctor Portal",
  "Patient Resources",
  "General",
];

export const PAGE_STATUS_OPTIONS: { label: string; value: PageStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
  { label: "Disabled", value: "disabled" },
];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", fallback: true },
  { code: "hi", label: "Hindi", fallback: false },
  { code: "mr", label: "Marathi", fallback: false },
  { code: "ta", label: "Tamil", fallback: false },
];

export const BLOCK_TYPE_OPTIONS: { label: string; value: ContentBlockType }[] = [
  { label: "Rich Text", value: "rich_text" },
  { label: "Heading", value: "heading" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "FAQ", value: "faq" },
  { label: "Accordion", value: "accordion" },
  { label: "Table", value: "table" },
  { label: "List", value: "list" },
  { label: "Quote", value: "quote" },
  { label: "Code Block", value: "code" },
  { label: "Callout", value: "callout" },
  { label: "Divider", value: "divider" },
  { label: "Button", value: "button" },
  { label: "Embed", value: "embed" },
  { label: "Call-to-Action", value: "cta" },
  { label: "Card", value: "card" },
  { label: "Custom HTML (Admin)", value: "html" },
];

export const APP_CONFIG_KEYS: { key: AppConfigKey; label: string }[] = [
  { key: "terms_conditions", label: "Terms & Conditions" },
  { key: "privacy_policy", label: "Privacy Policy" },
  { key: "refund_policy", label: "Refund Policy" },
  { key: "about_us", label: "About Us" },
  { key: "contact_info", label: "Contact Information" },
  { key: "help_center", label: "Help Center" },
  { key: "faqs", label: "FAQs" },
  { key: "emergency_disclaimer", label: "Emergency Disclaimer" },
  { key: "cookie_policy", label: "Cookie Policy" },
  { key: "data_retention", label: "Data Retention Policy" },
  { key: "user_agreement", label: "User Agreement" },
  { key: "doctor_guidelines", label: "Doctor Guidelines" },
  { key: "community_guidelines", label: "Community Guidelines" },
];

export const PUBLIC_BASE_URL = "https://sehatvaani.com/pages";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function getSeoStatus(page: Pick<StaticPage, "seo_title" | "seo_description" | "seo_keywords">): SeoStatus {
  const hasTitle = Boolean(page.seo_title?.trim());
  const hasDesc = Boolean(page.seo_description?.trim());
  const hasKw = Boolean(page.seo_keywords?.trim());
  if (hasTitle && hasDesc && hasKw) return "complete";
  if (hasTitle || hasDesc) return "partial";
  return "missing";
}

export function getPublicUrl(slug: string, lang = "en") {
  return `${PUBLIC_BASE_URL}/${lang}/${slug}`;
}

function makeVersion(page: StaticPage, editor: string, summary: string): PageVersion {
  return {
    version: page.version,
    title: page.title,
    slug: page.slug,
    content: page.content,
    blocks: JSON.parse(JSON.stringify(page.blocks)),
    editor_name: editor,
    created_at: new Date().toISOString(),
    change_summary: summary,
  };
}

function withDefaults(page: Omit<StaticPage, "gallery" | "og_title" | "og_description" | "sitemap_include" | "is_active" | "revision_notes" | "scheduled_unpublish_at"> & Partial<StaticPage>): StaticPage {
  return {
    gallery: [],
    og_title: "",
    og_description: "",
    sitemap_include: true,
    is_active: true,
    revision_notes: "",
    scheduled_unpublish_at: null,
    ...page,
  } as StaticPage;
}

export let staticPages: StaticPage[] = [
  withDefaults({
    id: 1,
    title: "About SehatVaani",
    slug: "about-sehatvaani",
    category: "General",
    short_description: "Learn about our mission to democratize healthcare access in India.",
    content: "<p>SehatVaani connects patients with AI-powered health insights and certified medical professionals.</p>",
    blocks: [
      { id: "b1", type: "rich_text", data: { html: "<p>SehatVaani connects patients with AI-powered health insights.</p>" } },
      { id: "b2", type: "cta", data: { title: "Download the App", button: "Get Started", link: "sehatvaani://download" } },
    ],
    featured_image: null,
    banner_image: null,
    attachments: [],
    seo_title: "About SehatVaani | AI Healthcare Platform",
    seo_description: "Discover how SehatVaani is transforming digital healthcare in India.",
    seo_keywords: "sehatvaani, healthcare, AI health",
    og_image: null,
    canonical_url: "https://sehatvaani.com/pages/en/about-sehatvaani",
    robots: "index, follow",
    custom_css: "",
    custom_js: "",
    internal_notes: "",
    visibility: "public",
    status: "published",
    language: "en",
    version: 3,
    published_at: "2026-06-01T10:00:00",
    scheduled_at: null,
    created_by: "Dr. Meera Nair",
    updated_by: "Rajesh Gupta",
    created_at: "2026-05-15T08:00:00",
    updated_at: "2026-07-08T14:30:00",
    deleted_at: null,
    versions: [],
  }),
  withDefaults({
    id: 2,
    title: "Teleconsultation Guide",
    slug: "teleconsultation-guide",
    category: "Patient Resources",
    short_description: "How to book and join video consultations with doctors.",
    content: "<p>Step-by-step guide for patients using teleconsultation features.</p>",
    blocks: [{ id: "b1", type: "rich_text", data: { html: "<p>Book a consultation from the app home screen.</p>" } }],
    featured_image: null,
    banner_image: null,
    attachments: [],
    seo_title: "Teleconsultation Guide",
    seo_description: "",
    seo_keywords: "teleconsultation, video call",
    og_image: null,
    canonical_url: "",
    robots: "index, follow",
    custom_css: "",
    custom_js: "",
    internal_notes: "Needs doctor review",
    visibility: "patients_only",
    status: "draft",
    language: "en",
    version: 1,
    published_at: null,
    scheduled_at: null,
    created_by: "Kavita Joshi",
    updated_by: "Kavita Joshi",
    created_at: "2026-07-09T11:00:00",
    updated_at: "2026-07-09T11:00:00",
    deleted_at: null,
    versions: [],
  }),
  withDefaults({
    id: 3,
    title: "Monsoon Health Tips 2026",
    slug: "monsoon-health-tips-2026",
    category: "Healthcare",
    short_description: "Seasonal health advisory for monsoon preparedness.",
    content: "",
    blocks: [
      { id: "b1", type: "rich_text", data: { html: "<h2>Stay Safe This Monsoon</h2><p>Hydration and vector-borne disease prevention tips.</p>" } },
      { id: "b2", type: "faq", data: { items: [{ q: "What vaccines are recommended?", a: "Consult your physician for typhoid and hepatitis A." }] } },
    ],
    featured_image: null,
    banner_image: null,
    attachments: [],
    seo_title: "Monsoon Health Tips 2026 | SehatVaani",
    seo_description: "Essential monsoon health tips for Indian families.",
    seo_keywords: "monsoon, health tips, seasonal",
    og_image: null,
    canonical_url: "",
    robots: "index, follow",
    custom_css: "",
    custom_js: "",
    internal_notes: "",
    visibility: "public",
    status: "scheduled",
    language: "en",
    version: 2,
    published_at: null,
    scheduled_at: "2026-07-15T08:00:00",
    created_by: "Dr. Meera Nair",
    updated_by: "Dr. Meera Nair",
    created_at: "2026-07-05T09:00:00",
    updated_at: "2026-07-10T07:00:00",
    deleted_at: null,
    versions: [],
  }),
  withDefaults({
    id: 4,
    title: "Doctor Onboarding",
    slug: "doctor-onboarding",
    category: "Doctor Portal",
    short_description: "Portal setup guide for registered doctors.",
    content: "",
    blocks: [{ id: "b1", type: "rich_text", data: { html: "<p>Complete your profile verification to start consultations.</p>" } }],
    featured_image: null,
    banner_image: null,
    attachments: ["https://docs.sehatvaani.com/doctor-checklist.pdf"],
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image: null,
    canonical_url: "",
    robots: "noindex, nofollow",
    custom_css: "",
    custom_js: "",
    internal_notes: "Doctor-only page",
    visibility: "doctors_only",
    status: "published",
    language: "en",
    version: 1,
    published_at: "2026-04-20T12:00:00",
    scheduled_at: null,
    created_by: "Rajesh Gupta",
    updated_by: "Rajesh Gupta",
    created_at: "2026-04-20T12:00:00",
    updated_at: "2026-04-20T12:00:00",
    deleted_at: null,
    versions: [],
  }),
  withDefaults({
    id: 5,
    title: "Legacy Pricing Page",
    slug: "pricing-legacy",
    category: "Marketing",
    short_description: "Deprecated pricing information.",
    content: "",
    blocks: [],
    featured_image: null,
    banner_image: null,
    attachments: [],
    seo_title: "Pricing",
    seo_description: "Old pricing page",
    seo_keywords: "pricing",
    og_image: null,
    canonical_url: "",
    robots: "noindex, nofollow",
    custom_css: "",
    custom_js: "",
    internal_notes: "Archived — replaced by in-app subscriptions",
    visibility: "private",
    status: "archived",
    language: "en",
    version: 4,
    published_at: "2025-12-01T00:00:00",
    scheduled_at: null,
    created_by: "Suresh Pillai",
    updated_by: "Rajesh Gupta",
    created_at: "2025-10-01T00:00:00",
    updated_at: "2026-06-01T00:00:00",
    deleted_at: null,
    versions: [],
  }),
  withDefaults({
    id: 6,
    title: "स्वास्थ्य के बारे में",
    slug: "about-sehatvaani-hi",
    category: "General",
    short_description: "हिंदी में SehatVaani के बारे में जानें।",
    content: "",
    blocks: [{ id: "b1", type: "rich_text", data: { html: "<p>SehatVaani भारत में डिजिटल स्वास्थ्य सेवा लाता है।</p>" } }],
    featured_image: null,
    banner_image: null,
    attachments: [],
    seo_title: "SehatVaani के बारे में",
    seo_description: "AI स्वास्थ्य प्लेटफॉर्म",
    seo_keywords: "sehatvaani, hindi",
    og_image: null,
    canonical_url: "",
    robots: "index, follow",
    custom_css: "",
    custom_js: "",
    internal_notes: "Hindi localization",
    visibility: "public",
    status: "published",
    language: "hi",
    version: 1,
    published_at: "2026-06-15T00:00:00",
    scheduled_at: null,
    created_by: "Kavita Joshi",
    updated_by: "Kavita Joshi",
    created_at: "2026-06-15T00:00:00",
    updated_at: "2026-06-15T00:00:00",
    deleted_at: null,
    versions: [],
  }),
];

// Seed version history for page 1
staticPages[0].versions = [
  { version: 1, title: "About Us", slug: "about-us", content: "<p>Initial draft</p>", blocks: [], editor_name: "Dr. Meera Nair", created_at: "2026-05-15T08:00:00", change_summary: "Initial creation" },
  { version: 2, title: "About SehatVaani", slug: "about-sehatvaani", content: "<p>Updated branding</p>", blocks: [], editor_name: "Rajesh Gupta", created_at: "2026-06-20T10:00:00", change_summary: "Rebrand and slug update" },
  makeVersion(staticPages[0], "Rajesh Gupta", "Added CTA block"),
];

export let appConfigEntries: AppConfigEntry[] = APP_CONFIG_KEYS.map((item, i) => ({
  key: item.key,
  label: item.label,
  language: "en",
  content: `<p>${item.label} content for SehatVaani healthcare platform. Last reviewed July 2026.</p>`,
  status: (i < 8 ? "published" : "draft") as PageStatus,
  updated_by: i % 2 === 0 ? "Dr. Meera Nair" : "Rajesh Gupta",
  updated_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

let nextPageId = Math.max(...staticPages.map((p) => p.id), 0) + 1;

export function getDefaultPageForm(): PageFormData {
  return {
    title: "",
    slug: "",
    slug_manual: false,
    category: "General",
    short_description: "",
    content: "",
    blocks: [],
    featured_image: "",
    banner_image: "",
    gallery: [],
    attachments: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    canonical_url: "",
    robots: "index, follow",
    sitemap_include: true,
    is_active: true,
    custom_css: "",
    custom_js: "",
    internal_notes: "",
    revision_notes: "",
    visibility: "public",
    status: "draft",
    language: "en",
    scheduled_at: "",
    scheduled_time: "09:00",
    unpublish_at: "",
    unpublish_time: "23:59",
  };
}

export function pageToForm(page: StaticPage): PageFormData {
  const sched = page.scheduled_at ? new Date(page.scheduled_at) : null;
  const unpub = page.scheduled_unpublish_at ? new Date(page.scheduled_unpublish_at) : null;
  return {
    title: page.title,
    slug: page.slug,
    slug_manual: true,
    category: page.category,
    short_description: page.short_description,
    content: page.content,
    blocks: JSON.parse(JSON.stringify(page.blocks)),
    featured_image: page.featured_image ?? "",
    banner_image: page.banner_image ?? "",
    gallery: [...(page.gallery ?? [])],
    attachments: page.attachments.join(", "),
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    seo_keywords: page.seo_keywords,
    og_title: page.og_title ?? "",
    og_description: page.og_description ?? "",
    og_image: page.og_image ?? "",
    canonical_url: page.canonical_url,
    robots: page.robots,
    sitemap_include: page.sitemap_include ?? true,
    is_active: page.is_active ?? true,
    custom_css: page.custom_css,
    custom_js: page.custom_js,
    internal_notes: page.internal_notes,
    revision_notes: page.revision_notes ?? "",
    visibility: page.visibility,
    status: page.status,
    language: page.language,
    scheduled_at: sched ? sched.toISOString().slice(0, 10) : "",
    scheduled_time: sched ? sched.toTimeString().slice(0, 5) : "09:00",
    unpublish_at: unpub ? unpub.toISOString().slice(0, 10) : "",
    unpublish_time: unpub ? unpub.toTimeString().slice(0, 5) : "23:59",
  };
}

export function isSlugTaken(slug: string, excludeId?: number): boolean {
  return staticPages.some((p) => p.slug === slug && p.id !== excludeId && !p.deleted_at);
}

export function suggestSlugs(base: string, excludeId?: number): string[] {
  const suggestions: string[] = [];
  const root = slugify(base);
  if (!isSlugTaken(root, excludeId)) suggestions.push(root);
  for (let i = 2; i <= 5; i++) {
    const alt = `${root}-${i}`;
    if (!isSlugTaken(alt, excludeId)) suggestions.push(alt);
  }
  const dated = `${root}-${new Date().getFullYear()}`;
  if (!isSlugTaken(dated, excludeId)) suggestions.push(dated);
  return suggestions.slice(0, 4);
}

function formToPage(form: PageFormData, id: number, editor: string, existing?: StaticPage): StaticPage {
  const now = new Date().toISOString();
  const scheduled = !form.scheduled_at ? null : `${form.scheduled_at}T${form.scheduled_time}:00`;
  const unpublish = !form.unpublish_at ? null : `${form.unpublish_at}T${form.unpublish_time}:00`;

  const page: StaticPage = {
    id,
    title: form.title.trim(),
    slug: form.slug.trim(),
    category: form.category,
    short_description: form.short_description.trim(),
    content: form.content,
    blocks: form.blocks,
    featured_image: form.featured_image || null,
    banner_image: form.banner_image || null,
    gallery: form.gallery ?? [],
    attachments: form.attachments.split(",").map((a) => a.trim()).filter(Boolean),
    seo_title: form.seo_title.trim(),
    seo_description: form.seo_description.trim(),
    seo_keywords: form.seo_keywords.trim(),
    og_title: form.og_title.trim(),
    og_description: form.og_description.trim(),
    og_image: form.og_image || null,
    canonical_url: form.canonical_url.trim(),
    robots: form.robots,
    sitemap_include: form.sitemap_include,
    is_active: form.is_active,
    custom_css: form.custom_css,
    custom_js: form.custom_js,
    internal_notes: form.internal_notes.trim(),
    revision_notes: form.revision_notes.trim(),
    visibility: form.visibility,
    status: form.status,
    language: form.language,
    version: existing ? existing.version + 1 : 1,
    published_at: form.status === "published" ? now : existing?.published_at ?? null,
    scheduled_at: form.status === "scheduled" ? scheduled : scheduled,
    scheduled_unpublish_at: unpublish,
    created_by: existing?.created_by ?? editor,
    updated_by: editor,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: null,
    versions: existing?.versions ?? [],
  };

  if (existing) {
    page.versions = [
      { ...makeVersion(existing, editor, form.revision_notes.trim() || "Saved revision"), revision_notes: form.revision_notes.trim() },
      ...existing.versions,
    ].slice(0, 20);
  }

  return page;
}

export function createStaticPage(form: PageFormData, editor: string) {
  const id = nextPageId++;
  const page = formToPage(form, id, editor);
  staticPages = [page, ...staticPages];
  return page;
}

export function updateStaticPage(id: number, form: PageFormData, editor: string) {
  const idx = staticPages.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const updated = formToPage(form, id, editor, staticPages[idx]);
  staticPages[idx] = updated;
  return updated;
}

export function duplicateStaticPage(id: number, editor: string) {
  const source = staticPages.find((p) => p.id === id);
  if (!source) return null;
  const form = pageToForm(source);
  form.title = `${source.title} (Copy)`;
  form.slug = suggestSlugs(form.title)[0] ?? `${source.slug}-copy`;
  form.status = "draft";
  return createStaticPage(form, editor);
}

export function publishPage(id: number, editor: string) {
  const page = staticPages.find((p) => p.id === id);
  if (page) {
    page.status = "published";
    page.published_at = new Date().toISOString();
    page.updated_by = editor;
    page.updated_at = new Date().toISOString();
  }
  return page;
}

export function unpublishPage(id: number, editor: string) {
  const page = staticPages.find((p) => p.id === id);
  if (page) {
    page.status = "draft";
    page.updated_by = editor;
    page.updated_at = new Date().toISOString();
  }
  return page;
}

export function archivePage(id: number, editor: string) {
  const page = staticPages.find((p) => p.id === id);
  if (page) {
    page.status = "archived";
    page.updated_by = editor;
    page.updated_at = new Date().toISOString();
  }
  return page;
}

export function softDeletePage(id: number, editor: string) {
  const page = staticPages.find((p) => p.id === id);
  if (page) {
    page.deleted_at = new Date().toISOString();
    page.updated_by = editor;
  }
  return page;
}

export function restorePageVersion(pageId: number, versionNum: number, editor: string) {
  const page = staticPages.find((p) => p.id === pageId);
  const ver = page?.versions.find((v) => v.version === versionNum);
  if (!page || !ver) return null;
  page.title = ver.title;
  page.slug = ver.slug;
  page.content = ver.content;
  page.blocks = JSON.parse(JSON.stringify(ver.blocks));
  page.version += 1;
  page.updated_by = editor;
  page.updated_at = new Date().toISOString();
  page.versions = [makeVersion(page, editor, `Restored from v${versionNum}`), ...page.versions].slice(0, 20);
  return page;
}

export function updateAppConfig(key: AppConfigKey, content: string, language: string, editor: string) {
  const entry = appConfigEntries.find((e) => e.key === key && e.language === language);
  if (entry) {
    entry.content = content;
    entry.updated_by = editor;
    entry.updated_at = new Date().toISOString();
    return entry;
  }
  const label = APP_CONFIG_KEYS.find((k) => k.key === key)?.label ?? key;
  const newEntry: AppConfigEntry = { key, label, language, content, status: "draft", updated_by: editor, updated_at: new Date().toISOString() };
  appConfigEntries.push(newEntry);
  return newEntry;
}

export function getAppConfig(key: AppConfigKey, language: string) {
  return appConfigEntries.find((e) => e.key === key && e.language === language)
    ?? appConfigEntries.find((e) => e.key === key && e.language === "en");
}
