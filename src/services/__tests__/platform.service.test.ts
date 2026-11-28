import { platformCompanySeed, subscriptionPlanSeed } from "@/data/platform";
import { resetMockData } from "../mock/persistence";
import { platformService } from "../platform.service";

describe("platform service", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("lists registered companies", async () => {
    const response = await platformService.listCompanies();

    expect(response.data.length).toBe(platformCompanySeed.length);
    expect(response.data[0].name).toBeTruthy();
  });

  it("suspends and reactivates a company", async () => {
    const company = platformCompanySeed[0];

    const suspended = await platformService.setCompanyStatus(company.id, "suspended");
    expect(suspended.data.status).toBe("suspended");

    const active = await platformService.setCompanyStatus(company.id, "active");
    expect(active.data.status).toBe("active");
  });

  it("changes a company subscription plan", async () => {
    const company = platformCompanySeed[0];
    const targetPlan = subscriptionPlanSeed[0];

    const response = await platformService.updateCompanyPlan(company.id, targetPlan.id);

    expect(response.data.planId).toBe(targetPlan.id);
  });

  it("creates and updates subscription plans", async () => {
    const created = await platformService.createPlan({
      name: "Scale",
      description: "Scale plan for large teams",
      currency: "PHP",
      priceMonthly: 18900,
      priceYearly: 189000,
      employeeLimit: 1000,
      features: ["Audit logs", "SSO"],
      status: "active",
      popular: false,
    });

    expect(created.data.id).toMatch(/^[0-9a-f-]{36}$/);

    const updated = await platformService.updatePlan(created.data.id, {
      ...created.data,
      name: "Scale Plus",
    });

    expect(updated.data.name).toBe("Scale Plus");
  });

  it("summarizes recurring and collected revenue", async () => {
    const response = await platformService.getRevenueSummary();
    const summary = response.data;

    expect(summary.monthlyRecurringRevenue).toBeGreaterThan(0);
    expect(summary.collectedThisMonth).toBeGreaterThan(0);
    expect(summary.failedPayments).toBeGreaterThan(0);
    expect(summary.revenueByPlan.length).toBeGreaterThan(0);
  });

  it("returns and saves platform settings", async () => {
    const before = await platformService.getSettings();
    const response = await platformService.updateSettings({
      ...before.data,
      allowSignups: false,
      maintenanceMode: true,
    });

    expect(response.data.allowSignups).toBe(false);
    expect(response.data.maintenanceMode).toBe(true);
    expect(response.data.updatedAt).toBeTruthy();
  });
});
