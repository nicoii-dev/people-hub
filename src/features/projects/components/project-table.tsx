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
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectTableProps {
  projects: Project[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectTable({
  projects,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ProjectTableProps) {
  const columns: DataTableColumn<Project>[] = [
    {
      id: "project",
      header: "Project",
      cellClassName: "min-w-56",
      cell: (project) => (
        <div className="space-y-1">
          <Link href={`/projects/${project.id}`} className="text-sm font-medium hover:underline">
            {project.name}
          </Link>
          <p className="text-xs text-muted-foreground">{project.clientName || "—"}</p>
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      cell: (project) => <Badge variant="secondary">{project.code}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (project) => <StatusBadge status={project.status} />,
    },
    {
      id: "priority",
      header: "Priority",
      cell: (project) => <StatusBadge status={project.priority} />,
    },
    {
      id: "timeline",
      header: "Timeline",
      cellClassName: "min-w-44",
      cell: (project) => (
        <div className="space-y-1">
          <p className="text-xs">
            {project.startDate ? formatDate(project.startDate) : "—"}
            {" → "}
            {project.endDate ? formatDate(project.endDate) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {project.billable ? "Billable" : "Non-billable"}
          </p>
        </div>
      ),
    },
    {
      id: "budget",
      header: "Budget",
      cell: (project) => (
        <span className="text-sm tabular-nums">
          {project.budget === null ? "—" : formatCurrency(project.budget)}
        </span>
      ),
    },
    {
      id: "team",
      header: "Team",
      cell: (project) => (
        <span className="text-sm tabular-nums">{project.assignments.length}</span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canEdit && !canDelete}
              aria-label={`Actions for ${project.name}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage project</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>View details</Link>
            </DropdownMenuItem>
            {canEdit ? (
              <DropdownMenuItem onSelect={() => onEdit(project)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {canDelete ? (
              <DropdownMenuItem
                onSelect={() => onDelete(project)}
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

  return <DataTable columns={columns} data={projects} getRowId={(project) => project.id} />;
}
