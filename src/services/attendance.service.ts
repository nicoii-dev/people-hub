import { env } from "@/config/env";
import { attendanceSeed } from "@/data/attendance";
import { employeeSeed } from "@/data/employees";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { Paginated, ServiceResult } from "@/types/api";
import type {
  AttendanceAdjustmentInput,
  AttendanceQueryParams,
  AttendanceRecord,
  TimeClockInput,
} from "@/types/attendance";
import {
  fromAttendanceAdjustment,
  fromTimeClockInput,
  mapPage,
  toAttendance,
  toAttendanceQuery,
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

export interface AttendanceService {
  list(params?: AttendanceQueryParams): ServiceResult<Paginated<AttendanceRecord>>;
  getById(id: string): ServiceResult<AttendanceRecord>;
  adjust(id: string, input: AttendanceAdjustmentInput): ServiceResult<AttendanceRecord>;
  getToday(employeeId: string): ServiceResult<AttendanceRecord | null>;
  timeIn(employeeId: string, input: TimeClockInput): ServiceResult<AttendanceRecord>;
  timeOut(employeeId: string, input: TimeClockInput): ServiceResult<AttendanceRecord>;
}

function loadAttendance() {
  return readCollection(MOCK_COLLECTIONS.attendance, attendanceSeed);
}

/** Local calendar date so the mock clock matches the date shown in the UI. */
export function todayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function blankTimeClockRecord(
  employeeId: string,
  input: TimeClockInput,
): AttendanceRecord {
  return {
    id: `ATT-${employeeId}-${todayKey().replaceAll("-", "")}`,
    employeeId,
    date: todayKey(),
    timeIn: null,
    timeOut: null,
    breakMinutes: 0,
    status: "present",
    lateMinutes: 0,
    undertimeMinutes: 0,
    overtimeMinutes: 0,
    workLocation: input.location,
    remarks: "Self-service time clock",
    source: "time_clock",
    timeInLocation: input.location,
    timeOutLocation: null,
    hasTimeInPhoto: Boolean(input.photo),
    hasTimeOutPhoto: false,
    timeInPhoto: input.photo ?? null,
    timeOutPhoto: null,
  };
}

const mockAttendanceService: AttendanceService = {
  async list(params = {}) {
    await mockDelay(100);
    const search = params.search?.trim().toLowerCase();
    const employees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
    const filtered = loadAttendance().filter((record) => {
      if (params.employeeId && record.employeeId !== params.employeeId) return false;
      if (params.status && record.status !== params.status) return false;
      if (params.from && record.date < params.from) return false;
      if (params.to && record.date > params.to) return false;

      if (search || params.departmentId) {
        const employee = employees.find((item) => item.id === record.employeeId);
        if (!employee) return false;
        if (params.departmentId && employee.departmentId !== params.departmentId) return false;
        if (search) {
          const haystack = `${employee.firstName} ${employee.lastName} ${employee.employeeNumber}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
      }

      return true;
    });
    return paginate(filtered, params, "Attendance records retrieved successfully");
  },

  async getById(id) {
    await mockDelay(60);
    return success(assertFound(loadAttendance().find((record) => record.id === id), "Attendance record"), "Attendance record retrieved successfully");
  },

  async adjust(id, input) {
    await mockDelay(150);
    const records = loadAttendance();
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) throw new Error("Attendance record not found");
    const updated = { ...records[index], ...input, source: "manual" as const };
    const next = [...records];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.attendance, next);
    return success(updated, "Attendance record adjusted successfully");
  },

  async getToday(employeeId) {
    await mockDelay(60);
    const date = todayKey();
    const record = loadAttendance().find(
      (item) => item.employeeId === employeeId && item.date === date,
    ) ?? null;
    return success(record, "Today's attendance retrieved");
  },

  async timeIn(employeeId, input) {
    await mockDelay(150);
    const records = loadAttendance();
    const date = todayKey();
    const index = records.findIndex(
      (item) => item.employeeId === employeeId && item.date === date,
    );
    if (index >= 0 && records[index]?.timeIn) {
      throw new Error("You have already timed in today");
    }

    const record: AttendanceRecord = records[index]
      ? {
          ...records[index],
          timeIn: new Date().toISOString(),
          workLocation: input.location,
          timeInLocation: input.location,
          hasTimeInPhoto: Boolean(input.photo),
          timeInPhoto: input.photo ?? null,
          source: "time_clock",
          status: "present",
        }
      : {
          ...blankTimeClockRecord(employeeId, input),
          timeIn: new Date().toISOString(),
        };

    const next = [...records];
    if (index >= 0) next[index] = record;
    else next.push(record);
    writeCollection(MOCK_COLLECTIONS.attendance, next);
    return success(record, "Time in recorded");
  },

  async timeOut(employeeId, input) {
    await mockDelay(150);
    const records = loadAttendance();
    const date = todayKey();
    const index = records.findIndex(
      (item) => item.employeeId === employeeId && item.date === date,
    );
    const current = index >= 0 ? records[index] : undefined;
    if (!current?.timeIn) {
      throw new Error("You need to time in before timing out");
    }
    if (current.timeOut) {
      throw new Error("You have already timed out today");
    }

    const record: AttendanceRecord = {
      ...current,
      timeOut: new Date().toISOString(),
      timeOutLocation: input.location,
      hasTimeOutPhoto: Boolean(input.photo),
      timeOutPhoto: input.photo ?? null,
    };
    const next = [...records];
    next[index] = record;
    writeCollection(MOCK_COLLECTIONS.attendance, next);
    return success(record, "Time out recorded");
  },
};

const apiAttendanceService: AttendanceService = {
  list: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(
        API_ENDPOINTS.attendance(),
        toAttendanceQuery(params),
      )
      .then((response) => mapPage(response, toAttendance)),
  getById: (id) =>
    apiClient
      .get<BackendRecord>(API_ENDPOINTS.attendanceRecord(id))
      .then((response) => ({ ...response, data: toAttendance(response.data) })),
  adjust: async (id, input) => {
    const adjustment = await apiClient.post<BackendRecord>(
      API_ENDPOINTS.attendanceAdjustments(id),
      fromAttendanceAdjustment(input),
    );
    const record = await apiClient.get<BackendRecord>(
      API_ENDPOINTS.attendanceRecord(id),
    );
    return {
      ...record,
      message: adjustment.message,
      data: toAttendance(record.data),
    };
  },
  getToday: () =>
    apiClient
      .get<BackendRecord | null>(API_ENDPOINTS.timeClockToday())
      .then((response) => ({
        ...response,
        data: response.data ? toAttendance(response.data) : null,
      })),
  timeIn: (_employeeId, input) =>
    apiClient
      .post<BackendRecord>(
        API_ENDPOINTS.timeClockTimeIn(),
        fromTimeClockInput(input),
      )
      .then((response) => ({ ...response, data: toAttendance(response.data) })),
  timeOut: (_employeeId, input) =>
    apiClient
      .post<BackendRecord>(
        API_ENDPOINTS.timeClockTimeOut(),
        fromTimeClockInput({ ...input, confirm: true }),
      )
      .then((response) => ({ ...response, data: toAttendance(response.data) })),
};

export const attendanceService: AttendanceService = env.useMockData
  ? mockAttendanceService
  : apiAttendanceService;
