"use client";

import * as React from "react";
import {
  Banknote,
  BriefcaseBusiness,
  Clock3,
  Download,
  SearchX,
  Timer,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { usePermission } from "@/features/auth/hooks";
import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { useProjectReport } from "@/hooks/use-project-report";
import { downloadCsv } from "@/lib/csv";
import { projectReportService } from "@/services/project-report.service";
import { formatDuration } from "@/types/time-entry";
import type { ProjectReportQuery } from "@/types/project-report";
import { HoursByProjectChart } from "./charts/hours-by-project-chart";
import { ClientReportTable, ProjectReportTable } from "./project-report-tables";

export function ProjectReportSection() {
  const canExport = usePermission("reports:export");
  const [clientId, setClientId] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [billable, setBillable] = React.useState("");

  const clientsQuery = useClients({ limit: 100 });
  const projectsQuery = useProjects({ limit: 100 });
  const query = React.useMemo<ProjectReportQuery>(
    () => ({
      ...(clientId ? { clientId } : {}),
      ...(projectId ? { projectId } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(billable === "" ? {} : { billable: billable === "true" }),
    }),
    [clientId, projectId, from, to, billable],
  );
  const reportQuery = useProjectReport(query);
  const report = reportQuery.data?.data;
  const [exporting, setExporting] = React.useState(false);

  const clientOptions = React.useMemo(
    () =>
      (clientsQuery.data?.data.items ?? []).map((client) => ({
        label: client.name,
        value: client.id,
      })),
    [clientsQuery.data],
  );
  const projectOptions = React.useMemo(
    () =>
      (projectsQuery.data?.data.items ?? [])
        .filter((project) => !project.deletedAt)
        .map((project) => ({
          label: `${project.name} (${project.code})`,
          value: project.id,
        })),
    [projectsQuery.data],
  );

  async function handleExport() {
    setExporting(true);
    try {
      const result = await projectReportService.exportReport(query);
      downloadCsv(result.fileName, result.content);
      toast.success("Project report exported as CSV");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The project report could not be exported.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Client &amp; project report</h2>
          <p className="text-sm text-muted-foreground">
            Engagement totals and logged time across clients and projects.
          </p>
        </div>
        {canExport ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
            disabled={!report || exporting}
          >
            <Download />
            {exporting ? "Exporting…" : "Export project CSV"}
          </Button>
        ) : null}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <FilterDropdown
            value={clientId}
            onValueChange={(value) => {
              setClientId(value);
              setProjectId("");
            }}
            options={clientOptions}
            placeholder="Filter by client"
            emptyLabel="All clients"
          />
          <FilterDropdown
            value={projectId}
            onValueChange={setProjectId}
            options={projectOptions}
            placeholder="Filter by project"
            emptyLabel="All projects"
          />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              aria-label="Report from date"
              className="w-full sm:w-40"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-label="Report to date"
              className="w-full sm:w-40"
            />
          </div>
          <FilterDropdown
            value={billable}
            onValueChange={setBillable}
            options={[
              { label: "Billable", value: "true" },
              { label: "Non-billable", value: "false" },
            ]}
            placeholder="Filter by type"
            emptyLabel="All types"
            className="lg:ml-auto"
          />
        </CardContent>

        <CardContent className="space-y-5">
          {reportQuery.isError ? (
            <ErrorState
              title="Project report unavailable"
              description="Client and project totals could not be generated."
              error={reportQuery.error}
              onRetry={() => void reportQuery.refetch()}
            />
          ) : reportQuery.isPending || !report ? (
            <>
              <LoadingSkeleton variant="cards" count={4} />
              <LoadingSkeleton variant="table" count={5} />
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Clients"
                  value={report.totals.clients}
                  icon={BriefcaseBusiness}
                  description="Clients in this report"
                />
                <StatCard
                  title="Projects"
                  value={report.totals.projects}
                  icon={Banknote}
                  description={`${report.totals.activeProjects} active · ${report.totals.completedProjects} completed`}
                />
                <StatCard
                  title="Team assignments"
                  value={report.totals.assignments}
                  icon={UsersRound}
                  description="Assignments on matching projects"
                />
                <StatCard
                  title="Hours logged"
                  value={formatDuration(report.totals.durationMinutes)}
                  icon={Timer}
                  description={`${formatDuration(report.totals.billableMinutes)} billable`}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock3 className="size-5 text-primary" />
                      Hours by project
                    </CardTitle>
                    <CardDescription>Logged time per project in the selected range.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {report.projects.length ? (
                      <HoursByProjectChart data={report.projects} />
                    ) : (
                      <EmptyState
                        icon={<SearchX className="size-5" />}
                        title="No project time"
                        description="No projects or time entries match these filters."
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>Project counts and logged time by client.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {report.clients.length ? (
                      <ClientReportTable data={report.clients} />
                    ) : (
                      <EmptyState title="No clients" description="No clients match these filters." />
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Project breakdown</CardTitle>
                  <CardDescription>
                    Team size, entry counts and budgets for matching projects.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.projects.length ? (
                    <ProjectReportTable data={report.projects} />
                  ) : (
                    <EmptyState title="No projects" description="No projects match these filters." />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
