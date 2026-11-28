export type CompanyAccountStatus = "active" | "trial" | "suspended";
export type SubscriptionPlanStatus = "active" | "archived";
export type PlatformPaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface PlatformCompany {
  id: string;
  name: string;
  legalName: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  planId: string;
  status: CompanyAccountStatus;
  employeeCount: number;
  monthlyRevenue: number;
  country: string;
  registeredAt: string;
  lastActiveAt: string;
  avatarColor: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  employeeLimit: number;
  features: string[];
  status: SubscriptionPlanStatus;
  popular: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlanInput = Pick<
  SubscriptionPlan,
  | "name"
  | "description"
  | "currency"
  | "priceMonthly"
  | "priceYearly"
  | "employeeLimit"
  | "features"
  | "status"
  | "popular"
>;

export interface PlatformPayment {
  id: string;
  invoiceNumber: string;
  companyId: string;
  planId: string;
  amount: number;
  currency: string;
  status: PlatformPaymentStatus;
  method: string;
  issuedAt: string;
  paidAt: string | null;
}

export interface RevenueByPlan {
  planId: string;
  planName: string;
  revenue: number;
  companies: number;
}

export interface RevenueSummary {
  monthlyRecurringRevenue: number;
  collectedThisMonth: number;
  outstanding: number;
  failedPayments: number;
  revenueByPlan: RevenueByPlan[];
}

export interface UsagePoint {
  label: string;
  activeUsers: number;
  apiRequests: number;
  storageGb: number;
}

export interface TopCompanyUsage {
  companyId: string;
  companyName: string;
  activeUsers: number;
  apiRequests: number;
  storageGb: number;
}

export interface PlatformUsage {
  period: string;
  generatedAt: string;
  totals: {
    activeCompanies: number;
    trialCompanies: number;
    suspendedCompanies: number;
    activeUsers: number;
    apiRequests: number;
    storageGb: number;
    uptimePercent: number;
  };
  trend: UsagePoint[];
  topCompanies: TopCompanyUsage[];
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  billingEmail: string;
  defaultPlanId: string;
  defaultCurrency: string;
  timezone: string;
  sessionTimeoutMinutes: number;
  allowSignups: boolean;
  maintenanceMode: boolean;
  updatedAt: string;
}

export type PlatformSettingsInput = Omit<PlatformSettings, "updatedAt">;
