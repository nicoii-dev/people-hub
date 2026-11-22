import { env } from "@/config/env";
import { employeeSeed } from "@/data/employees";
import { payrollPeriodSeed, payrollRecordSeed } from "@/data/payroll";
import { positionSeed } from "@/data/positions";
import { paginate } from "@/lib/pagination";
import { success } from "@/lib/result";
import type { Paginated, ServiceResult } from "@/types/api";
import type {
  GeneratePayrollInput,
  PayrollPeriod,
  PayrollPeriodStatus,
  PayrollQueryParams,
  PayrollRecord,
} from "@/types/payroll";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface PayrollService {
  listPeriods(): ServiceResult<PayrollPeriod[]>;
  listRecords(params?: PayrollQueryParams): ServiceResult<Paginated<PayrollRecord>>;
  getPayslip(id: string): ServiceResult<PayrollRecord>;
  generatePreview(input: GeneratePayrollInput): ServiceResult<PayrollRecord[]>;
  updatePeriodStatus(id: string, status: PayrollPeriodStatus): ServiceResult<PayrollPeriod>;
}

function loadPeriods() {
  return readCollection(MOCK_COLLECTIONS.payrollPeriods, payrollPeriodSeed);
}

function loadRecords() {
  return readCollection(MOCK_COLLECTIONS.payrollRecords, payrollRecordSeed);
}

const mockPayrollService: PayrollService = {
  async listPeriods() {
    await mockDelay(80);
    return success(loadPeriods(), "Payroll periods retrieved successfully");
  },

  async listRecords(params = {}) {
    await mockDelay(100);
    const search = params.search?.trim().toLowerCase();
    const employees = search ? readCollection(MOCK_COLLECTIONS.employees, employeeSeed) : [];
    const filtered = loadRecords().filter((record) => {
      if (params.periodId && record.periodId !== params.periodId) return false;
      if (params.employeeId && record.employeeId !== params.employeeId) return false;
      if (search) {
        const employee = employees.find((item) => item.id === record.employeeId);
        if (!employee) return false;
        const haystack = `${employee.firstName} ${employee.lastName} ${employee.employeeNumber}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
    return paginate(filtered, params, "Payroll records retrieved successfully");
  },

  async getPayslip(id) {
    await mockDelay(60);
    const record = loadRecords().find((item) => item.id === id);
    if (!record) throw new Error("Payslip not found");
    return success(record, "Payslip retrieved successfully");
  },

  async generatePreview(input) {
    await mockDelay(220);
    const employees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed).filter((employee) =>
      input.employeeIds ? input.employeeIds.includes(employee.id) : true,
    );
    const existing = loadRecords().filter((record) => record.periodId !== input.periodId);
    const generated = employees.map((employee) => {
      const position = positionSeed.find((item) => item.id === employee.positionId);
      const basicSalary = Math.round(((position?.salaryMin ?? 50000) + (position?.salaryMax ?? 80000)) / 2);
      const sss = Math.round(basicSalary * 0.048);
      const philhealth = Math.round(basicSalary * 0.025);
      const pagibig = 100;
      const taxDeductions = Math.round(basicSalary * 0.08);
      const deductions = 500;

      return {
        id: `PAYREC-${input.periodId}-${employee.id}`,
        periodId: input.periodId,
        employeeId: employee.id,
        basicSalary,
        allowances: 2500,
        overtimePay: 0,
        bonuses: 0,
        deductions,
        taxDeductions,
        governmentContributions: { sss, philhealth, pagibig },
        netPay: basicSalary + 2500 - deductions - taxDeductions - sss - philhealth - pagibig,
        generatedAt: "2026-11-22T09:00:00",
      };
    });

    writeCollection(MOCK_COLLECTIONS.payrollRecords, [...existing, ...generated]);
    const periods = loadPeriods().map((period) =>
      period.id === input.periodId
        ? { ...period, status: "preview" as const, generatedAt: "2026-11-22T09:00:00" }
        : period,
    );
    writeCollection(MOCK_COLLECTIONS.payrollPeriods, periods);
    return success(generated, "Mock payroll preview generated successfully");
  },

  async updatePeriodStatus(id, status) {
    await mockDelay(120);
    const periods = loadPeriods();
    const index = periods.findIndex((period) => period.id === id);
    if (index < 0) throw new Error("Payroll period not found");
    const updated = { ...periods[index], status };
    const next = [...periods];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.payrollPeriods, next);
    return success(updated, "Payroll period updated successfully");
  },
};

const apiPayrollService: PayrollService = {
  listPeriods: () => apiClient.get<PayrollPeriod[]>(API_ENDPOINTS.payrollPeriods),
  listRecords: (params) => apiClient.get<Paginated<PayrollRecord>>(API_ENDPOINTS.payrollRecords, params),
  getPayslip: (id) => apiClient.get<PayrollRecord>(`${API_ENDPOINTS.payrollRecords}/${id}`),
  generatePreview: (input) => apiClient.post<PayrollRecord[]>(`${API_ENDPOINTS.payrollPeriods}/${input.periodId}/preview`, input),
  updatePeriodStatus: (id, status) =>
    apiClient.patch<PayrollPeriod>(`${API_ENDPOINTS.payrollPeriods}/${id}/status`, { status }),
};

export const payrollService: PayrollService = env.useMockData ? mockPayrollService : apiPayrollService;
