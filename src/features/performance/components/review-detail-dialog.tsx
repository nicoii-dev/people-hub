import { Star } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";
import type { Employee } from "@/types/employee";
import type { KpiScore, PerformanceReview } from "@/types/performance";

interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: PerformanceReview | null;
  employees: Employee[];
}

export function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
  employees,
}: ReviewDetailDialogProps) {
  if (!review) return null;

  const employee = employees.find((item) => item.id === review.employeeId);
  const reviewer = employees.find((item) => item.id === review.reviewerId);
  const meta = [
    { label: "Employee", value: employee ? `${employee.firstName} ${employee.lastName}` : review.employeeId },
    { label: "Reviewer", value: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : review.reviewerId },
    { label: "Period", value: review.period },
    { label: "Rating", value: `${review.rating} / 5` },
    { label: "Status", value: <StatusBadge status={review.status} /> },
    {
      label: "Submitted",
      value: review.submittedAt ? formatDateTime(review.submittedAt) : "Not submitted",
    },
  ];

  const kpiColumns: DataTableColumn<KpiScore>[] = [
    { id: "name", header: "KPI", cellClassName: "min-w-40", cell: (kpi) => <span className="text-sm font-medium">{kpi.name}</span> },
    { id: "target", header: "Target", cellClassName: "min-w-48", cell: (kpi) => <span className="text-xs text-muted-foreground">{kpi.target}</span> },
    { id: "actual", header: "Actual", cellClassName: "min-w-48", cell: (kpi) => <span className="text-xs">{kpi.actual}</span> },
    {
      id: "score",
      header: "Score",
      cell: (kpi) => (
        <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {kpi.score}/5
        </span>
      ),
    },
  ];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Review details"
      description={`${review.id} · ${review.period}`}
      className="sm:max-w-4xl"
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <div className="mt-1 text-sm">{item.value}</div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Key performance indicators</h3>
          <div className="overflow-hidden rounded-lg border">
            <DataTable columns={kpiColumns} data={review.kpis} getRowId={(kpi) => kpi.id} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Strengths</h3>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">{review.strengths}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Areas for improvement</h3>
            <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">{review.improvements}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Manager comments</h3>
          <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">{review.managerComments}</p>
        </div>
      </div>
    </FormDialog>
  );
}
