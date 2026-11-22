import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { PayrollRecord } from "@/types/payroll";

interface PayrollRecordsTableProps {
  records: PayrollRecord[];
  employees: Employee[];
  onView: (record: PayrollRecord) => void;
}

function totalDeductions(record: PayrollRecord) {
  return (
    record.deductions +
    record.taxDeductions +
    record.governmentContributions.sss +
    record.governmentContributions.philhealth +
    record.governmentContributions.pagibig
  );
}

export function PayrollRecordsTable({ records, employees, onView }: PayrollRecordsTableProps) {
  const columns: DataTableColumn<PayrollRecord>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-48",
      cell: (record) => {
        const employee = employees.find((item) => item.id === record.employeeId);
        if (!employee) return <span className="text-xs text-muted-foreground">{record.employeeId}</span>;
        return (
          <div className="flex items-center gap-3">
            <EmployeeAvatar
              firstName={employee.firstName}
              lastName={employee.lastName}
              color={employee.avatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{employee.employeeNumber}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "basic",
      header: "Basic pay",
      cell: (record) => <span className="text-xs tabular-nums">{formatCurrency(record.basicSalary)}</span>,
    },
    {
      id: "allowances",
      header: "Allowances",
      cell: (record) => <span className="text-xs tabular-nums">{formatCurrency(record.allowances)}</span>,
    },
    {
      id: "overtime",
      header: "Overtime",
      cell: (record) => <span className="text-xs tabular-nums">{formatCurrency(record.overtimePay)}</span>,
    },
    {
      id: "bonuses",
      header: "Bonuses",
      cell: (record) => <span className="text-xs tabular-nums">{formatCurrency(record.bonuses)}</span>,
    },
    {
      id: "deductions",
      header: "Deductions",
      cell: (record) => <span className="text-xs tabular-nums text-destructive">-{formatCurrency(totalDeductions(record))}</span>,
    },
    {
      id: "net",
      header: "Net pay",
      cell: (record) => <span className="text-sm font-semibold tabular-nums text-emerald-600">{formatCurrency(record.netPay)}</span>,
    },
    {
      id: "generated",
      header: "Generated",
      cell: (record) => <span className="text-xs text-muted-foreground">{formatDateTime(record.generatedAt)}</span>,
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (record) => (
        <Button variant="ghost" size="icon" onClick={() => onView(record)} aria-label={`View payslip ${record.id}`}>
          <Eye />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={records} getRowId={(record) => record.id} />;
}
