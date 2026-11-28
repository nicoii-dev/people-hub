import { MOCK_TODAY, mockUuid } from "@/data/_common";
import {
  platformCompanySeed,
  platformPaymentSeed,
  platformSettingsSeed,
  platformUsageSeed,
  subscriptionPlanSeed,
} from "@/data/platform";
import { assertFound, success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type { BillingCycle } from "@/types/billing";
import type {
  CompanyAccountStatus,
  PlatformCompany,
  PlatformPayment,
  PlatformSettings,
  PlatformSettingsInput,
  PlatformUsage,
  RevenueSummary,
  SubscriptionPlan,
  SubscriptionPlanInput,
} from "@/types/platform";
import {
  MOCK_COLLECTIONS,
  MOCK_VALUES,
  mockDelay,
  readCollection,
  readValue,
  writeCollection,
  writeValue,
} from "./mock/persistence";

const CURRENT_MONTH = MOCK_TODAY.slice(0, 7);

/**
 * Platform administration data is local until the SaaS control-plane API is
 * available. Mutations persist to the same mock store used by the rest of the
 * frontend.
 */
export interface MockPaymentInput {
  companyId: string;
  planId: string;
  amount: number;
  currency: string;
  cycle: BillingCycle;
}

export interface PlatformService {
  listCompanies(): ServiceResult<PlatformCompany[]>;
  setCompanyStatus(id: string, status: CompanyAccountStatus): ServiceResult<PlatformCompany>;
  updateCompanyPlan(id: string, planId: string): ServiceResult<PlatformCompany>;
  recordMockPayment(input: MockPaymentInput): ServiceResult<PlatformPayment>;
  listPlans(): ServiceResult<SubscriptionPlan[]>;
  createPlan(input: SubscriptionPlanInput): ServiceResult<SubscriptionPlan>;
  updatePlan(id: string, input: SubscriptionPlanInput): ServiceResult<SubscriptionPlan>;
  listPayments(): ServiceResult<PlatformPayment[]>;
  getRevenueSummary(): ServiceResult<RevenueSummary>;
  getUsage(): ServiceResult<PlatformUsage>;
  getSettings(): ServiceResult<PlatformSettings>;
  updateSettings(input: PlatformSettingsInput): ServiceResult<PlatformSettings>;
}

function loadCompanies() {
  return readCollection(MOCK_COLLECTIONS.platformCompanies, platformCompanySeed);
}

function loadPlans() {
  return readCollection(MOCK_COLLECTIONS.subscriptionPlans, subscriptionPlanSeed);
}

function loadPayments() {
  return readCollection(MOCK_COLLECTIONS.platformPayments, platformPaymentSeed);
}

function replaceCompany(company: PlatformCompany) {
  const companies = loadCompanies();
  const index = companies.findIndex((item) => item.id === company.id);
  if (index < 0) throw new Error("Company not found");
  const next = [...companies];
  next[index] = company;
  writeCollection(MOCK_COLLECTIONS.platformCompanies, next);
  return company;
}

function replacePlan(plan: SubscriptionPlan) {
  const plans = loadPlans();
  const index = plans.findIndex((item) => item.id === plan.id);
  if (index < 0) throw new Error("Subscription plan not found");
  const next = [...plans];
  next[index] = plan;
  writeCollection(MOCK_COLLECTIONS.subscriptionPlans, next);
  return plan;
}

const mockPlatformService: PlatformService = {
  async listCompanies() {
    await mockDelay(80);
    return success(
      [...loadCompanies()].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)),
      "Registered companies retrieved successfully",
    );
  },

  async setCompanyStatus(id, status) {
    await mockDelay(140);
    const company = assertFound(loadCompanies().find((item) => item.id === id), "Company");
    return success(
      replaceCompany({ ...company, status }),
      `Company ${status === "suspended" ? "suspended" : "activated"} successfully`,
    );
  },

  async updateCompanyPlan(id, planId) {
    await mockDelay(140);
    const company = assertFound(loadCompanies().find((item) => item.id === id), "Company");
    const plan = assertFound(loadPlans().find((item) => item.id === planId), "Subscription plan");
    return success(
      replaceCompany({
        ...company,
        planId,
        status: "active",
        monthlyRevenue: plan.priceMonthly,
      }),
      "Company plan updated successfully",
    );
  },

  async recordMockPayment(input) {
    await mockDelay(120);
    const company = assertFound(
      loadCompanies().find((item) => item.id === input.companyId),
      "Company",
    );
    const payment: PlatformPayment = {
      id: mockUuid(),
      invoiceNumber: `INV-DEMO-${mockUuid().slice(0, 8).toUpperCase()}`,
      companyId: company.id,
      planId: input.planId,
      amount: input.amount,
      currency: input.currency,
      status: "paid",
      method: "Stripe (demo)",
      issuedAt: MOCK_TODAY,
      paidAt: `${MOCK_TODAY}T12:00:00`,
    };
    writeCollection(MOCK_COLLECTIONS.platformPayments, [...loadPayments(), payment]);
    return success(payment, "Demo payment recorded successfully");
  },

  async listPlans() {
    await mockDelay(70);
    return success(
      [...loadPlans()].sort((a, b) => a.priceMonthly - b.priceMonthly),
      "Subscription plans retrieved successfully",
    );
  },

  async createPlan(input) {
    await mockDelay(150);
    const now = new Date().toISOString();
    const plan: SubscriptionPlan = {
      ...input,
      id: mockUuid(),
      createdAt: now,
      updatedAt: now,
    };
    writeCollection(MOCK_COLLECTIONS.subscriptionPlans, [...loadPlans(), plan]);
    return success(plan, "Subscription plan created successfully");
  },

  async updatePlan(id, input) {
    await mockDelay(150);
    const plan = assertFound(loadPlans().find((item) => item.id === id), "Subscription plan");
    return success(
      replacePlan({ ...plan, ...input, updatedAt: new Date().toISOString() }),
      "Subscription plan updated successfully",
    );
  },

  async listPayments() {
    await mockDelay(80);
    return success(
      [...loadPayments()].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
      "Payments retrieved successfully",
    );
  },

  async getRevenueSummary() {
    await mockDelay(90);
    const companies = loadCompanies();
    const plans = loadPlans();
    const payments = loadPayments();
    const activeCompanies = companies.filter((company) => company.status === "active");
    const collectedThisMonth = payments
      .filter(
        (payment) =>
          payment.status === "paid" && payment.paidAt?.slice(0, 7) === CURRENT_MONTH,
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
    const outstanding = payments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const revenueByPlan = plans
      .map((plan) => ({
        planId: plan.id,
        planName: plan.name,
        revenue: activeCompanies
          .filter((company) => company.planId === plan.id)
          .reduce((sum, company) => sum + company.monthlyRevenue, 0),
        companies: activeCompanies.filter((company) => company.planId === plan.id).length,
      }))
      .filter((item) => item.companies > 0)
      .sort((a, b) => b.revenue - a.revenue);

    return success(
      {
        monthlyRecurringRevenue: activeCompanies.reduce(
          (sum, company) => sum + company.monthlyRevenue,
          0,
        ),
        collectedThisMonth,
        outstanding,
        failedPayments: payments.filter((payment) => payment.status === "failed").length,
        revenueByPlan,
      },
      "Revenue summary retrieved successfully",
    );
  },

  async getUsage() {
    await mockDelay(75);
    return success(
      { ...platformUsageSeed, generatedAt: new Date().toISOString() },
      "System usage retrieved successfully",
    );
  },

  async getSettings() {
    await mockDelay(70);
    return success(
      readValue(MOCK_VALUES.platformSettings, platformSettingsSeed),
      "Platform settings retrieved successfully",
    );
  },

  async updateSettings(input) {
    await mockDelay(140);
    const settings = { ...input, updatedAt: new Date().toISOString() };
    writeValue(MOCK_VALUES.platformSettings, settings);
    return success(settings, "Platform settings saved successfully");
  },
};

export const platformService: PlatformService = mockPlatformService;
