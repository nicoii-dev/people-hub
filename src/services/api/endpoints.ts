import { env } from "@/config/env";
import { ApiRequestError } from "./client";
import { getCompanyId } from "./auth-store";

/**
 * Every business route on the API lives below `/companies/:companyId`.
 * The tenant comes from the stored auth session, an explicit env var, or a
 * caller-provided override.
 */
export function resolveCompanyId(companyId?: string): string {
  const resolved = companyId || getCompanyId() || env.companyId;
  if (!resolved) {
    throw new ApiRequestError(
      "No company is selected. Sign in or set NEXT_PUBLIC_COMPANY_ID.",
      400,
      null,
    );
  }
  return resolved;
}

const company = (companyId?: string) =>
  `/companies/${encodeURIComponent(resolveCompanyId(companyId))}`;

export const API_ENDPOINTS = {
  companies: "/companies",
  health: "/health",
  employees: (companyId?: string) => `${company(companyId)}/employees`,
  birthdays: (companyId?: string) => `${company(companyId)}/birthdays`,
  employee: (id: string, companyId?: string) =>
    `${company(companyId)}/employees/${encodeURIComponent(id)}`,
  departments: (companyId?: string) => `${company(companyId)}/departments`,
  department: (id: string, companyId?: string) =>
    `${company(companyId)}/departments/${encodeURIComponent(id)}`,
  positions: (companyId?: string) => `${company(companyId)}/positions`,
  position: (id: string, companyId?: string) =>
    `${company(companyId)}/positions/${encodeURIComponent(id)}`,
  clients: (companyId?: string) => `${company(companyId)}/clients`,
  client: (id: string, companyId?: string) =>
    `${company(companyId)}/clients/${encodeURIComponent(id)}`,
  clientStatus: (id: string, companyId?: string) =>
    `${company(companyId)}/clients/${encodeURIComponent(id)}/status`,
  projects: (companyId?: string) => `${company(companyId)}/projects`,
  project: (id: string, companyId?: string) =>
    `${company(companyId)}/projects/${encodeURIComponent(id)}`,
  projectStatus: (id: string, companyId?: string) =>
    `${company(companyId)}/projects/${encodeURIComponent(id)}/status`,
  projectTags: (projectId: string, companyId?: string) =>
    `${company(companyId)}/projects/${encodeURIComponent(projectId)}/tags`,
  projectTag: (projectId: string, tagId: string, companyId?: string) =>
    `${company(companyId)}/projects/${encodeURIComponent(projectId)}/tags/${encodeURIComponent(tagId)}`,
  projectAssignments: (projectId: string, companyId?: string) =>
    `${company(companyId)}/projects/${encodeURIComponent(projectId)}/assignments`,
  projectAssignment: (
    projectId: string,
    assignmentId: string,
    companyId?: string,
  ) =>
    `${company(companyId)}/projects/${encodeURIComponent(projectId)}/assignments/${encodeURIComponent(assignmentId)}`,
  assignments: (companyId?: string) => `${company(companyId)}/assignments`,
  timeEntries: (companyId?: string) => `${company(companyId)}/time-entries`,
  timeEntry: (id: string, companyId?: string) =>
    `${company(companyId)}/time-entries/${encodeURIComponent(id)}`,
  projectReport: (companyId?: string) =>
    `${company(companyId)}/reports/project-summary`,
  projectReportExport: (companyId?: string) =>
    `${company(companyId)}/reports/project-summary/export`,
  billingCheckout: (companyId?: string) => `${company(companyId)}/billing/checkout`,
  trialStatus: (companyId?: string) => `${company(companyId)}/trial`,
  attendance: (companyId?: string) => `${company(companyId)}/attendance`,
  attendanceRecord: (id: string, companyId?: string) =>
    `${company(companyId)}/attendance/${encodeURIComponent(id)}`,
  attendanceAdjustments: (id: string, companyId?: string) =>
    `${company(companyId)}/attendance/${encodeURIComponent(id)}/adjustments`,
  timeClock: (companyId?: string) => `${company(companyId)}/time-clock`,
  timeClockToday: (companyId?: string) => `${company(companyId)}/time-clock/today`,
  timeClockTimeIn: (companyId?: string) => `${company(companyId)}/time-clock/time-in`,
  timeClockTimeOut: (companyId?: string) => `${company(companyId)}/time-clock/time-out`,
  leaveRequests: (companyId?: string) => `${company(companyId)}/leave-requests`,
  leaveRequest: (id: string, companyId?: string) =>
    `${company(companyId)}/leave-requests/${encodeURIComponent(id)}`,
  leaveDecision: (id: string, decision: string, companyId?: string) =>
    `${company(companyId)}/leave-requests/${encodeURIComponent(id)}/${decision}`,
  leaveTypes: (companyId?: string) => `${company(companyId)}/leave-types`,
  leaveBalances: (companyId?: string) => `${company(companyId)}/leave-balances`,
  payrollPeriods: (companyId?: string) => `${company(companyId)}/payroll/periods`,
  payrollPeriod: (id: string, companyId?: string) =>
    `${company(companyId)}/payroll/periods/${encodeURIComponent(id)}`,
  payrollPeriodAction: (id: string, action: string, companyId?: string) =>
    `${company(companyId)}/payroll/periods/${encodeURIComponent(id)}/${action}`,
  payrollRecords: (companyId?: string) => `${company(companyId)}/payroll/records`,
  payrollRecord: (id: string, companyId?: string) =>
    `${company(companyId)}/payroll/records/${encodeURIComponent(id)}`,
  jobPostings: (companyId?: string) => `${company(companyId)}/job-postings`,
  candidates: (companyId?: string) => `${company(companyId)}/candidates`,
  applications: (companyId?: string) => `${company(companyId)}/applications`,
  applicationAction: (id: string, action: string, companyId?: string) =>
    `${company(companyId)}/applications/${encodeURIComponent(id)}/${action}`,
  interviews: (companyId?: string) => `${company(companyId)}/interviews`,
  reviews: (companyId?: string) => `${company(companyId)}/performance/reviews`,
  review: (id: string, companyId?: string) =>
    `${company(companyId)}/performance/reviews/${encodeURIComponent(id)}`,
  reviewAction: (id: string, action: string, companyId?: string) =>
    `${company(companyId)}/performance/reviews/${encodeURIComponent(id)}/${action}`,
  reviewRatings: (id: string, companyId?: string) =>
    `${company(companyId)}/performance/reviews/${encodeURIComponent(id)}/ratings`,
  goals: (companyId?: string) => `${company(companyId)}/performance/goals`,
  auth: {
    register: "/auth/register",
    registerCompany: "/auth/register-company",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    switchCompany: "/auth/switch-company",
    permissions: "/auth/permissions",
  },
} as const;
