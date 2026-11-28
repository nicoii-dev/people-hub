import { env } from "@/config/env";
import { MOCK_TODAY, mockUuid } from "@/data/_common";
import {
  platformCompanySeed,
  subscriptionPlanSeed,
} from "@/data/platform";
import { apiRequest } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  MOCK_COLLECTIONS,
  MOCK_VALUES,
  mockDelay,
  readCollection,
  readValue,
  writeCollection,
  writeValue,
} from "@/services/mock/persistence";
import type { PlatformCompany } from "@/types/platform";
import type {
  RegisterCompanyInput,
  TrialChecklist,
  TrialChecklistKey,
  TrialState,
  TrialStatus,
} from "@/types/trial";

export const TRIAL_DAYS = 14;

function slugify(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function startOfToday() {
  return new Date(`${MOCK_TODAY}T00:00:00Z`);
}

export function mockTrialState(
  input: RegisterCompanyInput & { ownerName: string },
): TrialState {
  const startedAt = startOfToday();
  const endsAt = new Date(startedAt.getTime() + TRIAL_DAYS * 86_400_000);
  return {
    active: true,
    status: "TRIALING",
    plan: "STARTER",
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    daysRemaining: TRIAL_DAYS,
    features: [...input.features],
    expired: false,
    companyId: mockUuid(),
    companyName: input.companyName,
    slug: input.slug ?? slugify(input.companyName),
    ownerName: input.ownerName,
    ownerEmail: input.email,
    checklist: {},
  };
}

export function saveMockTrial(state: TrialState) {
  writeValue(MOCK_VALUES.trial, state);
  writeCollection(MOCK_COLLECTIONS.trialChecklist, [state.checklist]);

  const company: PlatformCompany = {
    id: state.companyId,
    name: state.companyName,
    legalName: state.companyName,
    domain: `${state.slug}.example`,
    ownerName: state.ownerName ?? state.companyName,
    ownerEmail: state.ownerEmail ?? `${state.slug}@example.com`,
    planId: subscriptionPlanSeed[0].id,
    status: "trial",
    employeeCount: 0,
    monthlyRevenue: 0,
    country: "Philippines",
    registeredAt: MOCK_TODAY,
    lastActiveAt: MOCK_TODAY,
    avatarColor: "#2563eb",
  };
  const companies = readCollection(
    MOCK_COLLECTIONS.platformCompanies,
    platformCompanySeed,
  );
  writeCollection(MOCK_COLLECTIONS.platformCompanies, [...companies, company]);
}

function loadChecklist(): TrialChecklist {
  const stored = readValue<TrialChecklist[]>(MOCK_VALUES.trialChecklist, []);
  return stored[0] ?? {};
}

function saveChecklist(checklist: TrialChecklist) {
  writeCollection(MOCK_COLLECTIONS.trialChecklist, [checklist]);
  const trial = readValue<TrialState | null>(MOCK_VALUES.trial, null);
  if (trial) writeValue(MOCK_VALUES.trial, { ...trial, checklist });
}

async function apiTrialStatus(companyId?: string): Promise<TrialStatus | null> {
  try {
    const response = await apiRequest<TrialStatus>(
      API_ENDPOINTS.trialStatus(companyId),
    );
    return response.data;
  } catch {
    return null;
  }
}

export const trialService = {
  async getState(companyId?: string): Promise<TrialState | null> {
    if (env.useMockData) {
      await mockDelay(40);
      return readValue<TrialState | null>(MOCK_VALUES.trial, null);
    }
    const status = await apiTrialStatus(companyId);
    if (!status) return null;
    const stored = readValue<Partial<TrialState>>(MOCK_VALUES.trial, {});
    return {
      ...status,
      companyId: stored.companyId ?? "",
      companyName: stored.companyName ?? "Your company",
      slug: stored.slug ?? "",
      ownerName: stored.ownerName,
      ownerEmail: stored.ownerEmail,
      checklist: loadChecklist(),
    };
  },

  getChecklist() {
    return loadChecklist();
  },

  markComplete(key: TrialChecklistKey) {
    const checklist = { ...loadChecklist(), [key]: true };
    saveChecklist(checklist);
    return checklist;
  },

  clear() {
    writeValue(MOCK_VALUES.trial, null);
    writeCollection(MOCK_COLLECTIONS.trialChecklist, [{}]);
  },
};
