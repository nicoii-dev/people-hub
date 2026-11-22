"use client";

import { BarChart3, CalendarCheck2, UsersRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { AttendanceOverviewChart } from "./components/attendance-overview-chart";
import { BirthdayList } from "./components/birthday-list";
import { DepartmentDistributionChart } from "./components/department-distribution-chart";
import { EmployeeGrowthChart } from "./components/employee-growth-chart";
import { PendingApprovals } from "./components/pending-approvals";
import { RecentActivity } from "./components/recent-activity";
import { StatGrid } from "./components/stat-grid";

export function DashboardView() {
  const summary = useDashboardSummary();

  if (summary.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="People operations at a glance." />
        <ErrorState
          title="Dashboard unavailable"
          description="The dashboard summary could not be loaded."
          error={summary.error}
          onRetry={() => void summary.refetch()}
        />
      </div>
    );
  }

  if (summary.isPending || !summary.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="People operations at a glance." />
        <LoadingSkeleton variant="cards" count={6} />
        <LoadingSkeleton variant="table" count={4} />
      </div>
    );
  }

  const data = summary.data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="People operations at a glance, powered by live mock service data."
      />

      <StatGrid summary={data} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="size-4 text-primary" />
              Employee growth
            </CardTitle>
            <CardDescription>Hires over the last six months.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeGrowthChart data={data.employeeGrowth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="size-4 text-primary" />
              Attendance overview
            </CardTitle>
            <CardDescription>Present, late, and absent counts for the last seven days.</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceOverviewChart data={data.attendanceOverview} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              Department distribution
            </CardTitle>
            <CardDescription>Employee headcount by department.</CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentDistributionChart data={data.departmentDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming birthdays</CardTitle>
            <CardDescription>Next 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <BirthdayList items={data.upcomingBirthdays} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest events across the workforce.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity items={data.recentActivities} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
            <CardDescription>Items that need a decision.</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingApprovals items={data.pendingApprovals} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
