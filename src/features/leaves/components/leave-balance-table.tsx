import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { LeaveBalance } from "@/types/leave";

interface LeaveBalanceTableProps {
  balances: LeaveBalance[];
  employees: Employee[];
}

export function LeaveBalanceTable({ balances, employees }: LeaveBalanceTableProps) {
  const columns: DataTableColumn<LeaveBalance>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-48",
      cell: (balance) => {
        const employee = employees.find((item) => item.id === balance.employeeId);
        if (!employee) return <span className="text-xs text-muted-foreground">{balance.employeeId}</span>;
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
      id: "type",
      header: "Leave type",
      cell: (balance) => <span className="text-sm">{balance.type}</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: (balance) => <span className="text-sm tabular-nums">{balance.total}</span>,
    },
    {
      id: "used",
      header: "Used",
      cell: (balance) => <span className="text-sm tabular-nums">{balance.used}</span>,
    },
    {
      id: "remaining",
      header: "Remaining",
      cell: (balance) => (
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            balance.remaining === 0 ? "text-destructive" : balance.remaining <= 3 ? "text-amber-600" : "text-emerald-600",
          )}
        >
          {balance.remaining}
        </span>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      cellClassName: "min-w-40",
      cell: (balance) => {
        const percentage = balance.total > 0 ? Math.min(100, Math.round((balance.used / balance.total) * 100)) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  percentage >= 90 ? "bg-destructive" : percentage >= 70 ? "bg-amber-500" : "bg-emerald-500",
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-9 text-right text-xs text-muted-foreground">{percentage}%</span>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={balances} getRowId={(balance) => `${balance.employeeId}-${balance.type}`} />;
}
