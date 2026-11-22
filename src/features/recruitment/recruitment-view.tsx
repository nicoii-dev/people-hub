"use client";

import * as React from "react";
import { CalendarPlus, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { RECRUITMENT_STAGE_OPTIONS } from "@/config/constants";
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import {
  useApplications,
  useCandidates,
  useInterviews,
  useJobOpenings,
  useMoveCandidate,
} from "@/hooks/use-recruitment";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import type {
  Application,
  Candidate,
  Interview,
  JobOpening,
  RecruitmentStage,
} from "@/types/recruitment";
import { ApplicationsTable } from "./components/applications-table";
import { CandidatesTable } from "./components/candidates-table";
import { InterviewsTable } from "./components/interviews-table";
import { JobOpeningsTable } from "./components/job-openings-table";
import { RecruitmentFilters } from "./components/recruitment-filters";
import { RecruitmentSummaryCards } from "./components/recruitment-summary-cards";
import { ScheduleInterviewDialog } from "./components/schedule-interview-dialog";

const EMPTY_DEPARTMENTS: Department[] = [];
const EMPTY_EMPLOYEES: Employee[] = [];
const EMPTY_JOBS: JobOpening[] = [];
const EMPTY_INTERVIEWS: Interview[] = [];
const EMPTY_CANDIDATES: Candidate[] = [];
const EMPTY_APPLICATIONS: Application[] = [];

function stageLabel(stage: RecruitmentStage) {
  return RECRUITMENT_STAGE_OPTIONS.find((option) => option.value === stage)?.label ?? stage;
}

export function RecruitmentView() {
  const [search, setSearch] = React.useState("");
  const [jobId, setJobId] = React.useState("");
  const [stage, setStage] = React.useState<RecruitmentStage | "">("");
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleApplicationId, setScheduleApplicationId] = React.useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const candidateFilterKey = debouncedSearch;
  const applicationFilterKey = `${debouncedSearch}|${jobId}|${stage}`;
  const [candidatePageState, setCandidatePageState] = React.useState({ key: candidateFilterKey, page: 1 });
  const [applicationPageState, setApplicationPageState] = React.useState({ key: applicationFilterKey, page: 1 });
  const candidatePage = candidatePageState.key === candidateFilterKey ? candidatePageState.page : 1;
  const applicationPage = applicationPageState.key === applicationFilterKey ? applicationPageState.page : 1;

  const canManage = usePermission("recruitment:manage");
  const jobsQuery = useJobOpenings();
  const departmentsQuery = useDepartments();
  const employeesQuery = useEmployees({ limit: 100 });
  const interviewsQuery = useInterviews();
  const candidatesQuery = useCandidates({ search: debouncedSearch || undefined, page: candidatePage, limit: 10 });
  const candidateLookupQuery = useCandidates({ limit: 100 });
  const applicationsQuery = useApplications({
    search: debouncedSearch || undefined,
    jobId: jobId || undefined,
    stage: stage || undefined,
    page: applicationPage,
    limit: 10,
    sort: "updatedAt",
    order: "desc",
  });
  const summaryQuery = useApplications({ limit: 200 });
  const stageMutation = useMoveCandidate();

  const jobs = jobsQuery.data?.data ?? EMPTY_JOBS;
  const departments = departmentsQuery.data?.data.items ?? EMPTY_DEPARTMENTS;
  const employees = employeesQuery.data?.data.items ?? EMPTY_EMPLOYEES;
  const interviews = interviewsQuery.data?.data ?? EMPTY_INTERVIEWS;
  const candidates = candidatesQuery.data?.data.items ?? EMPTY_CANDIDATES;
  const allCandidates = candidateLookupQuery.data?.data.items ?? EMPTY_CANDIDATES;
  const applications = applicationsQuery.data?.data.items ?? EMPTY_APPLICATIONS;
  const allApplications = summaryQuery.data?.data.items ?? EMPTY_APPLICATIONS;

  const filteredJobs = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((job) =>
      `${job.title} ${job.location} ${job.description} ${job.employmentType}`.toLowerCase().includes(query),
    );
  }, [jobs, debouncedSearch]);

  const filteredInterviews = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return interviews;
    return interviews.filter((interview) => {
      const application = allApplications.find((item) => item.id === interview.applicationId);
      const candidate = allCandidates.find((item) => item.id === application?.candidateId);
      const job = jobs.find((item) => item.id === application?.jobId);
      return `${candidate?.firstName ?? ""} ${candidate?.lastName ?? ""} ${job?.title ?? ""} ${interview.applicationId}`
        .toLowerCase()
        .includes(query);
    });
  }, [interviews, allApplications, allCandidates, jobs, debouncedSearch]);

  function clearFilters() {
    setSearch("");
    setJobId("");
    setStage("");
  }

  async function handleStageChange(application: Application, nextStage: RecruitmentStage) {
    try {
      await stageMutation.mutateAsync({ id: application.id, stage: nextStage });
      toast.success(`Stage updated to ${stageLabel(nextStage).toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The stage could not be updated.");
    }
  }

  function openSchedule(applicationId = "") {
    setScheduleApplicationId(applicationId);
    setScheduleOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment"
        description="Track job openings, candidates, applications, and interviews."
        actions={
          canManage ? (
            <Button onClick={() => openSchedule()} disabled={allApplications.length === 0}>
              <CalendarPlus />
              Schedule interview
            </Button>
          ) : undefined
        }
      />

      <RecruitmentSummaryCards
        openJobs={jobs.filter((job) => job.status === "open").length}
        candidates={candidateLookupQuery.data?.data.meta.total ?? 0}
        activeApplications={allApplications.filter(
          (application) => application.stage !== "hired" && application.stage !== "rejected",
        ).length}
        interviews={interviews.filter((interview) => interview.status === "scheduled").length}
        loading={
          jobsQuery.isPending ||
          candidateLookupQuery.isPending ||
          summaryQuery.isPending ||
          interviewsQuery.isPending
        }
      />

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card className="overflow-hidden">
            <RecruitmentFilters search={search} onSearchChange={setSearch} />
            {jobsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Job openings unavailable"
                  description="Job openings could not be loaded."
                  error={jobsQuery.error}
                  onRetry={() => void jobsQuery.refetch()}
                />
              </div>
            ) : jobsQuery.isPending ? (
              <div className="p-4"><LoadingSkeleton variant="table" count={6} /></div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No job openings found"
                  description="Try a different search term."
                />
              </div>
            ) : (
              <JobOpeningsTable jobs={filteredJobs} departments={departments} applications={allApplications} />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <Card className="overflow-hidden">
            <RecruitmentFilters search={search} onSearchChange={setSearch} />
            {candidatesQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Candidates unavailable"
                  description="Candidates could not be loaded."
                  error={candidatesQuery.error}
                  onRetry={() => void candidatesQuery.refetch()}
                />
              </div>
            ) : candidatesQuery.isPending ? (
              <div className="p-4"><LoadingSkeleton variant="table" count={8} /></div>
            ) : candidates.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No candidates found"
                  description="Try a different search term."
                />
              </div>
            ) : (
              <>
                <CandidatesTable candidates={candidates} />
                {candidatesQuery.data?.data.meta ? (
                  <Pagination
                    meta={candidatesQuery.data.data.meta}
                    onPageChange={(page) => setCandidatePageState({ key: candidateFilterKey, page })}
                  />
                ) : null}
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card className="overflow-hidden">
            <RecruitmentFilters
              search={search}
              onSearchChange={setSearch}
              jobs={jobs}
              jobId={jobId}
              onJobChange={setJobId}
              stage={stage}
              onStageChange={setStage}
            />
            {applicationsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Applications unavailable"
                  description="Applications could not be loaded."
                  error={applicationsQuery.error}
                  onRetry={() => void applicationsQuery.refetch()}
                />
              </div>
            ) : applicationsQuery.isPending ? (
              <div className="p-4"><LoadingSkeleton variant="table" count={8} /></div>
            ) : applications.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No applications found"
                  description="Try a different filter or clear the active filters."
                  action={
                    search || jobId || stage ? (
                      <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <>
                <ApplicationsTable
                  applications={applications}
                  candidates={allCandidates}
                  jobs={jobs}
                  canManage={canManage}
                  onStageChange={handleStageChange}
                  onSchedule={(application) => openSchedule(application.id)}
                />
                {applicationsQuery.data?.data.meta ? (
                  <Pagination
                    meta={applicationsQuery.data.data.meta}
                    onPageChange={(page) => setApplicationPageState({ key: applicationFilterKey, page })}
                  />
                ) : null}
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <Card className="overflow-hidden">
            <RecruitmentFilters search={search} onSearchChange={setSearch} />
            {interviewsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Interviews unavailable"
                  description="Interviews could not be loaded."
                  error={interviewsQuery.error}
                  onRetry={() => void interviewsQuery.refetch()}
                />
              </div>
            ) : interviewsQuery.isPending ? (
              <div className="p-4"><LoadingSkeleton variant="table" count={6} /></div>
            ) : filteredInterviews.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No interviews found"
                  description="Schedule an interview from the Applications tab."
                />
              </div>
            ) : (
              <InterviewsTable
                interviews={filteredInterviews}
                applications={allApplications}
                jobs={jobs}
                employees={employees}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        applications={allApplications}
        candidates={allCandidates}
        jobs={jobs}
        employees={employees}
        defaultApplicationId={scheduleApplicationId}
      />
    </div>
  );
}
