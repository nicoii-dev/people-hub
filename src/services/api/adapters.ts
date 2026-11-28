/**
 * Translation layer between the frontend's mock-shaped view models and the
 * NestJS API's DTOs/responses. Keeping this in one place lets the UI keep its
 * existing types while talking to the real tenant-scoped endpoints.
 */

import { ROLE_LABELS, type Role } from "@/config/permissions";
import type {
  ApiSuccess,
  ListParams,
  Paginated,
} from "@/types/api";
import type {
  AttendanceAdjustmentInput,
  AttendanceQueryParams,
  AttendanceRecord,
  AttendanceStatus,
  TimeClockInput,
} from "@/types/attendance";
import type {
  Department,
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/types/department";
import type {
  Client,
  ClientCreateInput,
  ClientUpdateInput,
} from "@/types/client";
import type {
  Employee,
  EmployeeCreateInput,
  EmployeeQueryParams,
  EmployeeStatus,
  EmployeeUpdateInput,
  EmploymentType,
} from "@/types/employee";
import type {
  LeaveBalance,
  LeaveCreateInput,
  LeaveQueryParams,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from "@/types/leave";
import type { BirthdayList } from "@/types/birthday";
import type {
  GeneratePayrollInput,
  PayrollPeriod,
  PayrollPeriodStatus,
  PayrollQueryParams,
  PayrollRecord,
} from "@/types/payroll";
import type {
  PerformanceGoal,
  PerformanceReview,
  ReviewCreateInput,
} from "@/types/performance";
import type {
  Position,
  PositionCreateInput,
  PositionUpdateInput,
} from "@/types/position";
import type {
  Project,
  ProjectAssignment,
  ProjectAssignmentCreateInput,
  ProjectAssignmentRole,
  ProjectCreateInput,
  ProjectListParams,
  ProjectPriority,
  ProjectStatus,
  ProjectTag,
  ProjectTagCreateInput,
  ProjectUpdateInput,
} from "@/types/project";
import type {
  Application,
  ApplicationQueryParams,
  Candidate,
  Interview,
  JobOpening,
  RecruitmentStage,
} from "@/types/recruitment";
import type {
  ClientReportItem,
  ProjectReportItem,
  ProjectReportQuery,
  ProjectSummaryReport,
} from "@/types/project-report";
import type {
  TimeEntry,
  TimeEntryCreateInput,
  TimeEntryListParams,
  TimeEntryUpdateInput,
} from "@/types/time-entry";
import type { AuthSession, MockUser } from "@/features/auth/types";

export type BackendRecord = Record<string, unknown>;

export function asRecord(value: unknown): BackendRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as BackendRecord)
    : {};
}

function omit<T extends object>(value: T, ...keys: string[]): T {
  const copy = { ...value };
  keys.forEach((key) => delete copy[key as keyof T]);
  return copy;
}

