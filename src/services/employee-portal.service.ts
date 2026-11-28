import {
  announcementSeed,
  companyPolicySeed,
  handbookSeed,
  onboardingTaskSeed,
} from "@/data/employee-portal";
import { employeeSeed } from "@/data/employees";
import { companyProfileSeed } from "@/data/settings";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type {
  Announcement,
  CompanyInformation,
  OnboardingSummary,
} from "@/types/employee-portal";
import {
  MOCK_COLLECTIONS,
  MOCK_VALUES,
  mockDelay,
  readCollection,
  readValue,
} from "./mock/persistence";

/**
 * Employee self-service content is local to the client. The API does not
 * expose announcements, onboarding, or handbook records yet, so these screens
 * follow the settings service pattern until dedicated endpoints exist.
 */
export interface EmployeePortalService {
  listAnnouncements(): ServiceResult<Announcement[]>;
  getOnboarding(employeeId: string): ServiceResult<OnboardingSummary>;
  getCompanyInformation(): ServiceResult<CompanyInformation>;
}

const mockEmployeePortalService: EmployeePortalService = {
  async listAnnouncements() {
    await mockDelay(70);
    return success(
      [...announcementSeed].sort((a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        b.publishedAt.localeCompare(a.publishedAt),
      ),
      "Announcements retrieved successfully",
    );
  },

  async getOnboarding(employeeId) {
    await mockDelay(80);
    const employee = readCollection(MOCK_COLLECTIONS.employees, employeeSeed).find(
      (item) => item.id === employeeId,
    );
    const completedCount = onboardingTaskSeed.filter(
      (task) => task.status === "completed",
    ).length;
    const totalCount = onboardingTaskSeed.length;

    return success(
      {
        employeeId,
        completedCount,
        totalCount,
        progressPercent: Math.round((completedCount / totalCount) * 100),
        tasks: onboardingTaskSeed,
        documents: employee?.documents ?? [],
      },
      "Onboarding summary retrieved successfully",
    );
  },

  async getCompanyInformation() {
    await mockDelay(75);
    return success(
      {
        profile: readValue(MOCK_VALUES.companyProfile, companyProfileSeed),
        policies: companyPolicySeed,
        handbook: handbookSeed,
      },
      "Company information retrieved successfully",
    );
  },
};

export const employeePortalService: EmployeePortalService = mockEmployeePortalService;
