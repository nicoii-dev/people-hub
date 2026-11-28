import type { ListParams } from "./api";

/** A logged block of project work. Distinct from daily Attendance records. */
export interface TimeEntry {
  id: string;
  companyId: string;
  projectId: string;
  projectName: string | null;
  projectCode: string | null;
  employeeId: string;
  employeeNumber: string | null;
  employeeName: string | null;
  /** Calendar day in YYYY-MM-DD form. */
  workDate: string;
  /** ISO timestamps, or null when only a duration was recorded. */
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  billable: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TimeEntryCreateInput {
  projectId: string;
  /** Restricted roles must omit this or send their own employee id. */
  employeeId?: string;
  workDate: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes: number;
  billable?: boolean;
  description?: string | null;
}

export type TimeEntryUpdateInput = Partial<TimeEntryCreateInput>;

export interface TimeEntryListParams extends ListParams {
  employeeId?: string;
  projectId?: string;
  from?: string;
  to?: string;
  billable?: boolean | "true" | "false";
}

export const MAX_TIME_ENTRY_MINUTES = 24 * 60;

export function formatDuration(minutes: number): string {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** Timestamps are stored as UTC ISO strings; show the UTC wall-clock time. */
export function clockTime(value: string | null): string {
  return value && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
    ? value.slice(11, 16)
    : "—";
}
