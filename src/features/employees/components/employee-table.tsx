import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Department } from "@/types/department";
import type { Employee, EmployeeStatus } from "@/types/employee";
import type { Position } from "@/types/position";
import { EmployeeStatusMenu } from "./employee-status-menu";

interface EmployeeTableProps {
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  canEdit: boolean;
  canArchive: boolean;
  onEdit: (employee: Employee) => void;
  onChangeStatus: (employee: Employee, status: EmployeeStatus) => void;
  onArchive: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  departments,
  positions,
  canEdit,
  canArchive,
  onEdit,
  onChangeStatus,
  onArchive,
}: EmployeeTableProps) {
  const columns: DataTableColumn<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-56",
      cell: (employee) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar
            firstName={employee.firstName}
            lastName={employee.lastName}
            color={employee.avatarColor}
            size="sm"
          />
          <div className="min-w-0">
            <Link
              href={`/employees/${employee.id}`}
              className="block truncate text-sm font-medium hover:underline"
            >
              {employee.firstName} {employee.lastName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{employee.employeeNumber}</p>
          </div>
        </div>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: (employee) =>
        departments.find((department) => department.id === employee.departmentId)?.name ?? "—",
    },
    {
      id: "position",
      header: "Position",
      cell: (employee) =>
        positions.find((position) => position.id === employee.positionId)?.title ?? "—",
    },
    {
      id: "type",
      header: "Type",
      cell: (employee) => <span className="text-xs">{employee.employmentType}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (employee) => <StatusBadge status={employee.employmentStatus} />,
    },
    {
      id: "hired",
      header: "Date hired",
      cell: (employee) => <span className="text-xs text-muted-foreground">{employee.dateHired}</span>,
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (employee) => (
        <EmployeeStatusMenu
          employee={employee}
          canEdit={canEdit}
          canArchive={canArchive}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onArchive={onArchive}
        />
      ),
    },
  ];

  return <DataTable columns={columns} data={employees} getRowId={(employee) => employee.id} />;
}
