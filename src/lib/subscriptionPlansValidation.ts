import { PlanFormData } from "@/data/subscriptionPlansData";

export type FieldErrors = Record<string, string>;

export function validatePlanForm(form: PlanFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) errors.name = "Plan name is required";
  else if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";

  if (!form.slug.trim()) errors.slug = "Slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
    errors.slug = "Slug must be lowercase letters, numbers, and hyphens";
  }

  if (!form.description.trim()) errors.description = "Description is required";
  else if (form.description.trim().length < 10) errors.description = "Add a clearer description (10+ chars)";

  if (!form.internal_code.trim()) errors.internal_code = "Internal code is required";

  if (form.pricing.price < 0) errors.price = "Price cannot be negative";
  if (form.pricing.billing_cycle !== "free" && form.pricing.price <= 0 && !form.pricing.discounted_price) {
    errors.price = "Paid plans need a price greater than 0";
  }
  if (form.pricing.discounted_price != null && form.pricing.discounted_price < 0) {
    errors.discounted_price = "Discounted price cannot be negative";
  }
  if (
    form.pricing.discounted_price != null &&
    form.pricing.discounted_price > form.pricing.price
  ) {
    errors.discounted_price = "Discounted price must be ≤ list price";
  }
  if (form.pricing.trial_days < 0 || form.pricing.trial_days > 90) {
    errors.trial_days = "Trial days must be between 0 and 90";
  }
  if (form.pricing.tax_percent < 0 || form.pricing.tax_percent > 100) {
    errors.tax_percent = "Tax percent must be 0–100";
  }
  if (form.pricing.billing_cycle === "custom" && (!form.pricing.custom_cycle_days || form.pricing.custom_cycle_days < 1)) {
    errors.custom_cycle_days = "Custom cycle requires days ≥ 1";
  }

  if (form.limits.max_devices < 1) errors.max_devices = "At least 1 device required";
  if (form.limits.max_family_members < 1) errors.max_family_members = "At least 1 family member slot required";
  if (form.limits.storage_limit_mb < 0) errors.storage_limit_mb = "Storage cannot be negative";

  if (form.visibility.platforms.length === 0) {
    errors.platforms = "Select at least one platform";
  }
  if (form.visibility.regions.length === 0) {
    errors.regions = "Select at least one region";
  }

  if (form.rules.grace_period_days < 0 || form.rules.grace_period_days > 30) {
    errors.grace_period_days = "Grace period must be 0–30 days";
  }

  return errors;
}

export function hasValidationErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}
