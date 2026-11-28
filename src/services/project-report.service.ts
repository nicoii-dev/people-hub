import { MOCK_TODAY } from "@/config/constants";
import { env } from "@/config/env";
import { clientSeed } from "@/data/clients";
import { projectAssignmentSeed, projectSeed } from "@/data/projects";
import { timeEntrySeed } from "@/data/time-entries";
import { toCsv, type CsvValue } from "@/lib/csv";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type {
  ClientReportItem,
  ProjectReportItem,
  ProjectReportQuery,
  ProjectSummaryReport,
} from "@/types/project-report";
import {
  toProjectReportQuery,
  toProjectSummaryReport,
  type BackendRecord,
} from "./api/adapters";
import { ApiRequestError, apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
} from "./mock/persistence";

export interface ProjectReportExport {
  content: string;
  fileName: string;
}

export interface ProjectReportService {
  getReport(query?: ProjectReportQuery): ServiceResult<ProjectSummaryReport>;
  exportReport(query?: ProjectReportQuery): Promise<ProjectReportExport>;
}

type ReportCsvRow = Record<
  | "section"
  | "code"
  | "name"
  | "client"
  | "status"
  | "projects"
  | "assignments"
  | "entries"
  | "duration_minutes"
  | "billable_minutes"
  | "budget",
  CsvValue
>;

function reportRow(
  section: string,
  name: string,
  values: Partial<ReportCsvRow> = {},
): ReportCsvRow {
  return {
    section,
    code: "",
    name,
    client: "",
    status: "",
    projects: "",
    assignments: "",
    entries: "",
    duration_minutes: "",
    billable_minutes: "",
    budget: "",
    ...values,
  };
}

/** Flat, stable row shape shared by the mock and API CSV downloads. */
export function projectReportRows(report: ProjectSummaryReport): ReportCsvRow[] {
  const summary = report.totals;
  const rows: ReportCsvRow[] = [
    reportRow("Summary", "Clients", { projects: summary.clients }),
    reportRow("Summary", "Projects", { projects: summary.projects }),
    reportRow("Summary", "Active projects", { projects: summary.activeProjects }),
    reportRow("Summary", "Completed projects", {
      projects: summary.completedProjects,
    }),
    reportRow("Summary", "Assignments", { assignments: summary.assignments }),
    reportRow("Summary", "Time entries", { entries: summary.entries }),
    reportRow("Summary", "Duration minutes", {
      duration_minutes: summary.durationMinutes,
    }),
    reportRow("Summary", "Billable minutes", {
      billable_minutes: summary.billableMinutes,
    }),
    reportRow("Summary", "Budget", { budget: summary.budget }),
  ];
  for (const client of report.clients) {
    rows.push(
      reportRow("Client", client.name, {
        code: client.code,
        status: client.status,
        projects: client.projectCount,
        duration_minutes: client.durationMinutes,
        billable_minutes: client.billableMinutes,
        budget: client.budget ?? "",
      }),
    );
  }
  for (const project of report.projects) {
    rows.push(
      reportRow("Project", project.name, {
        code: project.code,
        client: project.clientName ?? "",
        status: project.status,
        assignments: project.teamSize,
        entries: project.entryCount,
        duration_minutes: project.durationMinutes,
        billable_minutes: project.billableMinutes,
        budget: project.budget ?? "",
      }),
    );
  }
  return rows;
}

function parseBillable(value: ProjectReportQuery["billable"]): boolean | undefined {
  if (value === undefined) return undefined;
  return typeof value === "boolean" ? value : value === "true";
}

function validDay(value: string, field: "from" | "to"): string {
  const day = value.slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    Number.isNaN(new Date(`${day}T00:00:00.000Z`).getTime())
  ) {
    throw new ApiRequestError(`${field} must be a valid YYYY-MM-DD date`, 400, null);
  }
  return day;
}

