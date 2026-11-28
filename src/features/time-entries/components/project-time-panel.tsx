"use client";

import * as React from "react";
import { Plus, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  useDeleteTimeEntry,
  useTimeEntries,
} from "@/hooks/use-time-entries";
import type { Project } from "@/types/project";
import { formatDuration, type TimeEntry } from "@/types/time-entry";
import { TimeEntryFormDialog } from "./time-entry-form-dialog";
import { TimeEntryTable } from "./time-entry-table";

interface ProjectTimePanelProps {
  project: Project;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Set for employees, who may only log and manage their own time. */
  forcedEmployeeId?: string;
}

export function ProjectTimePanel({
  project,
  canCreate,
  canEdit,
  canDelete,
  forcedEmployeeId,
}: ProjectTimePanelProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<TimeEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TimeEntry | null>(null);
  const entriesQuery = useTimeEntries({ projectId: project.id, limit: 100 });
  const deleteMutation = useDeleteTimeEntry();

  const entries = entriesQuery.data?.data.items ?? [];
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const billableMinutes = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);

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
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Timer className="size-5 text-primary" />
            Project time
          </CardTitle>
          <CardDescription>
            {entries.length} entr{entries.length === 1 ? "y" : "ies"} · {formatDuration(totalMinutes)} logged ·{" "}
            {formatDuration(billableMinutes)} billable
          </CardDescription>
        </div>
        {canCreate ? (
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            Log time
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {entriesQuery.isError ? (
          <ErrorState
            title="Project time unavailable"
            description="Time entries for this project could not be loaded."
            error={entriesQuery.error}
            onRetry={() => void entriesQuery.refetch()}
          />
        ) : entriesQuery.isPending ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Timer className="size-5" />}
            title="No time logged yet"
            description="Log project work here to build billable and non-billable totals."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <TimeEntryTable
              entries={entries}
              showEmployee
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={(entry) => {
                setSelected(entry);
                setFormOpen(true);
              }}
              onDelete={setDeleteTarget}
            />
          </div>
        )}
      </CardContent>

      <TimeEntryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelected(null);
        }}
        entry={selected}
        defaultProjectId={project.id}
        forcedEmployeeId={forcedEmployeeId}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}
        title="Delete time entry?"
        description="This entry will be removed from active project reports."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </Card>
  );
}
