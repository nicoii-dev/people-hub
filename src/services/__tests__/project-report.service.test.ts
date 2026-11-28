import { projectSeed } from "@/data/projects";
import { timeEntrySeed } from "@/data/time-entries";
import { projectReportRows, projectReportService } from "../project-report.service";

describe("project report service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("aggregates active clients, projects and time entries from mock data", async () => {
    const result = await projectReportService.getReport();

    expect(result.success).toBe(true);
    expect(result.data.totals.projects).toBe(projectSeed.filter((p) => !p.deletedAt).length);
    expect(result.data.totals.entries).toBe(timeEntrySeed.filter((e) => !e.deletedAt).length);
    expect(result.data.totals.durationMinutes).toBe(
      timeEntrySeed
        .filter((e) => !e.deletedAt)
        .reduce((sum, entry) => sum + entry.durationMinutes, 0),
    );
    expect(result.data.clients.length).toBeGreaterThan(0);
    expect(result.data.projects[0].teamSize).toBeGreaterThanOrEqual(0);
  });

  it("applies project, date and billable filters", async () => {
    const project = projectSeed.find((item) => item.code === "WEBRED");
    expect(project).toBeDefined();
    if (!project) return;

    const result = await projectReportService.getReport({
      projectId: project.id,
      from: "2026-11-16",
      to: "2026-11-18",
      billable: true,
    });

    expect(result.data.projects.map((item) => item.id)).toEqual([project.id]);
    expect(result.data.projects[0].entryCount).toBe(3);
    expect(result.data.projects[0].billableMinutes).toBe(
      result.data.projects[0].durationMinutes,
    );
    expect(result.data.filters).toMatchObject({
      projectId: project.id,
      from: "2026-11-16",
      to: "2026-11-18",
      billable: true,
    });
  });

  it("rejects malformed and reversed date ranges in mock mode", async () => {
    await expect(
      projectReportService.getReport({ from: "2026-13-01" }),
    ).rejects.toThrow(/valid YYYY-MM-DD/);
    await expect(
      projectReportService.getReport({ from: "2026-11-30", to: "2026-11-01" }),
    ).rejects.toThrow(/from cannot be after to/);
  });

  it("exports a CSV containing aligned summary, client and project rows", async () => {
    const project = projectSeed.find((item) => item.code === "APPMVP");
    expect(project).toBeDefined();
    if (!project) return;

    const exported = await projectReportService.exportReport({ projectId: project.id });

    expect(exported.fileName).toMatch(/^project-report-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(exported.content).toContain("duration_minutes");
    expect(exported.content).toContain("Mobile App MVP");
    expect(exported.content).not.toContain("ERP Rollout Phase 1");

    const rows = projectReportRows({
      generatedAt: "2026-11-27T00:00:00.000Z",
      filters: { from: null, to: null, clientId: null, projectId: null, billable: null },
      totals: {
        clients: 1,
        projects: 1,
        activeProjects: 1,
        completedProjects: 0,
        assignments: 0,
        entries: 1,
        durationMinutes: 60,
        billableMinutes: 60,
        budget: 100,
      },
      clients: [],
      projects: [],
    });
    expect(rows[0]).toMatchObject({
      section: "Summary",
      name: "Clients",
      projects: 1,
    });
  });
});
