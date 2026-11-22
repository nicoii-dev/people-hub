"use client";

import * as React from "react";
import { Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FilterOption } from "@/components/shared/filter-dropdown";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import {
  GOAL_STATUS_OPTIONS,
  REVIEW_STATUS_OPTIONS,
} from "@/config/constants";
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useEmployees } from "@/hooks/use-employees";
import {
  usePerformanceGoals,
  usePerformanceReviews,
} from "@/hooks/use-performance";
import type { Employee } from "@/types/employee";
import type { PerformanceGoal, PerformanceReview } from "@/types/performance";
import { GoalsTable } from "./components/goals-table";
import { PerformanceFilters } from "./components/performance-filters";
import { PerformanceSummaryCards } from "./components/performance-summary-cards";
import { ReviewDetailDialog } from "./components/review-detail-dialog";
import { ReviewFormDialog } from "./components/review-form-dialog";
import { ReviewsTable } from "./components/reviews-table";

const EMPTY_EMPLOYEES: Employee[] = [];
const EMPTY_REVIEWS: PerformanceReview[] = [];
const EMPTY_GOALS: PerformanceGoal[] = [];

const REVIEW_STATUS_FILTER_OPTIONS: FilterOption[] = REVIEW_STATUS_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
const GOAL_STATUS_FILTER_OPTIONS: FilterOption[] = GOAL_STATUS_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export function PerformanceView() {
  const [reviewSearch, setReviewSearch] = React.useState("");
  const [reviewStatus, setReviewStatus] = React.useState("");
  const [goalSearch, setGoalSearch] = React.useState("");
  const [goalEmployeeId, setGoalEmployeeId] = React.useState("");
  const [goalStatus, setGoalStatus] = React.useState("");
  const [reviewDetail, setReviewDetail] = React.useState<PerformanceReview | null>(null);
  const [reviewDetailOpen, setReviewDetailOpen] = React.useState(false);
  const [reviewFormOpen, setReviewFormOpen] = React.useState(false);

  const debouncedReviewSearch = useDebouncedValue(reviewSearch, 300);
  const debouncedGoalSearch = useDebouncedValue(goalSearch, 300);
  const reviewFilterKey = `${debouncedReviewSearch}|${reviewStatus}`;
  const [reviewPageState, setReviewPageState] = React.useState({ key: reviewFilterKey, page: 1 });
  const reviewPage = reviewPageState.key === reviewFilterKey ? reviewPageState.page : 1;

  const canEvaluate = usePermission("performance:evaluate");
  const employeesQuery = useEmployees({ limit: 100 });
  const summaryReviewsQuery = usePerformanceReviews({ limit: 100 });
  const summaryGoalsQuery = usePerformanceGoals();
  const reviewsQuery = usePerformanceReviews({
    search: debouncedReviewSearch || undefined,
    status: reviewStatus || undefined,
    page: reviewPage,
    limit: 10,
    sort: "submittedAt",
    order: "desc",
  });
  const goalsQuery = usePerformanceGoals(goalEmployeeId || undefined);

  const employees = employeesQuery.data?.data.items ?? EMPTY_EMPLOYEES;
  const allReviews = summaryReviewsQuery.data?.data.items ?? EMPTY_REVIEWS;
  const reviews = reviewsQuery.data?.data.items ?? EMPTY_REVIEWS;
  const allGoals = summaryGoalsQuery.data?.data ?? EMPTY_GOALS;
  const goals = goalsQuery.data?.data ?? EMPTY_GOALS;

  const averageRating = allReviews.length
    ? (allReviews.reduce((total, review) => total + review.rating, 0) / allReviews.length).toFixed(1)
    : "—";
  const submittedReviews = allReviews.filter((review) => review.status !== "draft").length;
  const onTrackGoals = allGoals.filter((goal) => goal.status === "on_track").length;
  const completedGoals = allGoals.filter((goal) => goal.status === "completed").length;

  const filteredGoals = React.useMemo(() => {
    const query = debouncedGoalSearch.trim().toLowerCase();
    return goals.filter((goal) => {
      if (goalStatus && goal.status !== goalStatus) return false;
      if (!query) return true;
      const employee = employees.find((item) => item.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "";
      return [goal.id, goal.title, goal.description, employeeName]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [goals, goalStatus, debouncedGoalSearch, employees]);

  function clearReviewFilters() {
    setReviewSearch("");
    setReviewStatus("");
  }

  function clearGoalFilters() {
    setGoalSearch("");
    setGoalEmployeeId("");
    setGoalStatus("");
  }

  function openReviewDetail(review: PerformanceReview) {
    setReviewDetail(review);
    setReviewDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance"
        description="Review employee outcomes and track goal progress."
        actions={
          canEvaluate ? (
            <Button onClick={() => setReviewFormOpen(true)}>
              <Plus />
              New review
            </Button>
          ) : undefined
        }
      />

      <PerformanceSummaryCards
        averageRating={averageRating}
        submittedReviews={submittedReviews}
        onTrackGoals={onTrackGoals}
        completedGoals={completedGoals}
        loading={summaryReviewsQuery.isPending || summaryGoalsQuery.isPending}
      />

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="overflow-hidden">
            <PerformanceFilters
              search={reviewSearch}
              onSearchChange={setReviewSearch}
              status={reviewStatus}
              onStatusChange={setReviewStatus}
              statusOptions={REVIEW_STATUS_FILTER_OPTIONS}
              statusPlaceholder="Filter by review status"
            />
            {reviewsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Reviews unavailable"
                  description="Performance reviews could not be loaded."
                  error={reviewsQuery.error}
                  onRetry={() => void reviewsQuery.refetch()}
                />
              </div>
            ) : reviewsQuery.isPending ? (
              <div className="p-4"><LoadingSkeleton variant="table" count={8} /></div>
            ) : reviews.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No reviews found"
                  description="Try a different search term or clear the filters."
                  action={
                    reviewSearch || reviewStatus ? (
                      <Button variant="outline" onClick={clearReviewFilters}>Clear filters</Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <>
                <ReviewsTable reviews={reviews} employees={employees} onView={openReviewDetail} />
                {reviewsQuery.data?.data.meta ? (
                  <Pagination
                    meta={reviewsQuery.data.data.meta}
                    onPageChange={(page) => setReviewPageState({ key: reviewFilterKey, page })}
                  />
                ) : null}
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card className="overflow-hidden">
            <PerformanceFilters
              search={goalSearch}
              onSearchChange={setGoalSearch}
              employees={employees}
              employeeId={goalEmployeeId}
              onEmployeeChange={setGoalEmployeeId}
              status={goalStatus}
              onStatusChange={setGoalStatus}
              statusOptions={GOAL_STATUS_FILTER_OPTIONS}
              statusPlaceholder="Filter by goal status"
            />
            {goalsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Goals unavailable"
                  description="Performance goals could not be loaded."
                  error={goalsQuery.error}
                  onRetry={() => void goalsQuery.refetch()}
                />
              </div>
            ) : goalsQuery.isPending ? (
              <div className="p-4"><LoadingSkeleton variant="table" count={8} /></div>
            ) : filteredGoals.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No goals found"
                  description="Try a different filter or clear the active filters."
                  action={
                    goalSearch || goalEmployeeId || goalStatus ? (
                      <Button variant="outline" onClick={clearGoalFilters}>Clear filters</Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <GoalsTable goals={filteredGoals} employees={employees} />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <ReviewDetailDialog
        open={reviewDetailOpen}
        onOpenChange={setReviewDetailOpen}
        review={reviewDetail}
        employees={employees}
      />
      {canEvaluate ? (
        <ReviewFormDialog
          open={reviewFormOpen}
          onOpenChange={setReviewFormOpen}
          employees={employees}
        />
      ) : null}
    </div>
  );
}
