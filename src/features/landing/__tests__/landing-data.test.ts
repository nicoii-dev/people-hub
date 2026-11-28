import { subscriptionPlanSeed } from "@/data/platform";
import {
  formatPlanPrice,
  planPrice,
  publicPlans,
  yearlySavingsPercent,
} from "../landing-data";

describe("landing pricing data", () => {
  it("shows only active plans, ordered by monthly price", () => {
    const plans = publicPlans([
      ...subscriptionPlanSeed,
      { ...subscriptionPlanSeed[0], id: "archived", status: "archived" },
    ]);

    expect(plans.map((plan) => plan.name)).toEqual([
      "Starter",
      "Growth",
      "Business",
      "Enterprise",
    ]);
  });

  it("uses the price that matches the selected billing cycle", () => {
    const [starter] = subscriptionPlanSeed;
    expect(planPrice(starter, "monthly")).toBe(2900);
    expect(planPrice(starter, "yearly")).toBe(29000);
  });

  it("formats PHP prices without decimals", () => {
    expect(formatPlanPrice(12900, "PHP")).toBe("₱12,900");
  });

  it("calculates the yearly discount from twelve monthly payments", () => {
    expect(yearlySavingsPercent(subscriptionPlanSeed[1])).toBe(17);
  });
});
