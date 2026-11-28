import { env } from "@/config/env";
import { mockUuid } from "@/data/_common";
import { employeeSeed } from "@/data/employees";
import { projectSeed } from "@/data/projects";
import { timeEntrySeed } from "@/data/time-entries";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ApiSuccess, Paginated, ServiceResult } from "@/types/api";
import type { Project } from "@/types/project";
import type {
  TimeEntry,
  TimeEntryCreateInput,
  TimeEntryListParams,
  TimeEntryUpdateInput,
} from "@/types/time-entry";
import { MAX_TIME_ENTRY_MINUTES } from "@/types/time-entry";
import {
  asRecord,
  fromTimeEntryInput,
  mapPage,
  toTimeEntry,
  toTimeEntryQuery,
  type BackendRecord,
} from "./api/adapters";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface TimeEntryService {
  list(params?: TimeEntryListParams): ServiceResult<Paginated<TimeEntry>>;
  getById(id: string): ServiceResult<TimeEntry>;
  create(input: TimeEntryCreateInput): ServiceResult<TimeEntry>;
  update(id: string, input: TimeEntryUpdateInput): ServiceResult<TimeEntry>;
  remove(id: string): ServiceResult<{ id: string }>;
}

/* -------------------------------------------------------------------------- */
/* Mock implementation                                                         */
/* -------------------------------------------------------------------------- */

function loadTimeEntries() {
  return readCollection(MOCK_COLLECTIONS.timeEntries, timeEntrySeed);
}

function loadProjects() {
  return readCollection(MOCK_COLLECTIONS.projects, projectSeed);
}

function loadEmployees() {
  return readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
}

function activeEntry(id: string): TimeEntry {
  return assertFound(
    loadTimeEntries().find((entry) => entry.id === id && !entry.deletedAt),
    "Time entry",
  );
}

function loggableProject(id: string): Project {
  const project = loadProjects().find(
    (item) => item.id === id && !item.deletedAt && item.status !== "cancelled",
  );
  if (!project) {
    throw new Error("Project must be active in this company to receive time entries");
  }
  return project;
}

function activeEmployee(id: string) {
  const employee = loadEmployees().find(
    (item) => item.id === id && item.employmentStatus === "active",
  );
  if (!employee) throw new Error("Employee must be active in this company to log time");
  return employee;
}

function validDay(value: string, field: string): string {
  const day = value.slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    Number.isNaN(new Date(`${day}T00:00:00.000Z`).getTime())
  ) {
    throw new Error(`${field} must be a valid YYYY-MM-DD date`);
  }
  return day;
}

function assertNotFuture(day: string, field: string) {
  if (day > new Date().toISOString().slice(0, 10)) {
    throw new Error(`${field} cannot be in the future`);
  }
}

