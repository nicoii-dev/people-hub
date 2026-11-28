import { env } from "@/config/env";
import { departmentSeed } from "@/data/departments";
import { employeeSeed } from "@/data/employees";
import { positionSeed } from "@/data/positions";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ApiSuccess, ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  Department,
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/types/department";
import {
  asRecord,
  fromDepartmentInput,
  mapPage,
  toDepartment,
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
    const positions = readCollection(MOCK_COLLECTIONS.positions, positionSeed);
    if (positions.some((position) => position.departmentId === id)) {
      throw new Error("Cannot delete a department with assigned positions");
    }
    const next = loadDepartments().filter((item) => item.id !== id);
    writeCollection(MOCK_COLLECTIONS.departments, next);
    return success({ id }, "Department deleted successfully");
  },
};

const apiDepartmentService: DepartmentService = {
  list: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(API_ENDPOINTS.departments(), params)
      .then((response) => mapPage(response, toDepartment)),
  getById: (id) =>
    apiClient
      .get<BackendRecord>(API_ENDPOINTS.department(id))
      .then((response) => ({ ...response, data: toDepartment(response.data) })),
  create: (input) =>
    apiClient
      .post<BackendRecord>(API_ENDPOINTS.departments(), fromDepartmentInput(input))
      .then((response) => ({ ...response, data: toDepartment(response.data) })),
  update: (id, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.department(id), fromDepartmentInput(input))
      .then((response) => ({ ...response, data: toDepartment(response.data) })),
  remove: (id) =>
    apiClient
      .delete<BackendRecord>(API_ENDPOINTS.department(id))
      .then((response) => ({
        ...response,
        data: { id: String(asRecord(response.data).id ?? id) },
      })),
};

export const departmentService: DepartmentService = env.useMockData
  ? mockDepartmentService
  : apiDepartmentService;

export type DepartmentListResponse = ApiSuccess<Paginated<Department>>;
