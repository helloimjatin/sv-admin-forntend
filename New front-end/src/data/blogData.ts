export type BlogStatus = "active" | "inactive";

export type BlogCategory =
  | "Medical Reports"
  | "Health Education"
  | "Blood Tests"
  | "Diabetes"
  | "Heart Health"
  | "Kidney Health"
  | "Thyroid"
  | "AI Healthcare";

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Medical Reports",
  "Health Education",
  "Blood Tests",
  "Diabetes",
  "Heart Health",
  "Kidney Health",
  "Thyroid",
  "AI Healthcare",
];

export const BLOG_STATUS_OPTIONS: { value: BlogStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  content: string;
  featured_image: string | null;
  status: BlogStatus;
  featured_on_homepage: boolean;
  seo_title: string;
  seo_description: string;
  author: string;
  published_at: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type BlogFormData = {
  title: string;
  slug: string;
  slug_manual: boolean;
  category: BlogCategory;
  excerpt: string;
  content: string;
  featured_image: string;
  status: BlogStatus;
  featured_on_homepage: boolean;
  seo_title: string;
  seo_description: string;
  author: string;
  published_at: string;
};

export const WEBSITE_BASE_URL = "https://sehatvanni-web-page-pmb3.vercel.app";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBlogPublicUrl(slug: string) {
  return `${WEBSITE_BASE_URL}/blog/${slug}`;
}

export function getDefaultBlogForm(): BlogFormData {
  return {
    title: "",
    slug: "",
    slug_manual: false,
    category: "Medical Reports",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "active",
    featured_on_homepage: false,
    seo_title: "",
    seo_description: "",
    author: "SehatVaani Editorial",
    published_at: "",
  };
}

export function blogToForm(post: BlogPost): BlogFormData {
  return {
    title: post.title,
    slug: post.slug,
    slug_manual: true,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    featured_image: post.featured_image || "",
    status: post.status,
    featured_on_homepage: post.featured_on_homepage,
    seo_title: post.seo_title,
    seo_description: post.seo_description,
    author: post.author,
    published_at: post.published_at ? post.published_at.slice(0, 10) : "",
  };
}

let nextId = 11;

let blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "How to Read a CBC Report",
    slug: "how-to-read-a-cbc-report",
    category: "Blood Tests",
    excerpt:
      "Understand the parameters in a Complete Blood Count (CBC) test, including Red Blood Cells, White Blood Cells, and Platelets.",
    content:
      "<p>A Complete Blood Count (CBC) is one of the most common laboratory tests. This guide explains each parameter, reference ranges, and when values may indicate anemia, infection, or other conditions.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: true,
    seo_title: "How to Read a CBC Report | SehatVaani Blog",
    seo_description: "Learn to interpret CBC test results including RBC, WBC, and platelet counts.",
    author: "SehatVaani Editorial",
    published_at: "2026-06-12T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-06-10T10:00:00",
    updated_at: "2026-06-12T08:00:00",
    deleted_at: null,
  },
  {
    id: 2,
    title: "What is Hemoglobin?",
    slug: "what-is-hemoglobin",
    category: "Blood Tests",
    excerpt:
      "Learn what hemoglobin is, why it is critical for carrying oxygen, and the impacts of high or low levels in your body.",
    content: "<p>Hemoglobin is the protein in red blood cells that carries oxygen. Learn about normal ranges and what low or high values mean.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: true,
    seo_title: "What is Hemoglobin? | SehatVaani Blog",
    seo_description: "Understand hemoglobin levels and their role in oxygen transport.",
    author: "SehatVaani Editorial",
    published_at: "2026-06-08T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-06-06T10:00:00",
    updated_at: "2026-06-08T08:00:00",
    deleted_at: null,
  },
  {
    id: 3,
    title: "Understanding Cholesterol Reports",
    slug: "understanding-cholesterol-reports",
    category: "Heart Health",
    excerpt:
      "Demystifying Lipids: Learn the critical differences between HDL (good) cholesterol, LDL (bad) cholesterol, and triglycerides.",
    content: "<p>Cholesterol panels include HDL, LDL, and triglycerides. This article explains each marker and heart-health implications.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: true,
    seo_title: "Understanding Cholesterol Reports | SehatVaani Blog",
    seo_description: "Guide to HDL, LDL, and triglyceride levels in lipid profile reports.",
    author: "SehatVaani Editorial",
    published_at: "2026-06-05T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-06-03T10:00:00",
    updated_at: "2026-06-05T08:00:00",
    deleted_at: null,
  },
  {
    id: 4,
    title: "Understanding Thyroid Reports",
    slug: "understanding-thyroid-reports",
    category: "Thyroid",
    excerpt:
      "Get a clear guide to Thyroid Stimulating Hormone (TSH), Free T3, and Free T4 readings to identify thyroid imbalances.",
    content: "<p>Thyroid function tests measure TSH, T3, and T4. Learn how to read these values and common patterns of hypo- and hyperthyroidism.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "Understanding Thyroid Reports | SehatVaani Blog",
    seo_description: "Guide to TSH, Free T3, and Free T4 in thyroid lab reports.",
    author: "SehatVaani Editorial",
    published_at: "2026-06-01T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-28T10:00:00",
    updated_at: "2026-06-01T08:00:00",
    deleted_at: null,
  },
  {
    id: 5,
    title: "What is HbA1c?",
    slug: "what-is-hba1c",
    category: "Diabetes",
    excerpt:
      "What does your average three-month blood sugar test show? Learn about normal, pre-diabetic, and diabetic HbA1c ranges.",
    content: "<p>HbA1c reflects average blood glucose over three months. Understand diagnostic thresholds and monitoring goals.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "What is HbA1c? | SehatVaani Blog",
    seo_description: "Learn HbA1c ranges for diabetes screening and management.",
    author: "SehatVaani Editorial",
    published_at: "2026-05-25T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-22T10:00:00",
    updated_at: "2026-05-25T08:00:00",
    deleted_at: null,
  },
  {
    id: 6,
    title: "Understanding Creatinine Levels",
    slug: "understanding-creatinine-levels",
    category: "Kidney Health",
    excerpt:
      "What is creatinine and how does it relate to kidney function? Learn how to read your lab results clearly.",
    content: "<p>Creatinine is a key kidney function marker. This guide covers normal ranges, eGFR, and when to consult a physician.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "Understanding Creatinine Levels | SehatVaani Blog",
    seo_description: "How to interpret creatinine and kidney function test results.",
    author: "SehatVaani Editorial",
    published_at: "2026-05-20T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-18T10:00:00",
    updated_at: "2026-05-20T08:00:00",
    deleted_at: null,
  },
  {
    id: 7,
    title: "Understanding Liver Function Tests",
    slug: "understanding-liver-function-tests",
    category: "Medical Reports",
    excerpt:
      "A simple guide to SGOT, SGPT, Bilirubin, and Alkaline Phosphatase parameters in your Liver Function Test (LFT).",
    content: "<p>Liver function tests include SGOT, SGPT, bilirubin, and ALP. Learn what elevated values may indicate.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "Understanding Liver Function Tests | SehatVaani Blog",
    seo_description: "Guide to SGOT, SGPT, bilirubin, and ALP in LFT reports.",
    author: "SehatVaani Editorial",
    published_at: "2026-05-15T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-12T10:00:00",
    updated_at: "2026-05-15T08:00:00",
    deleted_at: null,
  },
  {
    id: 8,
    title: "Understanding Kidney Function Tests",
    slug: "understanding-kidney-function-tests",
    category: "Kidney Health",
    excerpt:
      "Learn how to read BUN (Blood Urea Nitrogen), Creatinine, and Uric Acid values to check renal health.",
    content: "<p>Kidney panels combine BUN, creatinine, and uric acid. This article explains each component and reference ranges.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "Understanding Kidney Function Tests | SehatVaani Blog",
    seo_description: "How to read BUN, creatinine, and uric acid in kidney panels.",
    author: "SehatVaani Editorial",
    published_at: "2026-05-10T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-08T10:00:00",
    updated_at: "2026-05-10T08:00:00",
    deleted_at: null,
  },
  {
    id: 9,
    title: "Normal Blood Sugar Levels",
    slug: "normal-blood-sugar-levels",
    category: "Diabetes",
    excerpt:
      "Clear ranges for Fasting, Post-Prandial, and Random blood sugar tests for children, adults, and seniors.",
    content: "<p>Blood sugar targets vary by age and test type. Compare your fasting, PP, and random glucose results here.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "Normal Blood Sugar Levels | SehatVaani Blog",
    seo_description: "Reference ranges for fasting and post-meal blood sugar tests.",
    author: "SehatVaani Editorial",
    published_at: "2026-05-05T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-03T10:00:00",
    updated_at: "2026-05-05T08:00:00",
    deleted_at: null,
  },
  {
    id: 10,
    title: "How to Read Medical Reports",
    slug: "how-to-read-medical-reports",
    category: "Health Education",
    excerpt:
      "A beginner's checklist to reading any laboratory test report. Learn about reference ranges, units, and critical flags.",
    content: "<p>New to lab reports? Start with units, reference ranges, and flagged values before diving into specific tests.</p>",
    featured_image: null,
    status: "active",
    featured_on_homepage: false,
    seo_title: "How to Read Medical Reports | SehatVaani Blog",
    seo_description: "Beginner guide to understanding laboratory test reports.",
    author: "SehatVaani Editorial",
    published_at: "2026-05-01T08:00:00",
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-04-28T10:00:00",
    updated_at: "2026-05-01T08:00:00",
    deleted_at: null,
  },
];

