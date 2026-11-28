import { z } from "zod";
import { TRIAL_FEATURES } from "@/types/trial";

export const registerCompanySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/\d/, "Include at least one number"),
  companyName: z.string().trim().min(2, "Company name is required").max(150),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens")
    .optional()
    .or(z.literal("")),
  features: z.array(z.enum(TRIAL_FEATURES)).min(1, "Select at least one feature"),
});

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;
