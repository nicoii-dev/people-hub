import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { RECRUITMENT_STAGE_OPTIONS } from "@/config/constants";
import { formatDate } from "@/lib/utils";
import type { Application, Candidate, JobOpening, RecruitmentStage } from "@/types/recruitment";

interface ApplicationsTableProps {
  applications: Application[];
  candidates: Candidate[];
  jobs: JobOpening[];
  canManage: boolean;
  onStageChange: (application: Application, stage: RecruitmentStage) => void;
  onSchedule: (application: Application) => void;
}

export function ApplicationsTable({
  applications,
  candidates,
  jobs,
  canManage,
  onStageChange,
  onSchedule,
}: ApplicationsTableProps) {
  const columns: DataTableColumn<Application>[] = [
    {
      id: "candidate",
      header: "Candidate",
      cellClassName: "min-w-48",
      cell: (application) => {
        const candidate = candidates.find((item) => item.id === application.candidateId);
        if (!candidate) return <span className="text-xs text-muted-foreground">{application.candidateId}</span>;
        return (
          <div className="flex items-center gap-3">
            <EmployeeAvatar
              firstName={candidate.firstName}
              lastName={candidate.lastName}
              color={candidate.avatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {candidate.firstName} {candidate.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{candidate.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "job",
      header: "Job opening",
      cellClassName: "min-w-44",
      cell: (application) => jobs.find((item) => item.id === application.jobId)?.title ?? application.jobId,
    },
    {
      id: "stage",
      header: "Stage",
      cell: (application) => (
        <Select
          value={application.stage}
          disabled={!canManage}
          onValueChange={(value) => onStageChange(application, value as RecruitmentStage)}
        >
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RECRUITMENT_STAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: (application) => (
        <span className="text-sm tabular-nums">{application.rating !== null ? `${application.rating}/5` : "—"}</span>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      cellClassName: "max-w-56",
      cell: (application) => <span className="line-clamp-2 text-xs text-muted-foreground">{application.notes}</span>,
    },
    {
      id: "updated",
      header: "Updated",
      cell: (application) => <span className="text-xs text-muted-foreground">{formatDate(application.updatedAt)}</span>,
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (application) => (
        <Button
          variant="ghost"
          size="icon"
          disabled={!canManage}
          onClick={() => onSchedule(application)}
          aria-label={`Schedule interview for ${application.id}`}
        >
          <CalendarPlus />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={applications} getRowId={(application) => application.id} />;
}
