import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { formatDuration } from "@/types/time-entry";
import type {
  ClientReportItem,
  ProjectReportItem,
} from "@/types/project-report";

export function ProjectReportTable({ data }: { data: ProjectReportItem[] }) {
  const columns: DataTableColumn<ProjectReportItem>[] = [
    {
      id: "project",
      header: "Project",
      cellClassName: "min-w-40",
      cell: (project) => (
        <div className="space-y-0.5">
          <Link
            href={`/projects/${project.id}`}
            className="text-sm font-medium hover:underline"
          >
            {project.name}
          </Link>
          <p className="text-xs text-muted-foreground">{project.code}</p>
        </div>
      ),
    },
    {
      id: "client",
      header: "Client",
      cell: (project) => (
        <span className="text-sm">{project.clientName ?? "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (project) => <StatusBadge status={project.status} />,
    },
    {
      id: "team",
      header: "Team",
      cell: (project) => <span className="text-sm tabular-nums">{project.teamSize}</span>,
    },
    {
      id: "entries",
      header: "Entries",
      cell: (project) => <span className="text-sm tabular-nums">{project.entryCount}</span>,
    },
    {
      id: "duration",
      header: "Logged",
      cell: (project) => (
        <span className="text-sm tabular-nums">
          {formatDuration(project.durationMinutes)}
        </span>
      ),
    },
    {
      id: "billable",
      header: "Billable",
      cell: (project) => (
        <span className="text-sm tabular-nums">
          {formatDuration(project.billableMinutes)}
        </span>
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
  ];

  return (
    <div className="overflow-x-auto rounded-md border">
      <DataTable columns={columns} data={data} getRowId={(project) => project.id} />
    </div>
  );
}

export function ClientReportTable({ data }: { data: ClientReportItem[] }) {
  const columns: DataTableColumn<ClientReportItem>[] = [
    {
      id: "client",
      header: "Client",
      cellClassName: "min-w-40",
      cell: (client) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{client.name}</p>
          <p className="text-xs text-muted-foreground">{client.code}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (client) => <StatusBadge status={client.status} />,
    },
    {
      id: "projects",
      header: "Projects",
      cell: (client) => <span className="text-sm tabular-nums">{client.projectCount}</span>,
    },
    {
      id: "duration",
      header: "Logged",
      cell: (client) => (
        <span className="text-sm tabular-nums">
          {formatDuration(client.durationMinutes)}
        </span>
      ),
    },
    {
      id: "billable",
      header: "Billable",
      cell: (client) => (
        <span className="text-sm tabular-nums">
          {formatDuration(client.billableMinutes)}
        </span>
      ),
    },
    {
      id: "budget",
      header: "Budget",
      cell: (client) => (
        <span className="text-sm tabular-nums">
          {client.budget === null ? "—" : formatCurrency(client.budget)}
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-md border">
      <DataTable columns={columns} data={data} getRowId={(client) => client.id} />
    </div>
  );
}