async function generateMockReport(
  query: ProjectReportQuery = {},
): ServiceResult<ProjectSummaryReport> {
  const from = query.from ? validDay(query.from, "from") : undefined;
  const to = query.to ? validDay(query.to, "to") : undefined;
  if (from && to && from > to) {
    throw new ApiRequestError("from cannot be after to", 400, null);
  }
  await mockDelay(110);

  const clients = readCollection(MOCK_COLLECTIONS.clients, clientSeed).filter(
    (client) => !client.deletedAt && (!query.clientId || client.id === query.clientId),
  );
  const projects = readCollection(MOCK_COLLECTIONS.projects, projectSeed).filter(
    (project) =>
      !project.deletedAt &&
      (!query.clientId || project.clientId === query.clientId) &&
      (!query.projectId || project.id === query.projectId),
  );
  const projectIds = new Set(projects.map((project) => project.id));
  const billable = parseBillable(query.billable);
  const entries = readCollection(MOCK_COLLECTIONS.timeEntries, timeEntrySeed).filter(
    (entry) =>
      !entry.deletedAt &&
      projectIds.has(entry.projectId) &&
      (!from || entry.workDate >= from) &&
      (!to || entry.workDate <= to) &&
      (billable === undefined || entry.billable === billable),
  );
  const assignments = readCollection(
    MOCK_COLLECTIONS.projectAssignments,
    projectAssignmentSeed,
  ).filter((assignment) => projectIds.has(assignment.projectId));

  const projectItems: ProjectReportItem[] = projects.map((project) => {
    const projectEntries = entries.filter((entry) => entry.projectId === project.id);
    const durationMinutes = projectEntries.reduce(
      (sum, entry) => sum + entry.durationMinutes,
      0,
    );
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      clientId: project.clientId,
      clientName: project.clientName,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      billable: project.billable,
      teamSize: assignments.filter((assignment) => assignment.projectId === project.id).length,
      entryCount: projectEntries.length,
      durationMinutes,
      billableMinutes: projectEntries
        .filter((entry) => entry.billable)
        .reduce((sum, entry) => sum + entry.durationMinutes, 0),
    };
  });

  const clientItems: ClientReportItem[] = clients.map((client) => {
    const clientProjects = projectItems.filter((item) => item.clientId === client.id);
    const budget = clientProjects.reduce((sum, item) => sum + (item.budget ?? 0), 0);
    return {
      id: client.id,
      code: client.code,
      name: client.name,
      status: client.status,
      projectCount: clientProjects.length,
      budget: budget > 0 ? budget : null,
      durationMinutes: clientProjects.reduce((sum, item) => sum + item.durationMinutes, 0),
      billableMinutes: clientProjects.reduce((sum, item) => sum + item.billableMinutes, 0),
    };
  });

  const report: ProjectSummaryReport = {
    generatedAt: MOCK_TODAY,
    filters: {
      from: from ?? null,
      to: to ?? null,
      clientId: query.clientId ?? null,
      projectId: query.projectId ?? null,
      billable: billable ?? null,
    },
    totals: {
      clients: clientItems.length,
      projects: projectItems.length,
      activeProjects: projectItems.filter((item) => item.status === "active").length,
      completedProjects: projectItems.filter((item) => item.status === "completed").length,
      assignments: assignments.length,
      entries: entries.length,
      durationMinutes: projectItems.reduce((sum, item) => sum + item.durationMinutes, 0),
      billableMinutes: projectItems.reduce((sum, item) => sum + item.billableMinutes, 0),
      budget: projectItems.reduce((sum, item) => sum + (item.budget ?? 0), 0),
    },
    clients: clientItems,
    projects: projectItems,
  };
  return success(report, "Project report generated successfully");
}

const mockProjectReportService: ProjectReportService = {
  getReport: generateMockReport,

  async exportReport(query = {}) {
    const response = await generateMockReport(query);
    return {
      content: toCsv(projectReportRows(response.data)),
      fileName: `project-report-${response.data.generatedAt.slice(0, 10)}.csv`,
    };
  },
};

const apiProjectReportService: ProjectReportService = {
  getReport: (query) =>
    apiClient
      .get<BackendRecord>(
        API_ENDPOINTS.projectReport(),
        toProjectReportQuery(query),
      )
      .then((response) => ({
        ...response,
        data: toProjectSummaryReport(response.data),
      })),

  async exportReport(query) {
    const result = await apiClient.download(
      API_ENDPOINTS.projectReportExport(),
      toProjectReportQuery(query),
    );
    return {
      content: result.content,
      fileName: result.fileName ?? "project-report.csv",
    };
  },
};

export const projectReportService: ProjectReportService = env.useMockData
  ? mockProjectReportService
  : apiProjectReportService;
