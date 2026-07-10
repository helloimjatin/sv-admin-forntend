import { PageFormData, isSlugTaken, suggestSlugs } from "@/data/cmsData";

export type CmsFieldErrors = Partial<Record<keyof PageFormData | "slug" | "schedule" | "content" | "featured_image", string>>;
export type CmsWarnings = Partial<Record<"featured_image" | "seo_title" | "seo_description" | "content", string>>;

const URL_OK = /^(https?:\/\/|sehatvaani:\/\/).+/i;

export function validatePageForm(form: PageFormData, excludeId?: number): CmsFieldErrors {
  const errors: CmsFieldErrors = {};

  if (!form.title.trim()) errors.title = "Page title is required";

  if (!form.slug.trim()) errors.slug = "URL slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
    errors.slug = "Use lowercase letters, numbers, and hyphens only";
  } else if (isSlugTaken(form.slug, excludeId)) {
    const alts = suggestSlugs(form.title || form.slug, excludeId);
    errors.slug = alts.length
      ? `Slug already exists. Try: ${alts.join(", ")}`
      : "This slug is already in use";
  }

  if (!form.category) errors.category = "Category is required";

  const hasContent = form.content.trim().length > 0 || form.blocks.length > 0;
  if (!hasContent) errors.content = "Add rich text content or at least one content block";

  if (form.seo_title.length > 60) errors.seo_title = "SEO title should be 60 characters or fewer";
  if (form.seo_description.length > 160) errors.seo_description = "SEO description should be 160 characters or fewer";

  if (form.canonical_url && !URL_OK.test(form.canonical_url)) {
    errors.canonical_url = "Enter a valid canonical URL (https://…)";
  }
  if (form.og_image && !URL_OK.test(form.og_image) && !form.og_image.startsWith("data:")) {
    errors.og_image = "Enter a valid Open Graph image URL";
  }

  if (form.status === "scheduled" || form.scheduled_at) {
    if (form.scheduled_at) {
      const dt = new Date(`${form.scheduled_at}T${form.scheduled_time}:00`);
      if (dt.getTime() <= Date.now()) errors.schedule = "Publish schedule must be in the future";
    } else if (form.status === "scheduled") {
      errors.schedule = "Schedule date is required for scheduled pages";
    }
  }

  if (form.unpublish_at && form.scheduled_at) {
    const pub = new Date(`${form.scheduled_at}T${form.scheduled_time}:00`);
    const unp = new Date(`${form.unpublish_at}T${form.unpublish_time}:00`);
    if (unp.getTime() <= pub.getTime()) {
      errors.unpublish_at = "Unpublish time must be after publish schedule";
    }
  }

  return errors;
}

export function getPageWarnings(form: PageFormData): CmsWarnings {
  const warnings: CmsWarnings = {};
  if (!form.featured_image) warnings.featured_image = "No featured image — recommended for social sharing";
  if (!form.seo_title.trim()) warnings.seo_title = "Missing SEO title";
  if (!form.seo_description.trim()) warnings.seo_description = "Missing SEO description";
  if (!form.content.trim() && form.blocks.length === 0) warnings.content = "Page body is empty";
  return warnings;
}

export function hasCmsErrors(errors: CmsFieldErrors) {
  return Object.keys(errors).length > 0;
}
