"use client";

import * as React from "react";
import {
  Banknote,
  Clock3,
  Info,
  ListChecks,
  Plus,
  SearchX,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { canReviewAllTimeEntries } from "@/config/permissions";
import { useAuth, usePermission } from "@/features/auth/hooks";
import { useEmployees } from "@/hooks/use-employees";
import { useProjects } from "@/hooks/use-projects";
import {
  useDeleteTimeEntry,
  useTimeEntries,
} from "@/hooks/use-time-entries";
import { formatDuration, type TimeEntry, type TimeEntryListParams } from "@/types/time-entry";
import { TimeEntryFormDialog } from "./components/time-entry-form-dialog";
import { TimeEntryTable } from "./components/time-entry-table";

const EMPTY_ENTRIES: TimeEntry[] = [];

export function TimeEntriesView() {
  const { user } = useAuth();
  const canCreate = usePermission("time-entries:create");
  const canEdit = usePermission("time-entries:edit");
  const canDelete = usePermission("time-entries:delete");
  const reviewAll = canReviewAllTimeEntries(user?.role);

  const [projectId, setProjectId] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [billable, setBillable] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<TimeEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TimeEntry | null>(null);

  const params = React.useMemo<TimeEntryListParams>(
    () => ({
      projectId,
      employeeId: reviewAll ? employeeId : (user?.employeeId ?? "__none__"),
      from,
      to,
      billable: billable === "" ? undefined : billable === "true",
      limit: 100,
      sort: "workDate",
      order: "desc",
    }),
    [projectId, employeeId, reviewAll, user?.employeeId, from, to, billable],
  );

  const entriesQuery = useTimeEntries(params);
  const projectsQuery = useProjects({ limit: 100 });
  const employeesQuery = useEmployees({ limit: 100 });
  const deleteMutation = useDeleteTimeEntry();

  const entries = entriesQuery.data?.data.items ?? EMPTY_ENTRIES;
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const billableMinutes = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const projectOptions = React.useMemo(
    () =>
      (projectsQuery.data?.data.items ?? [])
        .filter((project) => !project.deletedAt)
        .map((project) => ({ label: project.name, value: project.id })),
    [projectsQuery.data],
  );
  const employeeOptions = React.useMemo(
    () =>
      (employeesQuery.data?.data.items ?? []).map((employee) => ({
        label: `${employee.firstName} ${employee.lastName} (${employee.employeeNumber})`,
        value: employee.id,
      })),
    [employeesQuery.data],
  );

  function openCreate() {
    setSelected(null);
    setFormOpen(true);
  }

  function openEdit(entry: TimeEntry) {
    setSelected(entry);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Time entry deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The time entry could not be deleted.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Entries"
        description="Log project work and review billable hours across your team."
        actions={
          canCreate ? (
            <Button onClick={openCreate}>
              <Plus />
              Log time
            </Button>
          ) : undefined
        }
      />

      {!reviewAll ? (
        <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          You can only view and manage your own time entries.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Entries"
          value={entries.length}
          icon={ListChecks}
          description="Entries in the current view"
          loading={entriesQuery.isPending}
        />
        <StatCard
          title="Hours logged"
          value={formatDuration(totalMinutes)}
          icon={Timer}
          description="All entries in the current view"
          loading={entriesQuery.isPending}
        />
        <StatCard
          title="Billable"
          value={formatDuration(billableMinutes)}
          icon={Banknote}
          description="Billable hours logged"
          loading={entriesQuery.isPending}
        />
        <StatCard
          title="Non-billable"
          value={formatDuration(totalMinutes - billableMinutes)}
          icon={Clock3}
          description="Internal or non-chargeable work"
          loading={entriesQuery.isPending}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <FilterDropdown
            value={projectId}
            onValueChange={setProjectId}
            options={projectOptions}
            placeholder="Filter by project"
            emptyLabel="All projects"
          />
          {reviewAll ? (
            <FilterDropdown
              value={employeeId}
              onValueChange={setEmployeeId}
              options={employeeOptions}
              placeholder="Filter by employee"
              emptyLabel="All employees"
            />
          ) : null}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              aria-label="From date"
              className="w-full sm:w-40"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-label="To date"
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
        </div>

        {entriesQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Time entries unavailable"
              description="The time entry list could not be loaded."
              error={entriesQuery.error}
              onRetry={() => void entriesQuery.refetch()}
            />
          </div>
        ) : entriesQuery.isPending ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" count={8} />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title="No time entries"
              description="Try a different filter, or log time against a project."
              action={
                canCreate ? (
                  <Button onClick={openCreate}>
                    <Plus />
                    Log time
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <TimeEntryTable
            entries={entries}
            showEmployee={reviewAll}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </Card>

      <TimeEntryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={selected}
        forcedEmployeeId={reviewAll ? undefined : user?.employeeId}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}
        title="Delete time entry?"
        description={`${deleteTarget?.projectName ?? "This entry"} on ${deleteTarget ? formatDuration(deleteTarget.durationMinutes) : ""} will be removed from active reports.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
