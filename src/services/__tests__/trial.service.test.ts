import { platformCompanySeed } from "@/data/platform";
import {
  MOCK_COLLECTIONS,
  MOCK_VALUES,
  readCollection,
  readValue,
  resetMockData,
} from "@/services/mock/persistence";
import {
  TRIAL_DAYS,
  mockTrialState,
  saveMockTrial,
  trialService,
} from "@/services/trial.service";
import type { RegisterCompanyInput } from "@/types/trial";

const input: RegisterCompanyInput & { ownerName: string } = {
  email: "juan@example.com",
  password: "Str0ngPassword1",
  firstName: "Juan",
  lastName: "Dela Cruz",
  companyName: "Acme People Systems",
  features: ["employees", "projects", "assignments", "time-entries"],
  ownerName: "Juan Dela Cruz",
};

describe("trial service", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("builds a 14-day trial for the selected features", () => {
    const trial = mockTrialState(input);

    expect(trial.status).toBe("TRIALING");
    expect(trial.daysRemaining).toBe(TRIAL_DAYS);
    expect(trial.features).toEqual(input.features);
    expect(trial.companyId).toMatch(/^[0-9a-f-]{36}$/);
    expect(trial.slug).toBe("acme-people-systems");
    expect(new Date(trial.endsAt!).getTime() - new Date(trial.startedAt!).getTime()).toBe(
      TRIAL_DAYS * 86_400_000,
    );
  });

  it("registers the trial workspace in the platform directory", () => {
    const trial = mockTrialState(input);
    saveMockTrial(trial);

    const companies = readCollection(
      MOCK_COLLECTIONS.platformCompanies,
      platformCompanySeed,
    );
    const registered = companies.find((company) => company.id === trial.companyId);

    expect(registered).toMatchObject({
      name: input.companyName,
      ownerEmail: input.email,
      status: "trial",
      employeeCount: 0,
    });
  });

  it("persists onboarding checklist progress", async () => {
    const trial = mockTrialState(input);
    saveMockTrial(trial);

    expect(trialService.getChecklist()).toEqual({});
    trialService.markComplete("add-employee");
    trialService.markComplete("create-project");

    expect(trialService.getChecklist()).toEqual({
      "add-employee": true,
      "create-project": true,
    });
    expect(readValue(MOCK_VALUES.trial, null)).toMatchObject({
      checklist: {
        "add-employee": true,
        "create-project": true,
      },
    });

    const restored = await trialService.getState();
    expect(restored?.checklist["submit-time-entry"]).toBeUndefined();
    expect(restored?.checklist["add-employee"]).toBe(true);
  });
});
