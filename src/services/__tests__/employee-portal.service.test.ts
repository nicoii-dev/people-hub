import { resetMockData } from "../mock/persistence";
import { employeePortalService } from "../employee-portal.service";

describe("employee portal service", () => {
  beforeEach(() => {
    resetMockData();
  });

  it("returns pinned announcements first", async () => {
    const response = await employeePortalService.listAnnouncements();

    expect(response.success).toBe(true);
    expect(response.data[0].pinned).toBe(true);
    expect(response.data.length).toBeGreaterThan(1);
  });

  it("builds an onboarding summary with documents from the employee record", async () => {
    const response = await employeePortalService.getOnboarding("EMP-003");
    const summary = response.data;

    expect(summary.employeeId).toBe("EMP-003");
    expect(summary.completedCount).toBe(4);
    expect(summary.totalCount).toBe(6);
    expect(summary.progressPercent).toBe(67);
    expect(summary.tasks.some((task) => task.status === "in_progress")).toBe(true);
    expect(summary.documents.map((document) => document.name)).toContain(
      "Employment Contract.pdf",
    );
  });

  it("returns an empty document list for an unknown employee", async () => {
    const response = await employeePortalService.getOnboarding("EMP-999");

    expect(response.data.documents).toEqual([]);
    expect(response.data.tasks.length).toBeGreaterThan(0);
  });

  it("returns company profile, policies, and handbook sections", async () => {
    const response = await employeePortalService.getCompanyInformation();

    expect(response.data.profile.companyName).toBe("PeopleHub");
    expect(response.data.policies.length).toBeGreaterThan(0);
    expect(response.data.handbook.length).toBeGreaterThan(0);
  });
});
