import {
  Activity,
  CalendarDays,
  ClipboardList,
  UserCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import type { DashboardSummary } from "@/types/dashboard";

interface StatGridProps {
  summary: DashboardSummary;
  loading?: boolean;
}

export function StatGrid({ summary, loading = false }: StatGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Total employees"
        value={summary.totalEmployees}
        icon={UsersRound}
        description="All records in the directory"
        loading={loading}
      />
      <StatCard
        title="Active employees"
        value={summary.activeEmployees}
        icon={UserCheck}
        description="Currently active contracts"
        loading={loading}
      />
      <StatCard
        title="On leave today"
        value={summary.onLeaveToday}
        icon={CalendarDays}
        description="Approved leave for today"
        loading={loading}
      />
      <StatCard
        title="New hires"
        value={summary.newHiresThisMonth}
        icon={UserPlus}
        description="Joined this month"
        loading={loading}
      />
      <StatCard
        title="Pending leave"
        value={summary.pendingLeaveRequests}
        icon={ClipboardList}
        description="Awaiting HR review"
        loading={loading}
      />
      <StatCard
        title="Attendance rate"
        value={`${summary.attendanceRate}%`}
        icon={Activity}
        description="Present or overtime records"
        loading={loading}
      />
    </div>
  );
}