export function getBlogPosts() {
  return blogPosts.filter((p) => !p.deleted_at).sort((a, b) => {
    const ad = a.published_at || a.created_at;
    const bd = b.published_at || b.created_at;
    return bd.localeCompare(ad);
  });
}

export function getBlogById(id: number) {
  return blogPosts.find((p) => p.id === id && !p.deleted_at) || null;
}

export function getBlogStats() {
  const posts = getBlogPosts();
  return {
    total: posts.length,
    published: posts.filter((p) => p.status === "active").length,
    draft: posts.filter((p) => p.status === "inactive").length,
    featured: posts.filter((p) => p.featured_on_homepage).length,
  };
}

function formToPublishedAt(form: BlogFormData) {
  if (form.status !== "active") return null;
  if (form.published_at) return new Date(form.published_at).toISOString();
  return new Date().toISOString();
}

export function createBlogPost(form: BlogFormData, editor: string): BlogPost {
  const id = nextId++;
  const slug = form.slug.trim() || slugify(form.title);
  const now = new Date().toISOString();
  const post: BlogPost = {
    id,
    title: form.title.trim(),
    slug,
    category: form.category,
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    featured_image: form.featured_image.trim() || null,
    status: form.status,
    featured_on_homepage: form.featured_on_homepage,
    seo_title: form.seo_title.trim() || form.title.trim(),
    seo_description: form.seo_description.trim() || form.excerpt.trim(),
    author: form.author.trim() || "SehatVaani Editorial",
    published_at: formToPublishedAt(form),
    created_by: editor,
    updated_by: editor,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  blogPosts = [...blogPosts, post];
  return post;
}

export function updateBlogPost(id: number, form: BlogFormData, editor: string): BlogPost | null {
  const existing = getBlogById(id);
  if (!existing) return null;
  const slug = form.slug.trim() || slugify(form.title);
  const updated: BlogPost = {
    ...existing,
    title: form.title.trim(),
    slug,
    category: form.category,
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    featured_image: form.featured_image.trim() || null,
    status: form.status,
    featured_on_homepage: form.featured_on_homepage,
    seo_title: form.seo_title.trim() || form.title.trim(),
    seo_description: form.seo_description.trim() || form.excerpt.trim(),
    author: form.author.trim() || "SehatVaani Editorial",
    published_at: formToPublishedAt(form),
    updated_by: editor,
    updated_at: new Date().toISOString(),
  };
  blogPosts = blogPosts.map((p) => (p.id === id ? updated : p));
  return updated;
}

export function softDeleteBlogPost(id: number, editor: string) {
  blogPosts = blogPosts.map((p) =>
    p.id === id ? { ...p, deleted_at: new Date().toISOString(), updated_by: editor } : p
  );
}
