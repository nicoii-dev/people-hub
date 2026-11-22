import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { PerformanceGoal } from "@/types/performance";

interface GoalsTableProps {
  goals: PerformanceGoal[];
  employees: Employee[];
}

export function GoalsTable({ goals, employees }: GoalsTableProps) {
  const columns: DataTableColumn<PerformanceGoal>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-44",
      cell: (goal) => {
        const employee = employees.find((item) => item.id === goal.employeeId);
        return (
          <div className="flex items-center gap-3">
            <EmployeeAvatar
              firstName={employee?.firstName ?? "?"}
              lastName={employee?.lastName ?? ""}
              color={employee?.avatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeId}
              </p>
              <p className="truncate text-xs text-muted-foreground">{employee?.email ?? goal.employeeId}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "goal",
      header: "Goal",
      cellClassName: "min-w-56 max-w-80",
      cell: (goal) => (
        <div>
          <p className="text-sm font-medium">{goal.title}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{goal.description}</p>
        </div>
      ),
    },
    {
      id: "dueDate",
      header: "Due date",
      cell: (goal) => <span className="text-xs">{formatDate(goal.dueDate)}</span>,
    },
    {
      id: "progress",
      header: "Progress",
      cell: (goal) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${goal.status === "at_risk" ? "bg-amber-500" : goal.status === "completed" ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums">{goal.progress}%</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (goal) => <StatusBadge status={goal.status} />,
    },
  ];

  return <DataTable columns={columns} data={goals} getRowId={(goal) => goal.id} />;
}
