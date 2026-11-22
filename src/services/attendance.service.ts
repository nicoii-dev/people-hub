import { env } from "@/config/env";
import { attendanceSeed } from "@/data/attendance";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { Paginated, ServiceResult } from "@/types/api";
import type {
  AttendanceAdjustmentInput,
  AttendanceQueryParams,
  AttendanceRecord,
} from "@/types/attendance";
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
}

function loadAttendance() {
  return readCollection(MOCK_COLLECTIONS.attendance, attendanceSeed);
}

const mockAttendanceService: AttendanceService = {
  async list(params = {}) {
    await mockDelay(100);
    const filtered = loadAttendance().filter((record) => {
      if (params.employeeId && record.employeeId !== params.employeeId) return false;
      if (params.status && record.status !== params.status) return false;
      if (params.from && record.date < params.from) return false;
      if (params.to && record.date > params.to) return false;
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
};

const apiAttendanceService: AttendanceService = {
  list: (params) => apiClient.get<Paginated<AttendanceRecord>>(API_ENDPOINTS.attendance, params),
  getById: (id) => apiClient.get<AttendanceRecord>(`${API_ENDPOINTS.attendance}/${id}`),
  adjust: (id, input) => apiClient.patch<AttendanceRecord>(`${API_ENDPOINTS.attendance}/${id}/adjust`, input),
};

export const attendanceService: AttendanceService = env.useMockData
  ? mockAttendanceService
  : apiAttendanceService;
