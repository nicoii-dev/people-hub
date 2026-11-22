"use client";

import * as React from "react";
import { Download, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { MOCK_TODAY } from "@/config/constants";
import { usePermission } from "@/features/auth/hooks";
import { useDepartments } from "@/hooks/use-departments";
import { useReports } from "@/hooks/use-reports";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { Department } from "@/types/department";
import { AttendanceTrendChart } from "./charts/attendance-trend-chart";
import { HeadcountByDepartmentChart } from "./charts/headcount-by-department-chart";
import { LeaveByTypeChart } from "./charts/leave-by-type-chart";
import { RatingDistributionChart } from "./charts/rating-distribution-chart";
import { RecruitmentFunnelChart } from "./charts/recruitment-funnel-chart";
import { DepartmentBreakdownTable } from "./department-breakdown-table";
import { ReportSummaryCards } from "./report-summary-cards";
import { ReportsFilters } from "./reports-filters";

const EMPTY_DEPARTMENTS: Department[] = [];

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ReportsView() {
  const [departmentId, setDepartmentId] = React.useState("");
  const canExport = usePermission("reports:export");
  const departmentsQuery = useDepartments();
  const reportsQuery = useReports(departmentId || undefined);
  const departments = departmentsQuery.data?.data.items ?? EMPTY_DEPARTMENTS;
  const data = reportsQuery.data?.data;

  function handleExport() {
    if (!data) return;

    const rows = [
      { section: "Summary", label: "Headcount", value: data.summary.headcount },
      { section: "Summary", label: "Active employees", value: data.summary.activeEmployees },
      { section: "Summary", label: "Attendance rate", value: `${data.summary.attendanceRate}%` },
      { section: "Summary", label: "Pending leaves", value: data.summary.pendingLeaves },
      { section: "Summary", label: "Payroll cost", value: data.summary.payrollCost },
      { section: "Summary", label: "Open jobs", value: data.summary.openJobs },
      { section: "Summary", label: "Average rating", value: data.summary.averageRating },
      ...data.headcountByDepartment.map((item) => ({
        section: "Headcount by department",
        label: item.department,
        value: item.employees,
      })),
      ...data.attendanceTrend.flatMap((item) => [
        { section: "Attendance", label: `${item.date} present`, value: item.present },
        { section: "Attendance", label: `${item.date} late`, value: item.late },
        { section: "Attendance", label: `${item.date} absent`, value: item.absent },
      ]),
      ...data.leaveByType.map((item) => ({
        section: "Leave by type",
        label: `${item.type} days`,
        value: item.days,
      })),
      ...data.recruitmentFunnel.map((item) => ({
        section: "Recruitment funnel",
        label: item.stage,
        value: item.count,
      })),
      ...data.ratingDistribution.map((item) => ({
        section: "Rating distribution",
        label: `${item.rating} stars`,
        value: item.count,
      })),
    ];

    downloadCsv(`people-hub-report-${MOCK_TODAY}.csv`, toCsv(rows));
    toast.success("Report exported as CSV");
  }

  if (reportsQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports & Analytics" description="People operations reporting and trends." />
        <ErrorState
          title="Reports unavailable"
          description="The report could not be generated."
          error={reportsQuery.error}
          onRetry={() => void reportsQuery.refetch()}
        />
      </div>
    );
  }

  if (reportsQuery.isPending || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports & Analytics" description="People operations reporting and trends." />
        <LoadingSkeleton variant="cards" count={7} />
        <LoadingSkeleton variant="table" count={4} />
      </div>
    );
  }

  const leaveChartData = data.leaveByType.filter((item) => item.days > 0 || item.requests > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description={`People operations reporting and trends as of ${data.generatedAt}.`}
        actions={
          canExport ? (
            <Button onClick={handleExport} disabled={!data}>
              <Download />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <ReportsFilters
        departments={departments}
        departmentId={departmentId}
        onDepartmentChange={setDepartmentId}
      />

      <ReportSummaryCards summary={data.summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Headcount by department"
          description="Employee distribution across departments."
        >
          {data.headcountByDepartment.length ? (
            <HeadcountByDepartmentChart data={data.headcountByDepartment} />
          ) : (
            <EmptyState title="No department data" description="No departments are available for this filter." />
          )}
        </ChartCard>

        <ChartCard
          title="Attendance trend"
          description="Present, late, and absent counts over the last seven days."
        >
          <AttendanceTrendChart data={data.attendanceTrend} />
        </ChartCard>

        <ChartCard
          title="Leave days by type"
          description="Approved and requested leave days by category."
        >
          {leaveChartData.length ? (
            <LeaveByTypeChart data={leaveChartData} />
          ) : (
            <EmptyState icon={<SearchX className="size-5" />} title="No leave data" description="No leave days recorded for this scope." />
          )}
        </ChartCard>

        <ChartCard
          title="Recruitment funnel"
          description="Applications by current pipeline stage."
        >
          <RecruitmentFunnelChart data={data.recruitmentFunnel} />
        </ChartCard>

        <ChartCard
          title="Performance rating distribution"
          description="Review counts by overall rating."
        >
          <RatingDistributionChart data={data.ratingDistribution} />
        </ChartCard>

        <ChartCard
          title="Department breakdown"
          description="Headcount and payroll cost by department."
        >
          {data.headcountByDepartment.length ? (
            <DepartmentBreakdownTable data={data.headcountByDepartment} />
          ) : (
            <EmptyState title="No breakdown data" description="No departments are available for this filter." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
