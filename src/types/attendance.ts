import type { ListParams } from "./api";

export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "half_day"
  | "on_leave"
  | "overtime";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  breakMinutes: number;
  status: AttendanceStatus;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeMinutes: number;
  workLocation: string;
  remarks: string;
  source: "biometric" | "manual";
}

export interface AttendanceQueryParams extends ListParams {
  employeeId?: string;
  departmentId?: string;
  status?: AttendanceStatus;
  from?: string;
  to?: string;
}

export type AttendanceAdjustmentInput = Pick<
  AttendanceRecord,
  "timeIn" | "timeOut" | "breakMinutes" | "status" | "remarks"
>;