function parseTime(value: string | null | undefined, field: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} must be a valid ISO date-time`);
  }
  return parsed;
}

function assertTimes(input: {
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
}) {
  const hasStart = Boolean(input.startTime);
  const hasEnd = Boolean(input.endTime);
  if (hasStart !== hasEnd) {
    throw new Error("Start time and end time must be provided together");
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1 || input.durationMinutes > MAX_TIME_ENTRY_MINUTES) {
    throw new Error(`Duration must be between 1 and ${MAX_TIME_ENTRY_MINUTES} minutes`);
  }
  if (!hasStart || !hasEnd) return;

  const start = parseTime(input.startTime, "Start time");
  const end = parseTime(input.endTime, "End time");
  if (!start || !end || end <= start) {
    throw new Error("End time must be after start time");
  }
  const span = Math.floor((end.getTime() - start.getTime()) / 60_000);
  if (input.durationMinutes > span) {
    throw new Error("Duration cannot exceed the time between start and end");
  }
}

function validateCreate(input: TimeEntryCreateInput) {
  if (!input.employeeId) throw new Error("Select an employee for this time entry");
  const project = loggableProject(input.projectId);
  const employee = activeEmployee(input.employeeId);
  const workDate = validDay(input.workDate, "Work date");
  assertNotFuture(workDate, "Work date");
  assertTimes({
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    durationMinutes: input.durationMinutes,
  });
  return { project, employee, workDate };
}

const mockTimeEntryService: TimeEntryService = {
  async list(params = {}) {
    await mockDelay(70);
    const from = params.from ? validDay(params.from, "From date") : undefined;
    const to = params.to ? validDay(params.to, "To date") : undefined;
    if (from && to && from > to) throw new Error("From date cannot be after to date");
    const billable =
      params.billable === undefined ? undefined : String(params.billable) === "true";

    const entries = loadTimeEntries().filter(
      (entry) =>
        !entry.deletedAt &&
        (!params.employeeId || entry.employeeId === params.employeeId) &&
        (!params.projectId || entry.projectId === params.projectId) &&
        (!from || entry.workDate >= from) &&
        (!to || entry.workDate <= to) &&
        (billable === undefined || entry.billable === billable),
    );
    return paginate(
      entries,
      {
        ...params,
        sort: params.sort ?? "workDate",
        order: params.order ?? "desc",
        limit: params.limit ?? 50,
      },
      "Time entries retrieved successfully",
    );
  },

  async getById(id) {
    await mockDelay(50);
    return success(activeEntry(id), "Time entry retrieved successfully");
  },

  async create(input) {
    await mockDelay(130);
    const { project, employee, workDate } = validateCreate(input);
    const timestamp = new Date().toISOString();
    const entry: TimeEntry = {
      id: mockUuid(),
      companyId: "demo-company",
      projectId: project.id,
      projectName: project.name,
      projectCode: project.code,
      employeeId: employee.id,
      employeeNumber: employee.employeeNumber,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      workDate,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      durationMinutes: input.durationMinutes,
      billable: input.billable ?? true,
      description: input.description?.trim() || null,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };
    writeCollection(MOCK_COLLECTIONS.timeEntries, [...loadTimeEntries(), entry]);
    return success(entry, "Time entry created successfully");
  },

  async update(id, input) {
    await mockDelay(130);
    const current = activeEntry(id);
    const projectId = input.projectId ?? current.projectId;
    const project = projectId === current.projectId ? null : loggableProject(projectId);
    const employeeId = input.employeeId ?? current.employeeId;
    const employee =
      employeeId === current.employeeId ? null : activeEmployee(employeeId);
    const workDate = input.workDate
      ? validDay(input.workDate, "Work date")
      : current.workDate;
    assertNotFuture(workDate, "Work date");
    assertTimes({
      startTime: input.startTime === undefined ? current.startTime : input.startTime,
      endTime: input.endTime === undefined ? current.endTime : input.endTime,
      durationMinutes: input.durationMinutes ?? current.durationMinutes,
    });

    const updated: TimeEntry = {
      ...current,
      projectId,
      projectName: project?.name ?? current.projectName,
      projectCode: project?.code ?? current.projectCode,
      employeeId,
      employeeNumber: employee?.employeeNumber ?? current.employeeNumber,
      employeeName: employee
        ? `${employee.firstName} ${employee.lastName}`
        : current.employeeName,
      workDate,
      startTime:
        input.startTime === undefined ? current.startTime : input.startTime || null,
      endTime: input.endTime === undefined ? current.endTime : input.endTime || null,
      durationMinutes: input.durationMinutes ?? current.durationMinutes,
      billable: input.billable ?? current.billable,
      description:
        input.description === undefined
          ? current.description
          : input.description?.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    const entries = loadTimeEntries();
    const index = entries.findIndex((entry) => entry.id === id);
    if (index < 0) throw new Error("Time entry not found");
    const next = [...entries];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.timeEntries, next);
    return success(updated, "Time entry updated successfully");
  },

  async remove(id) {
    await mockDelay(120);
    activeEntry(id);
    const timestamp = new Date().toISOString();
    writeCollection(
      MOCK_COLLECTIONS.timeEntries,
      loadTimeEntries().map((entry) =>
        entry.id === id
          ? { ...entry, deletedAt: timestamp, updatedAt: timestamp }
          : entry,
      ),
    );
    return success({ id }, "Time entry deleted successfully");
  },
};

/* -------------------------------------------------------------------------- */
/* API implementation                                                          */
/* -------------------------------------------------------------------------- */

const apiTimeEntryService: TimeEntryService = {
  list: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(
        API_ENDPOINTS.timeEntries(),
        toTimeEntryQuery(params),
      )
      .then((response) => mapPage(response, toTimeEntry)),

  getById: (id) =>
    apiClient
      .get<BackendRecord>(API_ENDPOINTS.timeEntry(id))
      .then((response) => ({ ...response, data: toTimeEntry(response.data) })),

  create: (input) =>
    apiClient
      .post<BackendRecord>(API_ENDPOINTS.timeEntries(), fromTimeEntryInput(input))
      .then((response) => ({ ...response, data: toTimeEntry(response.data) })),

  update: (id, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.timeEntry(id), fromTimeEntryInput(input))
      .then((response) => ({ ...response, data: toTimeEntry(response.data) })),

  remove: (id) =>
    apiClient.delete<BackendRecord>(API_ENDPOINTS.timeEntry(id)).then((response) => ({
      ...response,
      data: { id: String(asRecord(response.data).id ?? id) },
    })),
};

export const timeEntryService: TimeEntryService = env.useMockData
  ? mockTimeEntryService
  : apiTimeEntryService;

export type TimeEntryListResponse = ApiSuccess<Paginated<TimeEntry>>;
