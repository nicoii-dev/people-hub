import type { ListParams } from "./api";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type ProjectAssignmentRole = "lead" | "member" | "reviewer";

export interface ProjectTag {
  id: string;
  projectId: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  role: ProjectAssignmentRole;
  assignedById: string | null;
  assignedByName: string | null;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget: number | null;
  billable: boolean;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tags: ProjectTag[];
  assignments: ProjectAssignment[];
}

export interface ProjectCreateInput {
  clientId: string;
  name: string;
  code: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: number;
  billable?: boolean;
}

export type ProjectUpdateInput = Partial<ProjectCreateInput>;

export interface ProjectListParams extends ListParams {
  status?: ProjectStatus | "";
  priority?: ProjectPriority | "";
  clientId?: string;
}

export interface ProjectTagCreateInput {
  name: string;
  color?: string | null;
}

export interface ProjectAssignmentCreateInput {
  employeeId: string;
  role?: ProjectAssignmentRole;
}

/**
 * Mirrors the backend state machine. Cancelled projects are terminal, and a
 * completed project can only be reopened as active.
 */
export const PROJECT_STATUS_TRANSITIONS: Readonly<
  Record<ProjectStatus, readonly ProjectStatus[]>
> = {
  planning: ["active", "cancelled"],
  active: ["on_hold", "completed", "cancelled"],
  on_hold: ["active", "completed", "cancelled"],
  completed: ["active"],
  cancelled: [],
};

export function canChangeProjectStatus(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  return PROJECT_STATUS_TRANSITIONS[from].includes(to);
}
