import { FileText } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { formatDate } from "@/lib/utils";
import type { Candidate } from "@/types/recruitment";

interface CandidatesTableProps {
  candidates: Candidate[];
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const columns: DataTableColumn<Candidate>[] = [
    {
      id: "candidate",
      header: "Candidate",
      cellClassName: "min-w-48",
      cell: (candidate) => (
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
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (candidate) => <span className="text-xs">{candidate.contactNumber}</span>,
    },
    {
      id: "location",
      header: "Location",
      cell: (candidate) => <span className="text-xs text-muted-foreground">{candidate.location}</span>,
    },
    {
      id: "experience",
      header: "Experience",
      cell: (candidate) => (
        <span className="text-sm tabular-nums">{candidate.yearsOfExperience} yr(s)</span>
      ),
    },
    {
      id: "resume",
      header: "Resume",
      cell: (candidate) => (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          {candidate.resumeName}
        </span>
      ),
    },
    {
      id: "applied",
      header: "Applied",
      cell: (candidate) => <span className="text-xs text-muted-foreground">{formatDate(candidate.appliedAt)}</span>,
    },
  ];

  return <DataTable columns={columns} data={candidates} getRowId={(candidate) => candidate.id} />;
}
