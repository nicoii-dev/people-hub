import { Ban, Check, MoreHorizontal, X } from "lucide-react";
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
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  employees: Employee[];
  canApprove: boolean;
  onUpdateStatus: (request: LeaveRequest, status: LeaveStatus) => void;
}

export function LeaveRequestsTable({
  requests,
  employees,
  canApprove,
  onUpdateStatus,
}: LeaveRequestsTableProps) {
  const columns: DataTableColumn<LeaveRequest>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-48",
      cell: (request) => {
        const employee = employees.find((item) => item.id === request.employeeId);
        if (!employee) return <span className="text-xs text-muted-foreground">{request.employeeId}</span>;
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
              <p className="truncate text-xs text-muted-foreground">{request.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "type",
      header: "Leave type",
      cell: (request) => <span className="text-sm">{request.type}</span>,
    },
    {
      id: "dates",
      header: "Dates",
      cell: (request) => (
        <div className="text-xs text-muted-foreground">
          <p>{formatDate(request.startDate)}</p>
          <p>to {formatDate(request.endDate)}</p>
        </div>
      ),
    },
    {
      id: "days",
      header: "Days",
      cell: (request) => <span className="text-sm font-medium tabular-nums">{request.days}</span>,
    },
    {
      id: "reason",
      header: "Reason",
      cellClassName: "max-w-56",
      cell: (request) => <span className="line-clamp-2 text-xs text-muted-foreground">{request.reason}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (request) => <StatusBadge status={request.status} />,
    },
    {
      id: "approvedBy",
      header: "Approved by",
      cell: (request) => {
        const approver = employees.find((item) => item.id === request.approvedBy);
        return approver ? `${approver.firstName} ${approver.lastName}` : "—";
      },
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (request) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!canApprove} aria-label={`Actions for ${request.id}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Review request</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={request.status !== "pending"}
              onSelect={() => onUpdateStatus(request, "approved")}
            >
              <Check />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={request.status !== "pending"}
              onSelect={() => onUpdateStatus(request, "rejected")}
              className="text-destructive focus:text-destructive"
            >
              <X />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={request.status === "cancelled" || request.status === "rejected"}
              onSelect={() => onUpdateStatus(request, "cancelled")}
            >
              <Ban />
              Cancel request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={requests} getRowId={(request) => request.id} />;
}
