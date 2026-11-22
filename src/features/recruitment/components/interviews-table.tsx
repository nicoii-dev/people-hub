import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { Application, Interview, JobOpening } from "@/types/recruitment";

interface InterviewsTableProps {
  interviews: Interview[];
  applications: Application[];
  jobs: JobOpening[];
  employees: Employee[];
}

export function InterviewsTable({ interviews, applications, jobs, employees }: InterviewsTableProps) {
  const columns: DataTableColumn<Interview>[] = [
    {
      id: "candidate",
      header: "Candidate",
      cellClassName: "min-w-44",
      cell: (interview) => {
        const application = applications.find((item) => item.id === interview.applicationId);
        const job = jobs.find((item) => item.id === application?.jobId);
        return (
          <div>
            <p className="text-sm font-medium">{interview.applicationId}</p>
            <p className="text-xs text-muted-foreground">{job?.title ?? "Unknown role"}</p>
          </div>
        );
      },
    },
    {
      id: "scheduled",
      header: "Schedule",
      cell: (interview) => <span className="text-xs">{formatDateTime(interview.scheduledAt)}</span>,
    },
    {
      id: "interviewer",
      header: "Interviewer",
      cell: (interview) => {
        const employee = employees.find((item) => item.id === interview.interviewerId);
        if (!employee) return <span className="text-xs text-muted-foreground">{interview.interviewerId}</span>;
        return (
          <div className="flex items-center gap-2">
            <EmployeeAvatar
              firstName={employee.firstName}
              lastName={employee.lastName}
              color={employee.avatarColor}
              size="sm"
            />
            <span className="text-sm">
              {employee.firstName} {employee.lastName}
            </span>
          </div>
        );
      },
    },
    {
      id: "mode",
      header: "Mode",
      cell: (interview) => <span className="text-sm">{interview.mode}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (interview) => <StatusBadge status={interview.status} />,
    },
  ];

  return <DataTable columns={columns} data={interviews} getRowId={(interview) => interview.id} />;
}
