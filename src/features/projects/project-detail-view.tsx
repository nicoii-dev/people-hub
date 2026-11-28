"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { canReviewAllTimeEntries } from "@/config/permissions";
import { useAuth, usePermission } from "@/features/auth/hooks";
import {
  useDeleteProject,
  useProject,
  useUpdateProjectStatus,
} from "@/hooks/use-projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PROJECT_STATUS_TRANSITIONS,
  type Project,
  type ProjectStatus,
} from "@/types/project";
import { PROJECT_STATUS_OPTIONS } from "./schemas";
import { ProjectTimePanel } from "@/features/time-entries/components/project-time-panel";
import { ProjectFormDialog } from "./components/project-form-dialog";
import { ProjectTagsPanel } from "./components/project-tags-panel";
import { ProjectTeamPanel } from "./components/project-team-panel";

interface ProjectDetailViewProps {
  projectId: string;
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const canEdit = usePermission("projects:edit");
  const canDelete = usePermission("projects:delete");
  const canAssign = usePermission("projects:assign");
  const canLogTime = usePermission("time-entries:create");
  const canEditTime = usePermission("time-entries:edit");
  const canDeleteTime = usePermission("time-entries:delete");
  const reviewAllTime = canReviewAllTimeEntries(user?.role);
  const projectQuery = useProject(projectId);
  const statusMutation = useUpdateProjectStatus();
  const deleteMutation = useDeleteProject();

  if (projectQuery.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Project details" description="Loading project record…" />
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    const message = projectQuery.error instanceof Error ? projectQuery.error.message : "";
    if (message.toLowerCase().includes("not found")) {
      return (
        <EmptyState
          title="Project not found"
          description="This project does not exist or was removed."
          action={
            <Button asChild variant="outline">
              <Link href="/projects">
                <ArrowLeft />
                Back to projects
              </Link>
            </Button>
          }
        />
      );
    }

    return (
      <ErrorState
        title="Project unavailable"
        description="The project record could not be loaded."
        error={projectQuery.error}
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }

  const project: Project = projectQuery.data.data;
  const transitions = PROJECT_STATUS_TRANSITIONS[project.status];

  async function handleStatus(status: ProjectStatus) {
    try {
      await statusMutation.mutateAsync({ id: projectId, status });
      toast.success(`Project moved to ${status.replaceAll("_", " ")}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The status could not be changed.");
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(projectId);
      toast.success("Project deleted successfully");
      setDeleteOpen(false);
      router.push("/projects");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The project could not be deleted.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={`Project record · ${project.code}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/projects">
                <ArrowLeft />
                Back
              </Link>
            </Button>
            {canEdit && transitions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Change status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Move to</DropdownMenuLabel>
                  {PROJECT_STATUS_OPTIONS.filter((option) =>
                    transitions.includes(option.value as ProjectStatus),
                  ).map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      disabled={statusMutation.isPending}
                      onSelect={() => void handleStatus(option.value as ProjectStatus)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {canEdit ? (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil />
                Edit project
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project overview</CardTitle>
            <CardDescription>Delivery details and classification.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Project" value={project.name} />
            <Detail label="Code" value={<Badge variant="secondary">{project.code}</Badge>} />
            <Detail label="Client" value={project.clientName || "—"} />
            <Detail label="Status" value={<StatusBadge status={project.status} />} />
            <Detail label="Priority" value={<StatusBadge status={project.priority} />} />
            <Detail label="Budget" value={project.budget === null ? "—" : formatCurrency(project.budget)} />
            <Detail label="Start date" value={project.startDate ? formatDate(project.startDate) : "—"} />
            <Detail label="End date" value={project.endDate ? formatDate(project.endDate) : "—"} />
            <Detail label="Billable" value={project.billable ? "Yes" : "No"} />
            <Detail label="Team size" value={project.assignments.length} />
            <div className="sm:col-span-2">
              <Detail label="Description" value={project.description} />
            </div>
          </CardContent>
        </Card>

        <ProjectTagsPanel project={project} canEdit={canEdit} />
        <ProjectTeamPanel project={project} canAssign={canAssign} />

        <ProjectTimePanel
          project={project}
          canCreate={canLogTime}
          canEdit={canEditTime}
          canDelete={canDeleteTime}
          forcedEmployeeId={reviewAllTime ? undefined : user?.employeeId}
        />

        <Card>
          <CardHeader>
            <CardTitle>Record metadata</CardTitle>
            <CardDescription>Audit information for this project.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Project ID" value={<span className="font-mono text-xs">{project.id}</span>} />
            <Detail label="Created by" value={project.createdByName || "—"} />
            <Detail label="Created" value={formatDate(project.createdAt)} />
            <Detail label="Updated" value={formatDate(project.updatedAt)} />
            <Detail
              label="Deleted"
              value={project.deletedAt ? formatDate(project.deletedAt) : "—"}
            />
          </CardContent>
        </Card>
      </div>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project?"
        description={`${project.name} will be removed from the active project list. Historical time entries remain available.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
