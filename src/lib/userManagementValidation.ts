import { UserFormData } from "@/data/userManagementData";

export type FieldErrors = Record<string, string>;

export function validateUserForm(form: UserFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required";
  else if (form.full_name.trim().length < 2) errors.full_name = "Name is too short";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Invalid email";

  if (!form.mobile.trim()) errors.mobile = "Mobile number is required";
  else if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, "").replace(/^\+91/, "+91"))) {
    // allow formatted +91 numbers
    const digits = form.mobile.replace(/\D/g, "");
    if (digits.length < 10) errors.mobile = "Enter a valid mobile number";
  }

  if (form.dob && Number.isNaN(new Date(form.dob).getTime())) errors.dob = "Invalid date of birth";
  if (form.height && (Number(form.height) < 50 || Number(form.height) > 250)) errors.height = "Height must be 50–250 cm";
  if (form.weight && (Number(form.weight) < 10 || Number(form.weight) > 300)) errors.weight = "Weight must be 10–300 kg";

  return errors;
}

export function hasValidationErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}
