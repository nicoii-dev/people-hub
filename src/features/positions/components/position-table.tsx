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
import { formatCurrency } from "@/lib/utils";
import type { Department } from "@/types/department";
import type { Position } from "@/types/position";

interface PositionTableProps {
  positions: Position[];
  departments: Department[];
  employeeCounts: Record<string, number>;
  canManage: boolean;
  onEdit: (position: Position) => void;
  onDelete: (position: Position) => void;
}

export function PositionTable({
  positions,
  departments,
  employeeCounts,
  canManage,
  onEdit,
  onDelete,
}: PositionTableProps) {
  const columns: DataTableColumn<Position>[] = [
    {
      id: "position",
      header: "Position",
      cellClassName: "min-w-52",
      cell: (position) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">{position.title}</p>
          <p className="text-xs text-muted-foreground">{position.id}</p>
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      cell: (position) => <Badge variant="secondary">{position.code}</Badge>,
    },
    {
      id: "department",
      header: "Department",
      cell: (position) => departments.find((department) => department.id === position.departmentId)?.name ?? "—",
    },
    {
      id: "level",
      header: "Level",
      cell: (position) => <Badge variant="outline">{position.level}</Badge>,
    },
    {
      id: "grade",
      header: "Grade",
      cell: (position) => <span className="text-sm tabular-nums">{position.salaryGrade}</span>,
    },
    {
      id: "salary",
      header: "Salary range",
      cell: (position) => (
        <span className="text-xs text-muted-foreground">
          {formatCurrency(position.salaryMin)} – {formatCurrency(position.salaryMax)}
        </span>
      ),
    },
    {
      id: "assigned",
      header: "Assigned",
      cell: (position) => (
        <span className="text-sm tabular-nums">{employeeCounts[position.id] ?? 0}</span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (position) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!canManage} aria-label={`Actions for ${position.title}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage position</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onEdit(position)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(position)}
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

  return <DataTable columns={columns} data={positions} getRowId={(position) => position.id} />;
}
