import { env } from "@/config/env";
import { employeeSeed } from "@/data/employees";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type {
  Employee,
  EmployeeCreateInput,
  EmployeeQueryParams,
  EmployeeStatus,
  EmployeeUpdateInput,
} from "@/types/employee";
import type { ApiSuccess, Paginated, ServiceResult } from "@/types/api";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface EmployeeService {
  list(params?: EmployeeQueryParams): ServiceResult<Paginated<Employee>>;
  getById(id: string): ServiceResult<Employee>;
  create(input: EmployeeCreateInput): ServiceResult<Employee>;
  update(id: string, input: EmployeeUpdateInput): ServiceResult<Employee>;
  archive(id: string): ServiceResult<Employee>;
  setStatus(id: string, status: EmployeeStatus): ServiceResult<Employee>;
}

function loadEmployees() {
  return readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
}

function nextEmployeeNumber(employees: Employee[]) {
  const next = Math.max(0, ...employees.map((employee) => Number(employee.employeeNumber.slice(-3)))) + 1;
  return `PH-2026-${String(next).padStart(3, "0")}`;
}

function nextId(employees: Employee[]) {
  const next = Math.max(0, ...employees.map((employee) => Number(employee.id.replace("EMP-", "")))) + 1;
  return `EMP-${String(next).padStart(3, "0")}`;
}

const mockEmployeeService: EmployeeService = {
  async list(params = {}) {
    await mockDelay();
    const employees = loadEmployees();
    const filtered = employees.filter((employee) => {
      if (params.departmentId && employee.departmentId !== params.departmentId) return false;
      if (params.status && employee.employmentStatus !== params.status) return false;
      if (params.employmentType && employee.employmentType !== params.employmentType) return false;
      return true;
    });
    return paginate(filtered, params, "Employees retrieved successfully");
  },

  async getById(id) {
    await mockDelay(80);
    return success(assertFound(loadEmployees().find((employee) => employee.id === id), "Employee"), "Employee retrieved successfully");
  },

  async create(input) {
    await mockDelay(160);
    const employees = loadEmployees();
    const employee: Employee = {
      ...input,
      id: nextId(employees),
      employeeNumber: nextEmployeeNumber(employees),
      avatarColor: input.avatarColor ?? "#2563eb",
    };
    writeCollection(MOCK_COLLECTIONS.employees, [...employees, employee]);
    return success(employee, "Employee created successfully");
  },

  async update(id, input) {
    await mockDelay(160);
    const employees = loadEmployees();
    const index = employees.findIndex((employee) => employee.id === id);
    if (index < 0) throw new Error("Employee not found");
    const updated = { ...employees[index], ...input, id };
    const next = [...employees];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.employees, next);
    return success(updated, "Employee updated successfully");
  },

  async archive(id) {
    return this.setStatus(id, "archived");
  },

  async setStatus(id, status) {
    await mockDelay(120);
    const employees = loadEmployees();
    const index = employees.findIndex((employee) => employee.id === id);
    if (index < 0) throw new Error("Employee not found");
    const updated = { ...employees[index], employmentStatus: status };
    const next = [...employees];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.employees, next);
    return success(updated, "Employee status updated successfully");
  },
};

const apiEmployeeService: EmployeeService = {
  list: (params) => apiClient.get<Paginated<Employee>>(API_ENDPOINTS.employees, params),
  getById: (id) => apiClient.get<Employee>(`${API_ENDPOINTS.employees}/${id}`),
  create: (input) => apiClient.post<Employee>(API_ENDPOINTS.employees, input),
  update: (id, input) => apiClient.patch<Employee>(`${API_ENDPOINTS.employees}/${id}`, input),
  archive: (id) => apiClient.patch<Employee>(`${API_ENDPOINTS.employees}/${id}/archive`, {}),
  setStatus: (id, status) =>
    apiClient.patch<Employee>(`${API_ENDPOINTS.employees}/${id}/status`, { status }),
};

export const employeeService: EmployeeService = env.useMockData
  ? mockEmployeeService
  : apiEmployeeService;

export type EmployeeListResponse = ApiSuccess<Paginated<Employee>>;
