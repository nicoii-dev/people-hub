import type { SubscriptionPlan } from "@/types/platform";

export type BillingCycle = "monthly" | "yearly";

/** Only plans that can be subscribed to are shown on the public site. */
export function publicPlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return plans
    .filter((plan) => plan.status === "active")
    .sort((a, b) => a.priceMonthly - b.priceMonthly);
}

export function planPrice(plan: SubscriptionPlan, cycle: BillingCycle): number {
  return cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
}

export function formatPlanPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Percentage saved when paying yearly instead of twelve monthly payments. */
export function yearlySavingsPercent(plan: SubscriptionPlan): number {
  const fullYear = plan.priceMonthly * 12;
  if (fullYear <= 0) return 0;
  return Math.round((1 - plan.priceYearly / fullYear) * 100);
}
