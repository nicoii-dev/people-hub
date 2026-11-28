import type { ListParams } from "./api";
import type { Client } from "./client";
import type { ProjectPriority, ProjectStatus } from "./project";

export interface ProjectReportQuery extends ListParams {
  from?: string;
  to?: string;
  clientId?: string;
  projectId?: string;
  billable?: boolean | "true" | "false";
}

export interface ClientReportItem {
  id: string;
  code: string;
  name: string;
  status: Client["status"];
  projectCount: number;
  budget: number | null;
  durationMinutes: number;
  billableMinutes: number;
}

export interface ProjectReportItem {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  billable: boolean;
  teamSize: number;
  entryCount: number;
  durationMinutes: number;
  billableMinutes: number;
}

export interface ProjectReportTotals {
  clients: number;
  projects: number;
  activeProjects: number;
  completedProjects: number;
  assignments: number;
  entries: number;
  durationMinutes: number;
  billableMinutes: number;
  budget: number;
}

export interface ProjectSummaryReport {
  generatedAt: string;
  filters: {
    from: string | null;
    to: string | null;
    clientId: string | null;
    projectId: string | null;
    billable: boolean | null;
  };
  totals: ProjectReportTotals;
  clients: ClientReportItem[];
  projects: ProjectReportItem[];
}
