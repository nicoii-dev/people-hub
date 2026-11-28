import { z } from "zod";

export const subscriptionPlanSchema = z.object({
  name: z.string().trim().min(2, "Enter the plan name"),
  description: z.string().trim().min(4, "Enter a short description"),
  currency: z.string().trim().min(2, "Enter a currency code"),
  priceMonthly: z.number().min(0, "Monthly price cannot be negative"),
  priceYearly: z.number().min(0, "Yearly price cannot be negative"),
  employeeLimit: z.number().int().min(1, "Enter an employee limit"),
  features: z
    .string()
    .trim()
    .min(3, "Enter at least one feature, one per line"),
  status: z.enum(["active", "archived"]),
  popular: z.boolean(),
});

export type SubscriptionPlanFormValues = z.infer<typeof subscriptionPlanSchema>;

export const platformSettingsSchema = z.object({
  platformName: z.string().trim().min(2, "Enter the platform name"),
  supportEmail: z.string().trim().email("Enter a valid support email"),
  billingEmail: z.string().trim().email("Enter a valid billing email"),
  defaultPlanId: z.string().min(1, "Choose a default plan"),
  defaultCurrency: z.string().trim().min(2, "Enter a currency code"),
  timezone: z.string().trim().min(2, "Enter a timezone"),
  sessionTimeoutMinutes: z.number().int().min(5, "Use at least 5 minutes"),
  allowSignups: z.boolean(),
  maintenanceMode: z.boolean(),
});

export type PlatformSettingsFormValues = z.infer<typeof platformSettingsSchema>;
