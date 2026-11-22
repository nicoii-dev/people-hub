"use client";

import { FormDialog } from "@/components/shared/form-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayslip } from "@/hooks/use-payroll";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { PayrollPeriod, PayrollRecord } from "@/types/payroll";

interface PayslipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PayrollRecord | null;
  employees: Employee[];
  periods: PayrollPeriod[];
}

function DetailRow({
  label,
  value,
  emphasis = false,
  negative = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          emphasis
            ? "font-semibold text-foreground"
            : negative
              ? "font-medium text-destructive"
              : "tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function PayslipDialog({
  open,
  onOpenChange,
  record,
  employees,
  periods,
}: PayslipDialogProps) {
  const payslipQuery = usePayslip(record?.id);
  const payslip = payslipQuery.data ?? record;
  const employee = employees.find((item) => item.id === payslip?.employeeId);
  const period = periods.find((item) => item.id === payslip?.periodId);
  const taxesAndContributions =
    (payslip?.taxDeductions ?? 0) +
    (payslip?.governmentContributions.sss ?? 0) +
    (payslip?.governmentContributions.philhealth ?? 0) +
    (payslip?.governmentContributions.pagibig ?? 0);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Payslip"
      description={
        employee
          ? `${employee.firstName} ${employee.lastName} · ${period?.label ?? payslip?.periodId ?? ""}`
          : period?.label
      }
    >
      {payslipQuery.isError ? (
        <ErrorState
          title="Payslip unavailable"
          description="The payslip could not be loaded."
          error={payslipQuery.error}
          onRetry={() => void payslipQuery.refetch()}
        />
      ) : !payslip ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No payslip selected.</div>
      ) : payslipQuery.isPending ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          <div className="grid gap-1 rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium">{employee ? `${employee.firstName} ${employee.lastName}` : payslip.employeeId}</p>
            <p className="text-muted-foreground">{employee?.email ?? payslip.employeeId}</p>
            <p className="text-muted-foreground">Generated {formatDateTime(payslip.generatedAt)}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Earnings</p>
            <DetailRow label="Basic salary" value={formatCurrency(payslip.basicSalary)} />
            <DetailRow label="Allowances" value={formatCurrency(payslip.allowances)} />
            <DetailRow label="Overtime pay" value={formatCurrency(payslip.overtimePay)} />
            <DetailRow label="Bonuses" value={formatCurrency(payslip.bonuses)} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deductions</p>
            <DetailRow label="Other deductions" value={formatCurrency(payslip.deductions)} negative />
            <DetailRow label="Tax and contributions" value={formatCurrency(taxesAndContributions)} negative />
            <DetailRow label="SSS" value={formatCurrency(payslip.governmentContributions.sss)} negative />
            <DetailRow label="PhilHealth" value={formatCurrency(payslip.governmentContributions.philhealth)} negative />
            <DetailRow label="Pag-IBIG" value={formatCurrency(payslip.governmentContributions.pagibig)} negative />
          </div>

          <div className="rounded-lg border bg-emerald-50/60 p-4 dark:bg-emerald-500/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Net pay</span>
              <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(payslip.netPay)}
              </span>
            </div>
          </div>
        </div>
      )}
    </FormDialog>
  );
}
