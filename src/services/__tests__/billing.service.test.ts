import {
  MOCK_WORKSPACE_COMPANY_ID,
  platformPaymentSeed,
  subscriptionPlanSeed,
} from "@/data/platform";
import { billingService } from "../billing.service";
import {
  MOCK_COLLECTIONS,
  readCollection,
  resetMockData,
} from "../mock/persistence";
import { platformService } from "../platform.service";

describe("billing service (mock mode)", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("activates the selected plan and records a demo payment", async () => {
    const response = await billingService.startCheckout({
      plan: "growth",
      cycle: "yearly",
    });

    expect(response.data.mode).toBe("mock");
    if (response.data.mode !== "mock") return;
    expect(response.data.planName).toBe("Growth");

    const company = (await platformService.listCompanies()).data.find(
      (item) => item.id === MOCK_WORKSPACE_COMPANY_ID,
    );
    expect(company?.planId).toBe(subscriptionPlanSeed[1].id);
    expect(company?.status).toBe("active");
    expect(company?.monthlyRevenue).toBe(6900);

    const payments = readCollection(
      MOCK_COLLECTIONS.platformPayments,
      platformPaymentSeed,
    );
    const recorded = payments.at(-1);
    expect(recorded).toMatchObject({
      companyId: MOCK_WORKSPACE_COMPANY_ID,
      planId: subscriptionPlanSeed[1].id,
      amount: 69000,
      currency: "PHP",
      status: "paid",
      method: "Stripe (demo)",
    });
  });

  it("counts the demo payment in the revenue summary", async () => {
    const before = (await platformService.getRevenueSummary()).data.collectedThisMonth;

    await billingService.startCheckout({ plan: "business", cycle: "monthly" });

    const after = (await platformService.getRevenueSummary()).data.collectedThisMonth;
    expect(after - before).toBe(12900);
  });
});
