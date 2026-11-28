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
  source: "biometric" | "manual" | "time_clock";
  timeInLocation: string | null;
  timeOutLocation: string | null;
  hasTimeInPhoto: boolean;
  hasTimeOutPhoto: boolean;
  /** Data URLs from self-service time-clock responses, when available. */
  timeInPhoto?: string | null;
  timeOutPhoto?: string | null;
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

export interface TimeClockInput {
  /** Human-readable current address, never raw geolocation coordinates. */
  location: string;
  /** JPEG/PNG/WebP data URL captured from the employee's camera. */
  photo?: string;
}
