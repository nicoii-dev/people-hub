import { BriefcaseBusiness, CalendarDays, ClipboardList, UsersRound } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface RecruitmentSummaryCardsProps {
  openJobs: number;
  candidates: number;
  activeApplications: number;
  interviews: number;
  loading?: boolean;
}

export function RecruitmentSummaryCards({
  openJobs,
  candidates,
  activeApplications,
  interviews,
  loading = false,
}: RecruitmentSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Open jobs" value={openJobs} icon={BriefcaseBusiness} description="Currently accepting candidates" loading={loading} />
      <StatCard title="Candidates" value={candidates} icon={UsersRound} description="In the talent pool" loading={loading} />
      <StatCard title="Active applications" value={activeApplications} icon={ClipboardList} description="In progress" loading={loading} />
      <StatCard title="Scheduled interviews" value={interviews} icon={CalendarDays} description="Upcoming and scheduled" loading={loading} />
    </div>
  );
}
