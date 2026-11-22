import {
  CalendarCheck2,
  CalendarX2,
  CheckCircle2,
  Clock3,
  Plane,
  Timer,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface AttendanceSummaryCardsProps {
  total: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  overtime: number;
  loading?: boolean;
}

export function AttendanceSummaryCards({
  total,
  present,
  late,
  absent,
  onLeave,
  overtime,
  loading = false,
}: AttendanceSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Records" value={total} icon={CalendarCheck2} description="For the selected day" loading={loading} />
      <StatCard title="Present" value={present} icon={CheckCircle2} description="Regular attendance" loading={loading} />
      <StatCard title="Late" value={late} icon={Clock3} description="Reported late" loading={loading} />
      <StatCard title="Absent" value={absent} icon={CalendarX2} description="No time-in recorded" loading={loading} />
      <StatCard title="On leave" value={onLeave} icon={Plane} description="Approved leave" loading={loading} />
      <StatCard title="Overtime" value={overtime} icon={Timer} description="Extended shifts" loading={loading} />
    </div>
  );
}
