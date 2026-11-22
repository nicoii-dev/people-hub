import type { ListParams } from "./api";

export type PayrollPeriodStatus = "draft" | "preview" | "processed" | "paid";

export interface PayrollPeriod {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: PayrollPeriodStatus;
  generatedAt: string | null;
}

export interface GovernmentContributions {
  sss: number;
  philhealth: number;
  pagibig: number;
}

export interface PayrollRecord {
  id: string;
  periodId: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  taxDeductions: number;
  governmentContributions: GovernmentContributions;
  netPay: number;
  generatedAt: string;
}

export interface PayrollQueryParams extends ListParams {
  periodId?: string;
  employeeId?: string;
}

export interface GeneratePayrollInput {
  periodId: string;
  employeeIds?: string[];
}
