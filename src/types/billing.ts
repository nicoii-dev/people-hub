export const BILLING_PLAN_KEYS = [
  "starter",
  "growth",
  "business",
  "enterprise",
] as const;
export const BILLING_CYCLES = ["monthly", "yearly"] as const;

export type BillingPlanKey = (typeof BILLING_PLAN_KEYS)[number];
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export interface CheckoutInput {
  plan: BillingPlanKey;
  cycle: BillingCycle;
  companyId?: string;
}

/**
 * `redirect` is returned by the API (open the Stripe-hosted Checkout URL).
 * `mock` is returned locally when Stripe keys are not configured.
 */
export type CheckoutResult =
  | { mode: "redirect"; url: string; plan: BillingPlanKey; cycle: BillingCycle }
  | { mode: "mock"; planName: string; plan: BillingPlanKey; cycle: BillingCycle };

export function isBillingPlanKey(value: unknown): value is BillingPlanKey {
  return typeof value === "string" && BILLING_PLAN_KEYS.includes(value as BillingPlanKey);
}

export function isBillingCycle(value: unknown): value is BillingCycle {
  return typeof value === "string" && BILLING_CYCLES.includes(value as BillingCycle);
}

/** Maps a visible plan name (for example "Growth") to its checkout key. */
export function planKeyFromName(name: string): BillingPlanKey | null {
  const key = name.trim().toLowerCase();
  return isBillingPlanKey(key) ? key : null;
}
