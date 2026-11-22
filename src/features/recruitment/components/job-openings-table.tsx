import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Department } from "@/types/department";
import type { Application, JobOpening } from "@/types/recruitment";

interface JobOpeningsTableProps {
  jobs: JobOpening[];
  departments: Department[];
  applications: Application[];
}

export function JobOpeningsTable({ jobs, departments, applications }: JobOpeningsTableProps) {
  const columns: DataTableColumn<JobOpening>[] = [
    {
      id: "title",
      header: "Job opening",
      cellClassName: "min-w-56",
      cell: (job) => (
        <div>
          <p className="text-sm font-medium">{job.title}</p>
          <p className="text-xs text-muted-foreground">{job.id}</p>
        </div>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: (job) => departments.find((item) => item.id === job.departmentId)?.name ?? job.departmentId,
    },
    {
      id: "location",
      header: "Location",
      cell: (job) => <span className="text-xs text-muted-foreground">{job.location}</span>,
    },
    {
      id: "type",
      header: "Type",
      cell: (job) => <span className="text-sm">{job.employmentType}</span>,
    },
    {
      id: "salary",
      header: "Salary range",
      cell: (job) => (
        <span className="text-xs tabular-nums">
          {formatCurrency(job.salaryMin)} – {formatCurrency(job.salaryMax)}
        </span>
      ),
    },
    {
      id: "applicants",
      header: "Applicants",
      cell: (job) => (
        <span className="text-sm font-medium tabular-nums">
          {applications.filter((application) => application.jobId === job.id).length}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (job) => <StatusBadge status={job.status} />,
    },
    {
      id: "posted",
      header: "Posted",
      cell: (job) => <span className="text-xs text-muted-foreground">{formatDate(job.postedAt)}</span>,
    },
  ];

  return <DataTable columns={columns} data={jobs} getRowId={(job) => job.id} />;
}
