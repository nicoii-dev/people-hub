import type { ListParams } from "./api";

export type LeaveType =
  | "Vacation Leave"
  | "Sick Leave"
  | "Emergency Leave"
  | "Maternity Leave"
  | "Paternity Leave"
  | "Bereavement Leave"
  | "Unpaid Leave";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveCreateInput {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveQueryParams extends ListParams {
  employeeId?: string;
  status?: LeaveStatus;
  type?: LeaveType;
  from?: string;
  to?: string;
}
