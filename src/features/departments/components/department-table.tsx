import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";

interface DepartmentTableProps {
  departments: Department[];
  employees: Employee[];
  employeeCounts: Record<string, number>;
  positionCounts: Record<string, number>;
  canManage: boolean;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function DepartmentTable({
  departments,
  employees,
  employeeCounts,
  positionCounts,
  canManage,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  const columns: DataTableColumn<Department>[] = [
    {
      id: "department",
      header: "Department",
      cellClassName: "min-w-56",
      cell: (department) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">{department.name}</p>
          <p className="text-xs text-muted-foreground">{department.description}</p>
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      cell: (department) => <Badge variant="secondary">{department.code}</Badge>,
    },
    {
      id: "manager",
      header: "Manager",
      cell: (department) => {
        const manager = employees.find((employee) => employee.id === department.managerId);
        return manager ? `${manager.firstName} ${manager.lastName}` : "—";
      },
    },
    {
      id: "parent",
      header: "Parent",
      cell: (department) =>
        departments.find((item) => item.id === department.parentId)?.name ?? "—",
    },
    {
      id: "people",
      header: "People",
      cell: (department) => (
        <span className="text-sm tabular-nums">
          {employeeCounts[department.id] ?? 0}
          <span className="ml-1 text-xs text-muted-foreground">employees</span>
        </span>
      ),
    },
    {
      id: "positions",
      header: "Positions",
      cell: (department) => (
        <span className="text-sm tabular-nums">{positionCounts[department.id] ?? 0}</span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: (department) => <span className="text-xs text-muted-foreground">{department.location}</span>,
    },
    {
      id: "created",
      header: "Created",
      cell: (department) => <span className="text-xs text-muted-foreground">{formatDate(department.createdAt)}</span>,
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (department) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!canManage} aria-label={`Actions for ${department.name}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage department</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onEdit(department)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(department)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={departments} getRowId={(department) => department.id} />;
}