function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function nullableStr(value: unknown): string | null {
  return value === null || value === undefined ? null : str(value);
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function iso(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function day(value: unknown): string {
  return iso(value).slice(0, 10);
}

function enumMap<T extends string>(
  map: Record<string, T>,
  value: unknown,
  fallback: T,
): T {
  const key = str(value).toUpperCase();
  return map[key] ?? fallback;
}

/** The API wraps list results as `{ data: [...], meta }`; the UI reads `data.items`. */
export function mapPage<B, F>(
  result: ApiSuccess<Paginated<B>>,
  mapper: (item: B) => F,
): ApiSuccess<Paginated<F>> {
  return {
    ...result,
    data: {
      items: result.data.items.map(mapper),
      meta: result.data.meta,
    },
  };
}

export function mapList<B, F>(
  result: ApiSuccess<B[]>,
  mapper: (item: B) => F,
): ApiSuccess<F[]> {
  return { ...result, data: result.data.map(mapper) };
}

/* -------------------------------------------------------------------------- */
/* Employees                                                                  */
/* -------------------------------------------------------------------------- */

export const EMPLOYEE_STATUS_TO_API: Record<EmployeeStatus, string> = {
  active: "ACTIVE",
  inactive: "RESIGNED",
  on_leave: "ON_LEAVE",
  archived: "TERMINATED",
};

const API_EMPLOYEE_STATUS: Record<string, EmployeeStatus> = {
  ACTIVE: "active",
  PROBATION: "active",
  ON_LEAVE: "on_leave",
  RESIGNED: "inactive",
  TERMINATED: "inactive",
  RETIRED: "inactive",
};

export function toEmployee(value: unknown): Employee {
  const raw = asRecord(value);
  const address = [
    str(raw.addressLine1),
    str(raw.addressLine2),
    str(raw.city),
    str(raw.province),
    str(raw.postalCode),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: str(raw.id),
    employeeNumber: str(raw.employeeNumber),
    firstName: str(raw.firstName),
    middleName: nullableStr(raw.middleName),
    lastName: str(raw.lastName),
    dateOfBirth: day(raw.dateOfBirth),
    gender: enumMap<Employee["gender"]>(
      { MALE: "Male", FEMALE: "Female" },
      raw.gender,
      "Male",
    ),
    civilStatus: enumMap<Employee["civilStatus"]>(
      {
        SINGLE: "Single",
        MARRIED: "Married",
        DIVORCED: "Divorced",
        WIDOWED: "Widowed",
      },
      raw.civilStatus,
      "Single",
    ),
    nationality: str(raw.nationality, "Philippines"),
    contactNumber: str(raw.phone),
    email: str(raw.email),
    address,
    emergencyContact: { name: "", relationship: "", contactNumber: "" },
    employmentType: enumMap<EmploymentType>(
      {
        FULL_TIME: "Full-time",
        PART_TIME: "Part-time",
        CONTRACT: "Contract",
        INTERN: "Intern",
        MONTHLY: "Full-time",
      },
      raw.payFrequency,
      "Full-time",
    ),
    departmentId: str(raw.departmentId),
    positionId: str(raw.positionId),
    supervisorId: nullableStr(raw.supervisorId),
    dateHired: day(raw.hiredAt),
    employmentStatus: enumMap(
      API_EMPLOYEE_STATUS,
      raw.employmentStatus,
      "active",
    ),
    workLocation: str(raw.city),
    salaryGrade: 0,
    education: [],
    skills: [],
    governmentIds: { sss: "", philhealth: "", pagibig: "", tin: "" },
    documents: [],
    avatarColor: "#2563eb",
  };
}

export function toBirthdayList(value: unknown): BirthdayList {
  const raw = asRecord(value);
  const items = Array.isArray(raw.birthdays) ? raw.birthdays : [];

  return {
    month: num(raw.month),
    monthName: str(raw.monthName),
    count: num(raw.count, items.length),
    birthdays: items.map((item) => {
      const entry = asRecord(item);
      const dateOfBirth = day(entry.dateOfBirth);
      const department = entry.department ? asRecord(entry.department) : null;
      const position = entry.position ? asRecord(entry.position) : null;
      return {
        employeeId: str(entry.employeeId),
        employeeNumber: str(entry.employeeNumber),
        firstName: str(entry.firstName),
        lastName: str(entry.lastName),
        preferredName: nullableStr(entry.preferredName),
        email: nullableStr(entry.email),
        dateOfBirth,
        month: Number(dateOfBirth.slice(5, 7)) || num(entry.month),
        day: Number(dateOfBirth.slice(8, 10)) || num(entry.day),
        department: department?.name ? str(department.name) : null,
        position: position?.title ? str(position.title) : null,
      };
    }),
  };
}

function employeeFields(input: Partial<EmployeeCreateInput>): BackendRecord {
  const fields: BackendRecord = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== "") fields[key] = value;
  };

  assign("firstName", input.firstName);
  assign("lastName", input.lastName);
  assign("middleName", input.middleName);
  assign("email", input.email);
  assign("phone", input.contactNumber);
  assign("dateOfBirth", input.dateOfBirth);
  assign("gender", input.gender ? input.gender.toUpperCase() : undefined);
  assign("civilStatus", input.civilStatus ? input.civilStatus.toUpperCase() : undefined);
  assign("nationality", input.nationality);
  assign("addressLine1", input.address);
  assign("city", input.workLocation);
  assign("hiredAt", input.dateHired);
  if (input.employmentStatus) {
    fields.employmentStatus = EMPLOYEE_STATUS_TO_API[input.employmentStatus];
  }
  assign("departmentId", input.departmentId);
  assign("positionId", input.positionId);
  assign("supervisorId", input.supervisorId);
  return fields;
}

