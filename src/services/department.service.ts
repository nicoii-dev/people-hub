import { env } from "@/config/env";
import { departmentSeed } from "@/data/departments";
import { employeeSeed } from "@/data/employees";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ApiSuccess, ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  Department,
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/types/department";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface DepartmentService {
  list(params?: ListParams): ServiceResult<Paginated<Department>>;
  getById(id: string): ServiceResult<Department>;
  create(input: DepartmentCreateInput): ServiceResult<Department>;
  update(id: string, input: DepartmentUpdateInput): ServiceResult<Department>;
  remove(id: string): ServiceResult<{ id: string }>;
}

function loadDepartments() {
  return readCollection(MOCK_COLLECTIONS.departments, departmentSeed);
}

const mockDepartmentService: DepartmentService = {
  async list(params = {}) {
    await mockDelay(90);
    return paginate(loadDepartments(), { ...params, limit: params.limit ?? 50 }, "Departments retrieved successfully");
  },

  async getById(id) {
    await mockDelay(60);
    return success(assertFound(loadDepartments().find((item) => item.id === id), "Department"), "Department retrieved successfully");
  },

  async create(input) {
    await mockDelay(140);
    const departments = loadDepartments();
    const nextNumber = Math.max(0, ...departments.map((item) => Number(item.id.replace("DEPT-", "")))) + 1;
    const department: Department = {
      ...input,
      id: `DEPT-${String(nextNumber).padStart(3, "0")}`,
      createdAt: "2026-11-22",
    };
    writeCollection(MOCK_COLLECTIONS.departments, [...departments, department]);
    return success(department, "Department created successfully");
  },

  async update(id, input) {
    await mockDelay(140);
    const departments = loadDepartments();
    const index = departments.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Department not found");
    const updated = { ...departments[index], ...input, id };
    const next = [...departments];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.departments, next);
    return success(updated, "Department updated successfully");
  },

  async remove(id) {
    await mockDelay(140);
    const employees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
    if (employees.some((employee) => employee.departmentId === id)) {
      throw new Error("Cannot delete a department with assigned employees");
    }
    const next = loadDepartments().filter((item) => item.id !== id);
    writeCollection(MOCK_COLLECTIONS.departments, next);
    return success({ id }, "Department deleted successfully");
  },
};

const apiDepartmentService: DepartmentService = {
  list: (params) => apiClient.get<Paginated<Department>>(API_ENDPOINTS.departments, params),
  getById: (id) => apiClient.get<Department>(`${API_ENDPOINTS.departments}/${id}`),
  create: (input) => apiClient.post<Department>(API_ENDPOINTS.departments, input),
  update: (id, input) => apiClient.patch<Department>(`${API_ENDPOINTS.departments}/${id}`, input),
  remove: (id) => apiClient.delete<{ id: string }>(`${API_ENDPOINTS.departments}/${id}`),
};

export const departmentService: DepartmentService = env.useMockData
  ? mockDepartmentService
  : apiDepartmentService;

export type DepartmentListResponse = ApiSuccess<Paginated<Department>>;
