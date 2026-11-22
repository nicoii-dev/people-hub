import {
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  Star,
  UserCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummary } from "@/types/report";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  loading?: boolean;
}

export function ReportSummaryCards({ summary, loading = false }: ReportSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Headcount" value={summary.headcount} icon={UsersRound} description="Employees in scope" loading={loading} />
      <StatCard title="Active employees" value={summary.activeEmployees} icon={UserCheck} description="Currently active" loading={loading} />
      <StatCard title="Attendance rate" value={`${summary.attendanceRate}%`} icon={CalendarCheck2} description="Present or overtime" loading={loading} />
      <StatCard title="Pending leaves" value={summary.pendingLeaves} icon={CalendarDays} description="Awaiting approval" loading={loading} />
      <StatCard title="Payroll cost" value={formatCurrency(summary.payrollCost)} icon={WalletCards} description="Net pay in generated records" loading={loading} />
      <StatCard title="Open jobs" value={summary.openJobs} icon={BriefcaseBusiness} description="Active vacancies" loading={loading} />
      <StatCard title="Average rating" value={summary.averageRating.toFixed(1)} icon={Star} description="Across performance reviews" loading={loading} />
    </div>
  );
}
