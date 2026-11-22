import { Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { PerformanceReview } from "@/types/performance";

interface ReviewsTableProps {
  reviews: PerformanceReview[];
  employees: Employee[];
  onView: (review: PerformanceReview) => void;
}

function employeeName(employee: Employee | undefined, fallback: string) {
  if (!employee) return fallback;
  return `${employee.firstName} ${employee.lastName}`;
}

export function ReviewsTable({ reviews, employees, onView }: ReviewsTableProps) {
  const columns: DataTableColumn<PerformanceReview>[] = [
    {
      id: "employee",
      header: "Employee",
      cellClassName: "min-w-48",
      cell: (review) => {
        const employee = employees.find((item) => item.id === review.employeeId);
        return (
          <div className="flex items-center gap-3">
            <EmployeeAvatar
              firstName={employee?.firstName ?? "?"}
              lastName={employee?.lastName ?? ""}
              color={employee?.avatarColor}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{employeeName(employee, review.employeeId)}</p>
              <p className="truncate text-xs text-muted-foreground">{employee?.email ?? review.employeeId}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "reviewer",
      header: "Reviewer",
      cell: (review) => {
        const reviewer = employees.find((item) => item.id === review.reviewerId);
        return (
          <span className="text-sm">
            {employeeName(reviewer, review.reviewerId)}
          </span>
        );
      },
    },
    {
      id: "period",
      header: "Period",
      cell: (review) => <span className="text-sm">{review.period}</span>,
    },
    {
      id: "rating",
      header: "Rating",
      cell: (review) => (
        <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {review.rating}/5
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (review) => <StatusBadge status={review.status} />,
    },
    {
      id: "submitted",
      header: "Submitted",
      cell: (review) => (
        <span className="text-xs text-muted-foreground">
          {review.submittedAt ? formatDateTime(review.submittedAt) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (review) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(review)}
          aria-label={`View review ${review.id}`}
        >
          <Eye />
        </Button>
      ),
    },
  ];

  return <DataTable columns={columns} data={reviews} getRowId={(review) => review.id} />;
}
