import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; dot: string; variant: BadgeProps["variant"] }> = {
  active: { label: "Active", dot: "bg-emerald-500", variant: "success" },
  inactive: { label: "Inactive", dot: "bg-slate-400", variant: "secondary" },
  on_leave: { label: "On Leave", dot: "bg-amber-500", variant: "warning" },
  archived: { label: "Archived", dot: "bg-slate-400", variant: "outline" },
  present: { label: "Present", dot: "bg-emerald-500", variant: "success" },
  late: { label: "Late", dot: "bg-amber-500", variant: "warning" },
  absent: { label: "Absent", dot: "bg-red-500", variant: "destructive" },
  half_day: { label: "Half Day", dot: "bg-orange-500", variant: "warning" },
  overtime: { label: "Overtime", dot: "bg-blue-500", variant: "default" },
  pending: { label: "Pending", dot: "bg-amber-500", variant: "warning" },
  approved: { label: "Approved", dot: "bg-emerald-500", variant: "success" },
  rejected: { label: "Rejected", dot: "bg-red-500", variant: "destructive" },
  cancelled: { label: "Cancelled", dot: "bg-slate-400", variant: "secondary" },
  draft: { label: "Draft", dot: "bg-slate-400", variant: "secondary" },
  preview: { label: "Preview", dot: "bg-blue-500", variant: "default" },
  processed: { label: "Processed", dot: "bg-emerald-500", variant: "success" },
  paid: { label: "Paid", dot: "bg-emerald-500", variant: "success" },
  open: { label: "Open", dot: "bg-emerald-500", variant: "success" },
  on_hold: { label: "On Hold", dot: "bg-amber-500", variant: "warning" },
  closed: { label: "Closed", dot: "bg-slate-400", variant: "secondary" },
  applied: { label: "Applied", dot: "bg-blue-500", variant: "default" },
  screening: { label: "Screening", dot: "bg-indigo-500", variant: "default" },
  interview: { label: "Interview", dot: "bg-violet-500", variant: "default" },
  assessment: { label: "Assessment", dot: "bg-cyan-500", variant: "default" },
  offered: { label: "Offered", dot: "bg-amber-500", variant: "warning" },
  hired: { label: "Hired", dot: "bg-emerald-500", variant: "success" },
  acknowledged: { label: "Acknowledged", dot: "bg-emerald-500", variant: "success" },
  submitted: { label: "Submitted", dot: "bg-blue-500", variant: "default" },
  completed: { label: "Completed", dot: "bg-emerald-500", variant: "success" },
  at_risk: { label: "At Risk", dot: "bg-amber-500", variant: "warning" },
  on_track: { label: "On Track", dot: "bg-blue-500", variant: "default" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_STYLES[status] ?? {
    label: status.replaceAll("_", " "),
    dot: "bg-slate-400",
    variant: "secondary" as const,
  };

  return (
    <Badge variant={config.variant} className={cn("gap-1.5 capitalize", className)}>
      <span className={cn("size-1.5 rounded-full", config.dot)} aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
