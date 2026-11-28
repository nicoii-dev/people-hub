import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import {
  clockTime,
  formatDuration,
  type TimeEntry,
} from "@/types/time-entry";

interface TimeEntryTableProps {
  entries: TimeEntry[];
  showEmployee?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
}

export function TimeEntryTable({
  entries,
  showEmployee = false,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: TimeEntryTableProps) {
  const columns: DataTableColumn<TimeEntry>[] = [
    {
      id: "date",
      header: "Date",
      cellClassName: "min-w-28",
      cell: (entry) => (
        <span className="text-sm font-medium tabular-nums">
          {formatDate(entry.workDate)}
        </span>
      ),
    },
    {
      id: "project",
      header: "Project",
      cellClassName: "min-w-48",
      cell: (entry) => (
        <div className="space-y-1">
          <Link
            href={`/projects/${entry.projectId}`}
            className="text-sm font-medium hover:underline"
          >
            {entry.projectName ?? "Unknown project"}
          </Link>
          <p className="text-xs text-muted-foreground">{entry.projectCode ?? "—"}</p>
        </div>
      ),
    },
    ...(showEmployee
      ? [
          {
            id: "employee",
            header: "Employee",
            cellClassName: "min-w-40",
            cell: (entry: TimeEntry) => (
              <div className="space-y-1">
                <p className="text-sm">{entry.employeeName ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.employeeNumber ?? "—"}
                </p>
              </div>
            ),
          } satisfies DataTableColumn<TimeEntry>,
        ]
      : []),
    {
      id: "time",
      header: "Time",
      cellClassName: "min-w-28 tabular-nums",
      cell: (entry) =>
        entry.startTime && entry.endTime
          ? `${clockTime(entry.startTime)}–${clockTime(entry.endTime)}`
          : "—",
    },
    {
      id: "duration",
      header: "Duration",
      cell: (entry) => (
        <span className="text-sm tabular-nums">{formatDuration(entry.durationMinutes)}</span>
      ),
    },
    {
      id: "billable",
      header: "Type",
      cell: (entry) => (
        <Badge variant={entry.billable ? "success" : "secondary"}>
          {entry.billable ? "Billable" : "Non-billable"}
        </Badge>
      ),
    },
    {
      id: "description",
      header: "Description",
      cellClassName: "max-w-64",
      cell: (entry) => (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {entry.description || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (entry) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canEdit && !canDelete}
              aria-label={`Actions for ${entry.projectName ?? "time entry"}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage entry</DropdownMenuLabel>
            {canEdit ? (
              <DropdownMenuItem onSelect={() => onEdit(entry)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {canDelete ? (
              <DropdownMenuItem
                onSelect={() => onDelete(entry)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={entries} getRowId={(entry) => entry.id} />
  );
}
