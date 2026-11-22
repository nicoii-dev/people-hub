import type { PayrollPeriod, PayrollRecord } from "@/types/payroll";
import { mockDate, mockTimestamp } from "./_common";
import { employeeSeed } from "./employees";
import { positionSeed } from "./positions";

export const payrollPeriodSeed: PayrollPeriod[] = [
  {
    id: "PAY-2026-10",
    label: "October 2026 — 2nd Half",
    startDate: mockDate(-52),
    endDate: mockDate(-38),
    status: "paid",
    generatedAt: mockTimestamp(-36, 8),
  },
  {
    id: "PAY-2026-11-A",
    label: "November 2026 — 1st Half",
    startDate: mockDate(-37),
    endDate: mockDate(-23),
    status: "processed",
    generatedAt: mockTimestamp(-21, 8),
  },
  {
    id: "PAY-2026-11-B",
    label: "November 2026 — 2nd Half",
    startDate: mockDate(-22),
    endDate: mockDate(-8),
    status: "preview",
    generatedAt: mockTimestamp(-7, 9),
  },
];

export const payrollRecordSeed: PayrollRecord[] = payrollPeriodSeed.flatMap((period, periodIndex) =>
  employeeSeed.map((employee, employeeIndex) => {
    const position = positionSeed.find((item) => item.id === employee.positionId);
    const basicSalary = Math.round(
      ((position?.salaryMin ?? 50000) + (position?.salaryMax ?? 80000)) / 2,
    );
    const allowances = 2500 + (employeeIndex % 4) * 750;
    const overtimePay = employeeIndex % 6 === 0 ? 3200 + periodIndex * 250 : 0;
    const bonuses = employeeIndex % 9 === 0 ? 5000 : 0;
    const sss = Math.round(basicSalary * 0.048);
    const philhealth = Math.round(basicSalary * 0.025);
    const pagibig = 100;
    const taxDeductions = Math.round(basicSalary * 0.08);
    const deductions = 500 + (employeeIndex % 3) * 250;

    return {
      id: `PAYREC-${period.id}-${employee.id}`,
      periodId: period.id,
      employeeId: employee.id,
      basicSalary,
      allowances,
      overtimePay,
      bonuses,
      deductions,
      taxDeductions,
      governmentContributions: { sss, philhealth, pagibig },
      netPay:
        basicSalary +
        allowances +
        overtimePay +
        bonuses -
        deductions -
        taxDeductions -
        sss -
        philhealth -
        pagibig,
      generatedAt: period.generatedAt ?? mockTimestamp(-1, 8),
    };
  }),
);