export function fromEmployeeCreate(input: EmployeeCreateInput): BackendRecord {
  return {
    employeeNumber:
      `PH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    ...employeeFields(input),
  };
}

export function fromEmployeeUpdate(input: EmployeeUpdateInput): BackendRecord {
  return employeeFields(input);
}

export function toEmployeeQuery(params: EmployeeQueryParams = {}): ListParams {
  return {
    ...omit(params, "status", "employmentType"),
    ...(params.status
      ? { employmentStatus: EMPLOYEE_STATUS_TO_API[params.status] }
      : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Departments and positions                                                   */
/* -------------------------------------------------------------------------- */

export function toDepartment(value: unknown): Department {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    name: str(raw.name),
    code: str(raw.code),
    description: str(raw.description),
    managerId: nullableStr(raw.managerId),
    parentId: nullableStr(raw.parentId),
    location: "",
    createdAt: day(raw.createdAt),
  };
}

export function fromDepartmentInput(
  input: DepartmentCreateInput | DepartmentUpdateInput,
): BackendRecord {
  const fields: BackendRecord = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };
  assign("name", input.name);
  assign("code", input.code);
  assign("description", input.description);
  assign("managerId", input.managerId);
  assign("parentId", input.parentId);
  return fields;
}

export function toPosition(value: unknown): Position {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    title: str(raw.title),
    code: str(raw.code),
    departmentId: str(raw.departmentId),
    level: enumMap<Position["level"]>(
      {
        JUNIOR: "Junior",
        MID: "Mid",
        SENIOR: "Senior",
        LEAD: "Lead",
        MANAGER: "Manager",
        DIRECTOR: "Director",
      },
      raw.level,
      "Mid",
    ),
    salaryGrade: 0,
    salaryMin: 0,
    salaryMax: 0,
  };
}

export function fromPositionInput(
  input: PositionCreateInput | PositionUpdateInput,
): BackendRecord {
  const fields: BackendRecord = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };
  assign("title", input.title);
  assign("code", input.code);
  assign("departmentId", input.departmentId);
  assign("level", input.level?.toUpperCase());
  return fields;
}

/* -------------------------------------------------------------------------- */
/* Clients                                                                     */
/* -------------------------------------------------------------------------- */

export function toClient(value: unknown): Client {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    name: str(raw.name),
    companyName: str(raw.companyName),
    code: str(raw.code),
    contactName: str(raw.contactName),
    email: str(raw.email),
    phone: str(raw.phone),
    address: str(raw.address),
    industry: str(raw.industry),
    description: str(raw.description),
    status: enumMap<Client["status"]>(
      { ACTIVE: "active", INACTIVE: "inactive" },
      raw.status,
      "active",
    ),
    projectCount: num(raw.projectCount),
    createdAt: day(raw.createdAt),
    updatedAt: day(raw.updatedAt),
    deletedAt: raw.deletedAt ? day(raw.deletedAt) : null,
  };
}

export function fromClientInput(
  input: ClientCreateInput | ClientUpdateInput,
): BackendRecord {
  const fields: BackendRecord = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };
  assign("name", input.name);
  assign("code", input.code);
  assign("companyName", input.companyName);
  assign("contactName", input.contactName);
  assign("email", input.email);
  assign("phone", input.phone);
  assign("address", input.address);
  assign("industry", input.industry);
  assign("description", input.description);
  if (input.status !== undefined) assign("status", input.status.toUpperCase());
  return fields;
}

/** Maps frontend filter values to the backend client query DTO. */
export function toClientQuery(params?: ListParams): ListParams {
  if (!params) return {};
  const status =
    typeof params.status === "string" && params.status
      ? params.status.toUpperCase()
      : undefined;
  return { ...params, status };
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

const API_PROJECT_STATUS: Record<string, ProjectStatus> = {
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const API_PROJECT_PRIORITY: Record<string, ProjectPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const API_ASSIGNMENT_ROLE: Record<string, ProjectAssignmentRole> = {
  LEAD: "lead",
  MEMBER: "member",
  REVIEWER: "reviewer",
};

export function toProjectTag(value: unknown): ProjectTag {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    projectId: str(raw.projectId),
    name: str(raw.name),
    color: nullableStr(raw.color),
    createdAt: iso(raw.createdAt),
    updatedAt: iso(raw.updatedAt),
  };
}

export function toProjectAssignment(value: unknown): ProjectAssignment {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    projectId: str(raw.projectId),
    projectName: str(raw.projectName),
    projectCode: str(raw.projectCode),
    employeeId: str(raw.employeeId),
    employeeNumber: str(raw.employeeNumber),
    employeeName: str(raw.employeeName),
    role: enumMap(API_ASSIGNMENT_ROLE, raw.role, "member"),
    assignedById: nullableStr(raw.assignedById),
    assignedByName: nullableStr(raw.assignedByName),
    assignedAt: iso(raw.assignedAt),
    createdAt: iso(raw.createdAt),
    updatedAt: iso(raw.updatedAt),
  };
}

export function toProject(value: unknown): Project {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    clientId: str(raw.clientId),
    clientName: str(raw.clientName),
    clientCode: str(raw.clientCode),
    name: str(raw.name),
    code: str(raw.code),
    description: str(raw.description),
    status: enumMap(API_PROJECT_STATUS, raw.status, "planning"),
    priority: enumMap(API_PROJECT_PRIORITY, raw.priority, "medium"),
    startDate: day(raw.startDate),
    endDate: day(raw.endDate),
    budget: raw.budget === null || raw.budget === undefined ? null : num(raw.budget),
    billable: Boolean(raw.billable),
    createdById: nullableStr(raw.createdById),
    createdByName: nullableStr(raw.createdByName),
    createdAt: iso(raw.createdAt),
    updatedAt: iso(raw.updatedAt),
    deletedAt: raw.deletedAt ? iso(raw.deletedAt) : null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(toProjectTag) : [],
    assignments: Array.isArray(raw.assignments)
      ? raw.assignments.map(toProjectAssignment)
      : [],
  };
}

export function fromProjectInput(
  input: ProjectCreateInput | ProjectUpdateInput,
): BackendRecord {
  const fields: BackendRecord = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };
  assign("clientId", input.clientId);
  assign("name", input.name);
  assign("code", input.code);
  assign("description", input.description);
  if (input.status !== undefined) assign("status", input.status.toUpperCase());
  if (input.priority !== undefined) assign("priority", input.priority.toUpperCase());
  assign("startDate", input.startDate);
  assign("endDate", input.endDate);
  assign("budget", input.budget);
  assign("billable", input.billable);
  return fields;
}

export function toProjectQuery(params?: ProjectListParams): ListParams {
  if (!params) return {};
  return {
    ...params,
    ...(params.status ? { status: params.status.toUpperCase() } : {}),
    ...(params.priority ? { priority: params.priority.toUpperCase() } : {}),
  };
}

export function fromProjectTagInput(input: ProjectTagCreateInput): BackendRecord {
  return { name: input.name, color: input.color ?? null };
}

export function fromProjectAssignmentInput(
  input: ProjectAssignmentCreateInput,
): BackendRecord {
  return {
    employeeId: input.employeeId,
    ...(input.role ? { role: input.role.toUpperCase() } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Time entries                                                                */
/* -------------------------------------------------------------------------- */

export function toTimeEntry(value: unknown): TimeEntry {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    companyId: str(raw.companyId),
    projectId: str(raw.projectId),
    projectName: nullableStr(raw.projectName),
    projectCode: nullableStr(raw.projectCode),
    employeeId: str(raw.employeeId),
    employeeNumber: nullableStr(raw.employeeNumber),
    employeeName: nullableStr(raw.employeeName),
    workDate: day(raw.workDate),
    startTime: nullableStr(raw.startTime),
    endTime: nullableStr(raw.endTime),
    durationMinutes: num(raw.durationMinutes),
    billable: Boolean(raw.billable),
    description: nullableStr(raw.description),
    createdAt: iso(raw.createdAt),
    updatedAt: iso(raw.updatedAt),
    deletedAt: raw.deletedAt ? iso(raw.deletedAt) : null,
  };
}

export function fromTimeEntryInput(
  input: TimeEntryCreateInput | TimeEntryUpdateInput,
): BackendRecord {
  const fields: BackendRecord = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };
  assign("projectId", input.projectId);
  assign("employeeId", input.employeeId);
  assign("workDate", input.workDate);
  assign("startTime", input.startTime);
  assign("endTime", input.endTime);
  assign("durationMinutes", input.durationMinutes);
  assign("billable", input.billable);
  assign("description", input.description);
  return fields;
}

export function toTimeEntryQuery(params: TimeEntryListParams = {}): ListParams {
  return {
    ...params,
    ...(params.billable !== undefined ? { billable: String(params.billable) } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Project reports                                                             */
/* -------------------------------------------------------------------------- */

export function toProjectSummaryReport(value: unknown): ProjectSummaryReport {
  const raw = asRecord(value);
  const filters = asRecord(raw.filters);
  const totals = asRecord(raw.totals);
  const clients = (Array.isArray(raw.clients) ? raw.clients : []).map((item) => {
    const client = asRecord(item);
    return {
      id: str(client.id),
      code: str(client.code),
      name: str(client.name),
      status: enumMap({ ACTIVE: "active", INACTIVE: "inactive" }, client.status, "active") as ClientReportItem["status"],
      projectCount: num(client.projectCount),
      budget: client.budget === null || client.budget === undefined ? null : num(client.budget),
      durationMinutes: num(client.durationMinutes),
      billableMinutes: num(client.billableMinutes),
    } satisfies ClientReportItem;
  });
  const projects = (Array.isArray(raw.projects) ? raw.projects : []).map((item) => {
    const project = asRecord(item);
    return {
      id: str(project.id),
      code: str(project.code),
      name: str(project.name),
      clientId: str(project.clientId),
      clientName: nullableStr(project.clientName),
      status: enumMap(API_PROJECT_STATUS, project.status, "planning"),
      priority: enumMap(API_PROJECT_PRIORITY, project.priority, "medium"),
      startDate: project.startDate ? day(project.startDate) : null,
      endDate: project.endDate ? day(project.endDate) : null,
      budget: project.budget === null || project.budget === undefined ? null : num(project.budget),
      billable: Boolean(project.billable),
      teamSize: num(project.teamSize),
      entryCount: num(project.entryCount),
      durationMinutes: num(project.durationMinutes),
      billableMinutes: num(project.billableMinutes),
    } satisfies ProjectReportItem;
  });

  return {
    generatedAt: iso(raw.generatedAt),
    filters: {
      from: filters.from ? day(filters.from) : null,
      to: filters.to ? day(filters.to) : null,
      clientId: nullableStr(filters.clientId),
      projectId: nullableStr(filters.projectId),
      billable: filters.billable === null || filters.billable === undefined ? null : Boolean(filters.billable),
    },
    totals: {
      clients: num(totals.clients),
      projects: num(totals.projects),
      activeProjects: num(totals.activeProjects),
      completedProjects: num(totals.completedProjects),
      assignments: num(totals.assignments),
      entries: num(totals.entries),
      durationMinutes: num(totals.durationMinutes),
      billableMinutes: num(totals.billableMinutes),
      budget: num(totals.budget),
    },
    clients,
    projects,
  };
}

export function toProjectReportQuery(params: ProjectReportQuery = {}): ListParams {
  return {
    ...params,
    ...(params.billable !== undefined ? { billable: String(params.billable) } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                  */
/* -------------------------------------------------------------------------- */

const API_ATTENDANCE_STATUS: Record<string, AttendanceStatus> = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
  HOLIDAY: "on_leave",
};

const ATTENDANCE_STATUS_TO_API: Record<AttendanceStatus, string> = {
  present: "PRESENT",
  late: "LATE",
  absent: "ABSENT",
  half_day: "HALF_DAY",
  on_leave: "ON_LEAVE",
  overtime: "PRESENT",
};

export function toAttendance(value: unknown): AttendanceRecord {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    employeeId: str(raw.employeeId),
    date: day(raw.date),
    timeIn: nullableStr(raw.timeIn),
    timeOut: nullableStr(raw.timeOut),
    breakMinutes: num(raw.breakMinutes),
    status: enumMap(API_ATTENDANCE_STATUS, raw.status, "present"),
    lateMinutes: num(raw.lateMinutes),
    undertimeMinutes: num(raw.undertimeMinutes),
    overtimeMinutes: num(raw.overtimeMinutes),
    workLocation: nullableStr(raw.timeInLocation ?? raw.workLocation) ?? "",
    remarks: str(raw.remarks),
    source:
      str(raw.source).toUpperCase() === "BIOMETRIC"
        ? "biometric"
        : str(raw.source).toUpperCase() === "TIME_CLOCK"
          ? "time_clock"
          : "manual",
    timeInLocation: nullableStr(raw.timeInLocation),
    timeOutLocation: nullableStr(raw.timeOutLocation),
    hasTimeInPhoto: Boolean(raw.hasTimeInPhoto),
    hasTimeOutPhoto: Boolean(raw.hasTimeOutPhoto),
    timeInPhoto: nullableStr(raw.timeInPhoto),
    timeOutPhoto: nullableStr(raw.timeOutPhoto),
  };
}

export function toAttendanceQuery(params: AttendanceQueryParams = {}): ListParams {
  return {
    ...omit(params, "departmentId", "status"),
    ...(params.status
      ? { status: ATTENDANCE_STATUS_TO_API[params.status] }
      : {}),
  };
}

export function fromAttendanceAdjustment(input: AttendanceAdjustmentInput): BackendRecord {
  return {
    reason: "Correction requested from PeopleHub",
    newValues: {
      ...(input.timeIn ? { timeIn: input.timeIn } : {}),
      ...(input.timeOut ? { timeOut: input.timeOut } : {}),
      ...(input.breakMinutes !== undefined
        ? { breakMinutes: input.breakMinutes }
        : {}),
      ...(input.status
        ? { status: ATTENDANCE_STATUS_TO_API[input.status] }
        : {}),
      ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
    },
  };
}

export function fromTimeClockInput(
  input: TimeClockInput & { confirm?: boolean },
): BackendRecord {
  return {
    location: input.location,
    ...(input.photo ? { photo: input.photo } : {}),
    ...(input.confirm !== undefined ? { confirm: input.confirm } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Leaves                                                                      */
/* -------------------------------------------------------------------------- */

const API_LEAVE_STATUS: Record<string, LeaveStatus> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

const LEAVE_STATUS_TO_API: Record<LeaveStatus, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
  cancelled: "CANCELLED",
};

const KNOWN_LEAVE_TYPES: LeaveType[] = [
  "Vacation Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
];

export const LEAVE_TYPE_NAMES = KNOWN_LEAVE_TYPES;

function leaveTypeName(value: unknown): LeaveType {
  const name = str(asRecord(value).name);
  return KNOWN_LEAVE_TYPES.find((type) => type.toLowerCase() === name.toLowerCase())
    ?? (KNOWN_LEAVE_TYPES[0] as LeaveType);
}

export function toLeaveRequest(value: unknown): LeaveRequest {
  const raw = asRecord(value);
  const approvals = Array.isArray(raw.approvals)
    ? raw.approvals.map(asRecord)
    : [];
  const approval = approvals.find(
    (item) => str(item.status).toUpperCase() === "APPROVED",
  );

  return {
    id: str(raw.id),
    employeeId: str(raw.employeeId),
    type: leaveTypeName(raw.leaveType),
    startDate: day(raw.startDate),
    endDate: day(raw.endDate),
    days: num(raw.days),
    reason: str(raw.reason),
    status: enumMap(API_LEAVE_STATUS, raw.status, "pending"),
    approvedBy: approval ? str(approval.approverId) : null,
    approvedAt: approval ? iso(approval.actedAt) : null,
    rejectionReason: null,
    createdAt: iso(raw.createdAt),
  };
}

export function toLeaveTypeNames(values: unknown[]): LeaveType[] {
  return values.map(leaveTypeName);
}

export function toLeaveBalance(value: unknown): LeaveBalance {
  const raw = asRecord(value);
  return {
    employeeId: str(raw.employeeId),
    type: leaveTypeName(raw.leaveType),
    total: num(raw.openingBalance) + num(raw.accrued),
    used: num(raw.used),
    remaining: num(raw.available),
  };
}

export function toLeaveQuery(params: LeaveQueryParams = {}): ListParams {
  return {
    ...omit(params, "type"),
    ...(params.status ? { status: LEAVE_STATUS_TO_API[params.status] } : {}),
  };
}

export function leaveTypeIdFor(
  type: LeaveType,
  leaveTypes: unknown[],
): string | undefined {
  const match = leaveTypes.find(
    (value) => leaveTypeName(value).toLowerCase() === type.toLowerCase(),
  );
  return match ? str(asRecord(match).id) : undefined;
}

export function leaveDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function fromLeaveCreate(
  input: LeaveCreateInput,
  leaveTypeId: string,
): BackendRecord {
  return {
    ...(input.employeeId ? { employeeId: input.employeeId } : {}),
    leaveTypeId,
    startDate: input.startDate,
    endDate: input.endDate,
    days: leaveDays(input.startDate, input.endDate),
    reason: input.reason,
  };
}

export function leaveDecisionFor(status: LeaveStatus): string | null {
  if (status === "approved") return "approve";
  if (status === "rejected") return "reject";
  if (status === "cancelled") return "cancel";
  return null;
}

/* -------------------------------------------------------------------------- */
/* Payroll                                                                     */
/* -------------------------------------------------------------------------- */

const API_PERIOD_STATUS: Record<string, PayrollPeriodStatus> = {
  DRAFT: "draft",
  GENERATED: "preview",
  APPROVED: "processed",
  PROCESSED: "processed",
  PAID: "paid",
  CANCELLED: "draft",
};

export function toPayrollPeriod(value: unknown): PayrollPeriod {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    label: str(raw.name),
    startDate: day(raw.startDate),
    endDate: day(raw.endDate),
    status: enumMap(API_PERIOD_STATUS, raw.status, "draft"),
    generatedAt: nullableStr(raw.processedAt ?? raw.calculatedAt),
  };
}

const PERIOD_STATUS_TO_ACTION: Partial<Record<PayrollPeriodStatus, string>> = {
  preview: "generate",
  processed: "process",
  paid: "paid",
  draft: "cancel",
};

export function payrollActionForStatus(status: PayrollPeriodStatus): string | null {
  return PERIOD_STATUS_TO_ACTION[status] ?? null;
}

function earningTotal(earnings: unknown[], keyword: string): number {
  return earnings.reduce<number>((total, value) => {
    const earning = asRecord(value);
    return str(earning.code).toLowerCase().includes(keyword)
      ? total + num(earning.amount)
      : total;
  }, 0);
}

export function toPayrollRecord(value: unknown): PayrollRecord {
  const raw = asRecord(value);
  const earnings = Array.isArray(raw.earnings) ? raw.earnings : [];
  const deductions = Array.isArray(raw.deductions) ? raw.deductions : [];
  const deductionTotal = (keyword: string) =>
    deductions.reduce(
      (total, item) =>
        str(asRecord(item).code).toLowerCase().includes(keyword)
          ? total + num(asRecord(item).amount)
          : total,
      0,
    );

  return {
    id: str(raw.id),
    periodId: str(raw.periodId),
    employeeId: str(raw.employeeId),
    basicSalary: num(raw.basicSalary),
    allowances: earningTotal(earnings, "allow"),
    overtimePay: earningTotal(earnings, "overtime"),
    bonuses: earningTotal(earnings, "bonus"),
    deductions: num(raw.totalDeductions) - deductionTotal("tax"),
    taxDeductions: deductionTotal("tax"),
    governmentContributions: {
      sss: deductionTotal("sss"),
      philhealth: deductionTotal("philhealth"),
      pagibig: deductionTotal("pagibig"),
    },
    netPay: num(raw.netPay),
    generatedAt: iso(raw.calculatedAt ?? raw.createdAt),
  };
}

export function toPayrollQuery(params: PayrollQueryParams = {}): ListParams {
  return omit(params, "search");
}

export function fromPayrollGeneration(input: GeneratePayrollInput): BackendRecord {
  return {
    ...(input.employeeIds?.length ? { employeeIds: input.employeeIds } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Recruitment                                                                 */
/* -------------------------------------------------------------------------- */

export function toJobOpening(value: unknown): JobOpening {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    title: str(raw.title),
    departmentId: str(raw.departmentId),
    positionId: str(raw.positionId),
    location: str(raw.location),
    employmentType: enumMap<JobOpening["employmentType"]>(
      {
        FULL_TIME: "Full-time",
        PART_TIME: "Part-time",
        CONTRACT: "Contract",
      },
      raw.employmentType,
      "Full-time",
    ),
    salaryMin: num(raw.salaryMin),
    salaryMax: num(raw.salaryMax),
    status: enumMap<JobOpening["status"]>(
      {
        DRAFT: "open",
        OPEN: "open",
        ON_HOLD: "on_hold",
        CLOSED: "closed",
        CANCELLED: "closed",
      },
      raw.status,
      "open",
    ),
    postedAt: iso(raw.publishedAt ?? raw.createdAt),
    description: str(raw.description),
  };
}

export function toCandidate(value: unknown): Candidate {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    firstName: str(raw.firstName),
    lastName: str(raw.lastName),
    email: str(raw.email),
    contactNumber: str(raw.phone),
    location: "",
    resumeName: str(raw.resumeFileKey),
    yearsOfExperience: 0,
    appliedAt: iso(raw.createdAt),
    avatarColor: "#2563eb",
  };
}

const API_APPLICATION_STATUS: Record<string, RecruitmentStage> = {
  APPLIED: "applied",
  SCREENING: "screening",
  INTERVIEW: "interview",
  OFFER: "offered",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "rejected",
};

export function toApplication(value: unknown): Application {
  const raw = asRecord(value);
  return {
    id: str(raw.id),
    jobId: str(raw.jobPostingId),
    candidateId: str(raw.candidateId),
    stage: enumMap(API_APPLICATION_STATUS, raw.status, "applied"),
    rating: null,
    notes: str(raw.notes),
    updatedAt: iso(raw.updatedAt),
  };
}

export function toInterview(value: unknown): Interview {
  const raw = asRecord(value);
  const mode: Interview["mode"] = raw.meetingUrl
    ? "Video call"
    : str(raw.location)
      ? "Onsite"
      : "Phone";

  return {
    id: str(raw.id),
    applicationId: str(raw.applicationId),
    scheduledAt: iso(raw.scheduledAt),
    interviewerId: str(raw.interviewerId),
    mode,
    status: enumMap<Interview["status"]>(
      {
        SCHEDULED: "scheduled",
        RESCHEDULED: "scheduled",
        COMPLETED: "completed",
        CANCELLED: "cancelled",
      },
      raw.status,
      "scheduled",
    ),
  };
}

const APPLICATION_STAGE_TO_API: Record<RecruitmentStage, string> = {
  applied: "APPLIED",
  screening: "SCREENING",
  interview: "INTERVIEW",
  assessment: "INTERVIEW",
  offered: "OFFER",
  hired: "HIRED",
  rejected: "REJECTED",
};

export function toApplicationQuery(params: ApplicationQueryParams = {}): ListParams {
  return {
    ...omit(params, "jobId", "stage", "search"),
    ...(params.jobId ? { jobPostingId: params.jobId } : {}),
    ...(params.stage ? { status: APPLICATION_STAGE_TO_API[params.stage] } : {}),
  };
}

export function applicationActionForStage(stage: RecruitmentStage): string | null {
  switch (stage) {
    case "screening":
      return "screen";
    case "offered":
      return "offer";
    case "rejected":
      return "reject";
    case "hired":
      return "hire";
    default:
      return null;
  }
}

export function fromHireApplication(): BackendRecord {
  return {
    employeeNumber: `PH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  };
}

