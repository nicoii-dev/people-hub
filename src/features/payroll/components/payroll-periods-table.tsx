import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PAYROLL_PERIOD_STATUS_OPTIONS } from "@/config/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { PayrollPeriod, PayrollPeriodStatus } from "@/types/payroll";

interface PayrollPeriodsTableProps {
  periods: PayrollPeriod[];
  canManage: boolean;
  onStatusChange: (period: PayrollPeriod, status: PayrollPeriodStatus) => void;
}

const STATUS_FLOW: Record<PayrollPeriodStatus, PayrollPeriodStatus[]> = {
  draft: ["preview"],
  preview: ["processed"],
  processed: ["paid"],
  paid: [],
};

function statusLabel(status: PayrollPeriodStatus) {
  return PAYROLL_PERIOD_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function PayrollPeriodsTable({ periods, canManage, onStatusChange }: PayrollPeriodsTableProps) {
  const columns: DataTableColumn<PayrollPeriod>[] = [
    {
      id: "label",
      header: "Period",
      cell: (period) => <span className="text-sm font-medium">{period.label}</span>,
    },
    {
      id: "dates",
      header: "Date range",
      cell: (period) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(period.startDate)} — {formatDate(period.endDate)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (period) => <StatusBadge status={period.status} />,
    },
    {
      id: "generated",
      header: "Generated",
      cell: (period) => (
        <span className="text-xs text-muted-foreground">
          {period.generatedAt ? formatDateTime(period.generatedAt) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (period) => {
        const nextStatuses = STATUS_FLOW[period.status];
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canManage || nextStatuses.length === 0}
                aria-label={`Actions for ${period.id}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Update status</DropdownMenuLabel>
              {nextStatuses.map((status) => (
                <DropdownMenuItem key={status} onSelect={() => onStatusChange(period, status)}>
                  <ArrowRight />
                  Mark as {statusLabel(status).toLowerCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={periods}
      getRowId={(period) => period.id}
      empty={<div className="p-6 text-center text-sm text-muted-foreground">No payroll periods found.</div>}
    />
  );
}
