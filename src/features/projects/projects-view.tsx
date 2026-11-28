"use client";

import * as React from "react";
import {
  CheckCircle2,
  CirclePause,
  Plus,
  SearchX,
  SquareKanban,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { usePermission } from "@/features/auth/hooks";
import { useClients } from "@/hooks/use-clients";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useDeleteProject,
  useProjects,
} from "@/hooks/use-projects";
import type { Project, ProjectListParams, ProjectPriority, ProjectStatus } from "@/types/project";
import { ProjectFormDialog } from "./components/project-form-dialog";
import { ProjectTable } from "./components/project-table";

const EMPTY_PROJECTS: Project[] = [];

export function ProjectsView() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = React.useState<ProjectPriority | "">("");
  const [clientFilter, setClientFilter] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);
  const canAdd = usePermission("projects:create");
  const canEdit = usePermission("projects:edit");
  const canDelete = usePermission("projects:delete");
  const params = React.useMemo<ProjectListParams>(
    () => ({
      search: debouncedSearch,
      status: statusFilter,
      priority: priorityFilter,
      clientId: clientFilter,
      limit: 100,
    }),
    [debouncedSearch, statusFilter, priorityFilter, clientFilter],
  );
  const projectsQuery = useProjects(params);
  const clientsQuery = useClients({ limit: 100 });
  const deleteMutation = useDeleteProject();

  const allProjects = projectsQuery.data?.data.items ?? EMPTY_PROJECTS;
  const activeCount = allProjects.filter((project) => project.status === "active").length;
  const planningCount = allProjects.filter((project) => project.status === "planning").length;
  const completedCount = allProjects.filter((project) => project.status === "completed").length;
  const clientOptions = React.useMemo(
    () =>
      (clientsQuery.data?.data.items ?? []).map((client) => ({
        label: client.name,
        value: client.id,
      })),
    [clientsQuery.data],
  );

  function openCreate() {
    setSelectedProject(null);
    setFormOpen(true);
  }

  function openEdit(project: Project) {
    setSelectedProject(project);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Project deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request could not be completed.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Plan delivery, track status, and manage project teams."
        actions={
          canAdd ? (
            <Button onClick={openCreate}>
              <Plus />
              New project
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Projects"
          value={allProjects.length}
          icon={SquareKanban}
          description="Projects in the current view"
          loading={projectsQuery.isPending}
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={TrendingUp}
          description="Currently in delivery"
          loading={projectsQuery.isPending}
        />
        <StatCard
          title="Planning"
          value={planningCount}
          icon={CirclePause}
          description="Not started yet"
          loading={projectsQuery.isPending}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          description="Successfully delivered"
          loading={projectsQuery.isPending}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search projects…"
            className="w-full lg:max-w-xs"
          />
          <FilterDropdown
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ProjectStatus | "")}
            options={[
              { label: "Planning", value: "planning" },
              { label: "Active", value: "active" },
              { label: "On Hold", value: "on_hold" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            placeholder="Filter by status"
          />
          <FilterDropdown
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as ProjectPriority | "")}
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]}
            placeholder="Filter by priority"
          />
          <FilterDropdown
            value={clientFilter}
            onValueChange={setClientFilter}
            options={clientOptions}
            placeholder="Filter by client"
            emptyLabel="All clients"
            className="lg:ml-auto"
          />
        </div>

        {projectsQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Projects unavailable"
              description="The project list could not be loaded."
              error={projectsQuery.error}
              onRetry={() => void projectsQuery.refetch()}
            />
          </div>
        ) : projectsQuery.isPending ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" count={8} />
          </div>
        ) : allProjects.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title={search || statusFilter || priorityFilter || clientFilter ? "No matching projects" : "No projects yet"}
              description={
                search || statusFilter || priorityFilter || clientFilter
                  ? "Try a different search term or filter."
                  : "Create a project to start tracking delivery."
              }
              action={
                !search && !statusFilter && !priorityFilter && !clientFilter && canAdd ? (
                  <Button onClick={openCreate}>
                    <Plus />
                    New project
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <ProjectTable
            projects={allProjects}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </Card>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={selectedProject}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete project?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be removed from the active project list. Historical time entries remain available.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