export function fromScheduleInterview(
  applicationId: string,
  scheduledAt: string,
  interviewerId: string,
): BackendRecord {
  return { applicationId, scheduledAt, interviewerId };
}

/* -------------------------------------------------------------------------- */
/* Performance                                                                 */
/* -------------------------------------------------------------------------- */

const API_REVIEW_STATUS = {
  DRAFT: "draft",
  IN_PROGRESS: "submitted",
  SUBMITTED: "submitted",
  APPROVED: "acknowledged",
  CLOSED: "acknowledged",
} as const;

export function toPerformanceReview(value: unknown): PerformanceReview {
  const raw = asRecord(value);
  const ratings = Array.isArray(raw.ratings) ? raw.ratings.map(asRecord) : [];
  const rating = Math.min(
    5,
    Math.max(1, Math.round(num(raw.overallRating, 3))),
  ) as PerformanceReview["rating"];
  const summary = str(raw.summary);

  return {
    id: str(raw.id),
    employeeId: str(raw.employeeId),
    reviewerId: str(raw.reviewerId),
    period: `${day(raw.periodStart)} to ${day(raw.periodEnd)}`,
    kpis: ratings.map((item) => ({
      id: str(item.id),
      name: str(item.criteria),
      target: str(item.maxRating, "5"),
      actual: str(item.rating),
      score: num(item.rating),
    })),
    rating,
    strengths: summary,
    improvements: "",
    managerComments: summary,
    status: enumMap(API_REVIEW_STATUS, raw.status, "draft"),
    submittedAt: nullableStr(raw.submittedAt),
  };
}

