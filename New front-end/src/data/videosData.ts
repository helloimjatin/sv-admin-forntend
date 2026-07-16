export type VideoStatus = "active" | "inactive";

export type VideoCategory = string;

const DEFAULT_VIDEO_CATEGORIES = [
  "Product Tutorials",
  "Medical Education",
  "Feature Walkthroughs",
  "Healthcare Awareness",
];

let customVideoCategories: string[] = [];

export function getVideoCategories(): string[] {
  const all = [...DEFAULT_VIDEO_CATEGORIES, ...customVideoCategories];
  return Array.from(new Set(all.map((c) => c.trim()).filter(Boolean)));
}

/** @deprecated use getVideoCategories() */
export const VIDEO_CATEGORIES = DEFAULT_VIDEO_CATEGORIES;

export function addVideoCategory(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const existing = getVideoCategories().find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  customVideoCategories = [...customVideoCategories, trimmed];
  return trimmed;
}

export const VIDEO_STATUS_OPTIONS: { value: VideoStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export type VideoItem = {
  id: number;
  title: string;
  slug: string;
  category: VideoCategory;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: string;
  status: VideoStatus;
  featured_on_homepage: boolean;
  sort_order: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type VideoFormData = {
  title: string;
  slug: string;
  slug_manual: boolean;
  category: VideoCategory;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  status: VideoStatus;
  featured_on_homepage: boolean;
  sort_order: number;
};

export const WEBSITE_BASE_URL = "https://sehatvanni-web-page-pmb3.vercel.app";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getVideoPublicUrl(slug: string) {
  return `${WEBSITE_BASE_URL}/videos/${slug}`;
}

export function getDefaultVideoForm(): VideoFormData {
  return {
    title: "",
    slug: "",
    slug_manual: false,
    category: DEFAULT_VIDEO_CATEGORIES[0],
    description: "",
    video_url: "",
    thumbnail_url: "",
    duration: "",
    status: "active",
    featured_on_homepage: false,
    sort_order: 1,
  };
}

export function videoToForm(video: VideoItem): VideoFormData {
  return {
    title: video.title,
    slug: video.slug,
    slug_manual: true,
    category: video.category,
    description: video.description,
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url || "",
    duration: video.duration,
    status: video.status,
    featured_on_homepage: video.featured_on_homepage,
    sort_order: video.sort_order,
  };
}

let nextId = 5;

let videos: VideoItem[] = [
  {
    id: 1,
    title: "How to Upload & Scan Reports",
    slug: "how-to-upload-and-scan-reports",
    category: "Product Tutorials",
    description:
      "A step-by-step guide showing how to upload laboratory reports (PDF or images) on SehatVaani and start the AI OCR extraction.",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: null,
    duration: "4:32",
    status: "active",
    featured_on_homepage: true,
    sort_order: 1,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-06-01T10:00:00",
    updated_at: "2026-06-05T08:00:00",
    deleted_at: null,
  },
  {
    id: 2,
    title: "Interpreting Hemoglobin and CBC Ratios",
    slug: "interpreting-hemoglobin-and-cbc-ratios",
    category: "Medical Education",
    description:
      "Learn how the thyroid, iron indices, and CBC levels are mapped inside our medical explanations engine.",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: null,
    duration: "6:15",
    status: "active",
    featured_on_homepage: false,
    sort_order: 2,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-28T10:00:00",
    updated_at: "2026-05-30T08:00:00",
    deleted_at: null,
  },
  {
    id: 3,
    title: "Interactive Chat Feature Walkthrough",
    slug: "interactive-chat-feature-walkthrough",
    category: "Feature Walkthroughs",
    description:
      "Watch how the SehatVaani interactive assistant lets you chat with your report to clear diagnostic queries instantly.",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: null,
    duration: "5:48",
    status: "active",
    featured_on_homepage: false,
    sort_order: 3,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-22T10:00:00",
    updated_at: "2026-05-25T08:00:00",
    deleted_at: null,
  },
  {
    id: 4,
    title: "Rural Healthcare Digitization in India",
    slug: "rural-healthcare-digitization-in-india",
    category: "Healthcare Awareness",
    description:
      "SehatVaani's mission to break medical terminology and English-language barriers for semi-urban families.",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: null,
    duration: "8:20",
    status: "active",
    featured_on_homepage: false,
    sort_order: 4,
    created_by: "admin@sehatvaani.com",
    updated_by: "admin@sehatvaani.com",
    created_at: "2026-05-15T10:00:00",
    updated_at: "2026-05-18T08:00:00",
    deleted_at: null,
  },
];

export function getVideos() {
  return videos.filter((v) => !v.deleted_at).sort((a, b) => a.sort_order - b.sort_order);
}

export function getVideoById(id: number) {
  return videos.find((v) => v.id === id && !v.deleted_at) || null;
}

export function getVideoStats() {
  const list = getVideos();
  return {
    total: list.length,
    published: list.filter((v) => v.status === "active").length,
    draft: list.filter((v) => v.status === "inactive").length,
    featured: list.filter((v) => v.featured_on_homepage).length,
  };
}

export function createVideo(form: VideoFormData, editor: string): VideoItem {
  const id = nextId++;
  const slug = form.slug.trim() || slugify(form.title);
  const now = new Date().toISOString();
  const video: VideoItem = {
    id,
    title: form.title.trim(),
    slug,
    category: form.category.trim() || DEFAULT_VIDEO_CATEGORIES[0],
    description: form.description.trim(),
    video_url: form.video_url.trim(),
    thumbnail_url: form.thumbnail_url.trim() || null,
    duration: form.duration.trim(),
    status: form.status,
    featured_on_homepage: form.featured_on_homepage,
    sort_order: getVideos().length + 1,
    created_by: editor,
    updated_by: editor,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
  videos = [...videos, video];
  return video;
}

export function updateVideo(id: number, form: VideoFormData, editor: string): VideoItem | null {
  const existing = getVideoById(id);
  if (!existing) return null;
  const slug = form.slug.trim() || slugify(form.title);
  const updated: VideoItem = {
    ...existing,
    title: form.title.trim(),
    slug,
    category: form.category.trim() || existing.category,
    description: form.description.trim(),
    video_url: form.video_url.trim(),
    thumbnail_url: form.thumbnail_url.trim() || null,
    duration: form.duration.trim(),
    status: form.status,
    featured_on_homepage: form.featured_on_homepage,
    updated_by: editor,
    updated_at: new Date().toISOString(),
  };
  videos = videos.map((v) => (v.id === id ? updated : v));
  return updated;
}

export function softDeleteVideo(id: number, editor: string) {
  videos = videos.map((v) =>
    v.id === id ? { ...v, deleted_at: new Date().toISOString(), updated_by: editor } : v
  );
}
