import { MoreHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { AttendanceRecord } from "@/types/attendance";
import type { Employee } from "@/types/employee";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  employees: Employee[];
  canManage: boolean;
  onAdjust: (record: AttendanceRecord) => void;
}

function hoursWorked(record: AttendanceRecord) {
  if (!record.timeIn || !record.timeOut) return "—";
  const [inHour, inMinute] = record.timeIn.split(":").map(Number);
  const [outHour, outMinute] = record.timeOut.split(":").map(Number);
  const minutes = (outHour ?? 0) * 60 + (outMinute ?? 0) - ((inHour ?? 0) * 60 + (inMinute ?? 0)) - record.breakMinutes;
  if (minutes <= 0) return "0h";
  return `${(minutes / 60).toFixed(1)}h`;
}

export function AttendanceTable({ records, employees, canManage, onAdjust }: AttendanceTableProps) {
  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-52",
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
      id: "date",
      header: "Date",
      cell: (record) => <span className="text-xs text-muted-foreground">{formatDate(record.date)}</span>,
    },
    {
      id: "timeIn",
      header: "Time in",
      cell: (record) => <span className="text-sm tabular-nums">{record.timeIn ?? "—"}</span>,
    },
    {
      id: "timeOut",
      header: "Time out",
      cell: (record) => <span className="text-sm tabular-nums">{record.timeOut ?? "—"}</span>,
    },
    {
      id: "hours",
      header: "Hours",
      cell: (record) => <span className="text-sm font-medium tabular-nums">{hoursWorked(record)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (record) => <StatusBadge status={record.status} />,
    },
    {
      id: "source",
      header: "Source",
      cell: (record) => <Badge variant="outline">{record.source}</Badge>,
    },
    {
      id: "remarks",
      header: "Remarks",
      cellClassName: "max-w-64",
      cell: (record) => <span className="line-clamp-2 text-xs text-muted-foreground">{record.remarks}</span>,
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!canManage} aria-label={`Actions for ${record.id}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage record</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onAdjust(record)}>
              <Pencil />
              Adjust attendance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={records} getRowId={(record) => record.id} />;
}