export function toPerformanceGoal(value: unknown): PerformanceGoal {
  const raw = asRecord(value);
  const target = num(raw.targetValue);
  const actual = num(raw.actualValue);
  return {
    id: str(raw.id),
    employeeId: str(raw.employeeId),
    title: str(raw.title),
    description: str(raw.description),
    dueDate: day(raw.dueAt),
    progress: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0,
    status: enumMap<PerformanceGoal["status"]>(
      {
        DRAFT: "on_track",
        ACTIVE: "on_track",
        COMPLETED: "completed",
        CANCELLED: "at_risk",
      },
      raw.status,
      "on_track",
    ),
  };
}

export function toReviewQuery(params: ListParams = {}): ListParams {
  return {
    ...omit(params, "search", "status"),
    ...(params.status ? { status: String(params.status).toUpperCase() } : {}),
  };
}

function reviewDates(period: string): { periodStart: string; periodEnd: string } {
  const parts = period.split(/\s+to\s+/i);
  if (parts.length === 2 && day(parts[0]) === parts[0] && day(parts[1]) === parts[1]) {
    return { periodStart: parts[0] ?? "", periodEnd: parts[1] ?? "" };
  }

  const parsed = new Date(period);
  const start = Number.isNaN(parsed.getTime())
    ? new Date(new Date().getFullYear(), 0, 1)
    : parsed;
  const end = new Date(start);
  end.setMonth(end.getMonth() + 3);
  return { periodStart: day(start), periodEnd: day(end) };
}

