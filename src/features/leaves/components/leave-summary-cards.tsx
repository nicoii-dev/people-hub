import { CheckCircle2, ClipboardList, Plane, XCircle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface LeaveSummaryCardsProps {
  pending: number;
  approved: number;
  rejected: number;
  onLeaveToday: number;
  loading?: boolean;
}

export function LeaveSummaryCards({
  pending,
  approved,
  rejected,
  onLeaveToday,
  loading = false,
}: LeaveSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Pending requests" value={pending} icon={ClipboardList} description="Awaiting review" loading={loading} />
      <StatCard title="Approved" value={approved} icon={CheckCircle2} description="All recorded approvals" loading={loading} />
      <StatCard title="Rejected" value={rejected} icon={XCircle} description="Declined requests" loading={loading} />
      <StatCard title="On leave today" value={onLeaveToday} icon={Plane} description="Approved for today" loading={loading} />
    </div>
  );
}
