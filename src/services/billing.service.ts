import { env } from "@/config/env";
import { MOCK_WORKSPACE_COMPANY_ID } from "@/data/platform";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import {
  planKeyFromName,
  type BillingCycle,
  type BillingPlanKey,
  type CheckoutInput,
  type CheckoutResult,
} from "@/types/billing";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import { getCompanyId } from "./api/auth-store";
import { mockDelay } from "./mock/persistence";
import { platformService } from "./platform.service";

export interface BillingService {
  startCheckout(input: CheckoutInput): ServiceResult<CheckoutResult>;
}

/**
 * Real checkout lives in the NestJS API. Without keys configured, the frontend
 * simulates the same purchase locally so the workspace remains fully usable.
 */
const mockBillingService: BillingService = {
  async startCheckout(input) {
    await mockDelay(500);

    const plans = (await platformService.listPlans()).data;
    const plan = plans.find((item) => planKeyFromName(item.name) === input.plan);
    if (!plan || plan.status !== "active") {
      throw new Error("That subscription plan is no longer available.");
    }

    const companies = (await platformService.listCompanies()).data;
    const requestedId = input.companyId ?? getCompanyId() ?? env.companyId;
    const company =
      companies.find((item) => item.id === requestedId) ??
      companies.find((item) => item.id === MOCK_WORKSPACE_COMPANY_ID) ??
      companies[0];
    if (!company) throw new Error("No company is selected for checkout.");

    const amount = input.cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
    await platformService.updateCompanyPlan(company.id, plan.id);
    await platformService.recordMockPayment({
      companyId: company.id,
      planId: plan.id,
      amount,
      currency: plan.currency,
      cycle: input.cycle as BillingCycle,
    });

    return success(
      {
        mode: "mock" as const,
        plan: input.plan as BillingPlanKey,
        cycle: input.cycle as BillingCycle,
        planName: plan.name,
      },
      `Demo subscription activated: ${plan.name}`,
    );
  },
};

const apiBillingService: BillingService = {
  async startCheckout(input) {
    const response = await apiClient.post<{
      sessionId: string;
      url: string;
    }>(API_ENDPOINTS.billingCheckout(input.companyId), {
      plan: input.plan,
      cycle: input.cycle,
    });

    if (!response.data?.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return success(
      {
        mode: "redirect" as const,
        url: response.data.url,
        plan: input.plan,
        cycle: input.cycle,
      },
      response.message,
    );
  },
};

export const billingService: BillingService = env.useMockData
  ? mockBillingService
  : apiBillingService;
