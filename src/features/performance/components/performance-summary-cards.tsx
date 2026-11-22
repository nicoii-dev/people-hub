import { ClipboardCheck, CheckCircle2, Star, Target } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface PerformanceSummaryCardsProps {
  averageRating: string;
  submittedReviews: number;
  onTrackGoals: number;
  completedGoals: number;
  loading?: boolean;
}

export function PerformanceSummaryCards({
  averageRating,
  submittedReviews,
  onTrackGoals,
  completedGoals,
  loading = false,
}: PerformanceSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Average rating" value={averageRating} icon={Star} description="Across all reviews" loading={loading} />
      <StatCard title="Submitted reviews" value={submittedReviews} icon={ClipboardCheck} description="Completed or acknowledged" loading={loading} />
      <StatCard title="Goals on track" value={onTrackGoals} icon={Target} description="Progressing as planned" loading={loading} />
      <StatCard title="Goals completed" value={completedGoals} icon={CheckCircle2} description="Fully achieved" loading={loading} />
    </div>
  );
}