export function fromReviewCreate(
  input: ReviewCreateInput,
): { body: BackendRecord; ratings: BackendRecord[] } {
  const dates = reviewDates(input.period);
  return {
    body: {
      employeeId: input.employeeId,
      reviewerId: input.reviewerId,
      ...dates,
      summary: [input.strengths, input.improvements, input.managerComments]
        .filter(Boolean)
        .join("\n\n"),
      overallRating: input.rating,
    },
    ratings: input.kpis.map((kpi) => ({
      criteria: kpi.name,
      rating: kpi.score,
      maxRating: 5,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

const API_ROLE_TO_FRONTEND: Record<string, Role> = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  COMPANY_ADMIN: "admin",
  HR_ADMINISTRATOR: "admin", // legacy key kept for existing databases
  HR_ADMIN: "admin",
  HR_HEAD: "hr_head",
  HR_STAFF: "hr_staff",
  FINANCE_HEAD: "finance_head",
  FINANCE_STAFF: "finance_staff",
  DEPARTMENT_MANAGER: "department_manager",
  EMPLOYEE: "employee",
};

export function toAuthSession(value: unknown): AuthSession {
  const raw = asRecord(value);
  const user = asRecord(raw.user);
  const activeCompany = asRecord(raw.activeCompany);
  const roles = Array.isArray(raw.roles) ? raw.roles.map(String) : [];
  const roleKeys = Array.isArray(activeCompany.roleKeys)
    ? activeCompany.roleKeys.map(String)
    : roles;
  const role = roleKeys
    .map((item) => API_ROLE_TO_FRONTEND[item.toUpperCase()])
    .find((item): item is Role => Boolean(item)) ?? "employee";

  const employee = asRecord(user.employee);
  const mappedUser: MockUser = {
    id: str(user.id),
    firstName: str(user.firstName),
    lastName: str(user.lastName),
    email: str(user.email),
    role,
    employeeId: str(user.employeeId ?? employee.id),
    title: ROLE_LABELS[role],
    avatarColor: "#2563eb",
  };

  return { user: mappedUser, authenticated: true };
}

export function activeCompanyId(value: unknown): string | null {
  const activeCompany = asRecord(asRecord(value).activeCompany);
  return activeCompany.id ? str(activeCompany.id) : null;
}
