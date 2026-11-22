import { env } from "@/config/env";
import { leaveBalanceSeed, leaveSeed } from "@/data/leaves";
import { paginate } from "@/lib/pagination";
import { success } from "@/lib/result";
import type { Paginated, ServiceResult } from "@/types/api";
import type {
  LeaveBalance,
  LeaveCreateInput,
  LeaveQueryParams,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from "@/types/leave";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export const LEAVE_TYPES: LeaveType[] = [
  "Vacation Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
];

export interface LeaveService {
  list(params?: LeaveQueryParams): ServiceResult<Paginated<LeaveRequest>>;
  getById(id: string): ServiceResult<LeaveRequest>;
  create(input: LeaveCreateInput): ServiceResult<LeaveRequest>;
  updateStatus(id: string, status: LeaveStatus, approverId?: string): ServiceResult<LeaveRequest>;
  listBalances(employeeId?: string): ServiceResult<LeaveBalance[]>;
  listTypes(): ServiceResult<LeaveType[]>;
}

function loadLeaves() {
  return readCollection(MOCK_COLLECTIONS.leaves, leaveSeed);
}

const mockLeaveService: LeaveService = {
  async list(params = {}) {
    await mockDelay(100);
    const filtered = loadLeaves().filter((request) => {
      if (params.employeeId && request.employeeId !== params.employeeId) return false;
      if (params.status && request.status !== params.status) return false;
      if (params.type && request.type !== params.type) return false;
      if (params.from && request.endDate < params.from) return false;
      if (params.to && request.startDate > params.to) return false;
      return true;
    });
    return paginate(filtered, params, "Leave requests retrieved successfully");
  },

  async getById(id) {
    await mockDelay(60);
    const request = loadLeaves().find((item) => item.id === id);
    if (!request) throw new Error("Leave request not found");
    return success(request, "Leave request retrieved successfully");
  },

  async create(input) {
    await mockDelay(150);
    const requests = loadLeaves();
    const nextNumber = Math.max(0, ...requests.map((item) => Number(item.id.replace("LEAVE-", "")))) + 1;
    const days = Math.max(
      1,
      Math.round((new Date(`${input.endDate}T00:00:00`).getTime() - new Date(`${input.startDate}T00:00:00`).getTime()) / 86_400_000) + 1,
    );
    const request: LeaveRequest = {
      ...input,
      id: `LEAVE-${String(nextNumber).padStart(3, "0")}`,
      days,
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      createdAt: "2026-11-22T08:00:00",
    };
    writeCollection(MOCK_COLLECTIONS.leaves, [...requests, request]);
    return success(request, "Leave request submitted successfully");
  },

  async updateStatus(id, status, approverId = "EMP-005") {
    await mockDelay(140);
    const requests = loadLeaves();
    const index = requests.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Leave request not found");
    const updated: LeaveRequest = {
      ...requests[index],
      status,
      approvedBy: status === "approved" ? approverId : null,
      approvedAt: status === "approved" ? "2026-11-22T10:00:00" : null,
    };
    const next = [...requests];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.leaves, next);

    if (status === "approved") {
      const balances = readCollection(MOCK_COLLECTIONS.leaveBalances, leaveBalanceSeed);
      const balanceIndex = balances.findIndex(
        (balance) => balance.employeeId === updated.employeeId && balance.type === updated.type,
      );
      if (balanceIndex >= 0) {
        const nextBalances = [...balances];
        nextBalances[balanceIndex] = {
          ...nextBalances[balanceIndex],
          used: nextBalances[balanceIndex].used + updated.days,
          remaining: Math.max(0, nextBalances[balanceIndex].remaining - updated.days),
        };
        writeCollection(MOCK_COLLECTIONS.leaveBalances, nextBalances);
      }
    }

    return success(updated, `Leave request ${status} successfully`);
  },

  async listBalances(employeeId) {
    await mockDelay(80);
    const balances = readCollection(MOCK_COLLECTIONS.leaveBalances, leaveBalanceSeed);
    return success(employeeId ? balances.filter((item) => item.employeeId === employeeId) : balances, "Leave balances retrieved successfully");
  },

  async listTypes() {
    await mockDelay(40);
    return success(LEAVE_TYPES, "Leave types retrieved successfully");
  },
};

const apiLeaveService: LeaveService = {
  list: (params) => apiClient.get<Paginated<LeaveRequest>>(API_ENDPOINTS.leaves, params),
  getById: (id) => apiClient.get<LeaveRequest>(`${API_ENDPOINTS.leaves}/${id}`),
  create: (input) => apiClient.post<LeaveRequest>(API_ENDPOINTS.leaves, input),
  updateStatus: (id, status, approverId) =>
    apiClient.patch<LeaveRequest>(`${API_ENDPOINTS.leaves}/${id}/status`, { status, approverId }),
  listBalances: (employeeId) =>
    apiClient.get<LeaveBalance[]>(API_ENDPOINTS.leaveBalances, employeeId ? { employeeId } : undefined),
  listTypes: () => apiClient.get<LeaveType[]>(`${API_ENDPOINTS.leaves}/types`),
};

export const leaveService: LeaveService = env.useMockData ? mockLeaveService : apiLeaveService;
