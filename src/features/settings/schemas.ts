import { z } from "zod";

export const companyProfileSchema = z.object({
  companyName: z.string().trim().min(2, "Enter the company name"),
  legalName: z.string().trim().min(2, "Enter the legal name"),
  industry: z.string().trim().min(2, "Enter the industry"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  website: z.string().trim(),
  taxId: z.string().trim().min(2, "Enter the tax ID"),
  addressLine1: z.string().trim().min(2, "Enter the address"),
  city: z.string().trim().min(2, "Enter the city"),
  region: z.string().trim().min(2, "Enter the region or state"),
  postalCode: z.string().trim().min(2, "Enter the postal code"),
  country: z.string().trim().min(2, "Enter the country"),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
