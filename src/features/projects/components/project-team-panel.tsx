"use client";

import * as React from "react";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useEmployees } from "@/hooks/use-employees";
import {
  useAssignEmployee,
  useUnassignEmployee,
  useUpdateAssignmentRole,
} from "@/hooks/use-projects";
import { formatDate } from "@/lib/utils";
import type { ProjectAssignmentRole } from "@/types/project";
import type { Project } from "@/types/project";
import { PROJECT_ASSIGNMENT_ROLE_OPTIONS } from "../schemas";

interface ProjectTeamPanelProps {
  project: Project;
  canAssign: boolean;
}

export function ProjectTeamPanel({ project, canAssign }: ProjectTeamPanelProps) {
  const [employeeId, setEmployeeId] = React.useState("");
  const [role, setRole] = React.useState<ProjectAssignmentRole>("member");
  const employeesQuery = useEmployees({ status: "active", limit: 100 });
  const assignMutation = useAssignEmployee();
  const roleMutation = useUpdateAssignmentRole();
  const unassignMutation = useUnassignEmployee();

  const availableEmployees = React.useMemo(() => {
    const assigned = new Set(project.assignments.map((item) => item.employeeId));
    return (employeesQuery.data?.data.items ?? []).filter(
      (employee) => !assigned.has(employee.id) && employee.employmentStatus === "active",
    );
  }, [employeesQuery.data, project.assignments]);

  async function handleAssign() {
    if (!employeeId) return;
    try {
      await assignMutation.mutateAsync({
        projectId: project.id,
        input: { employeeId, role },
      });
      setEmployeeId("");
      setRole("member");
      toast.success("Employee assigned to project");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The employee could not be assigned.");
    }
  }

  async function handleRole(assignmentId: string, nextRole: ProjectAssignmentRole) {
    try {
      await roleMutation.mutateAsync({
        projectId: project.id,
        assignmentId,
        role: nextRole,
      });
      toast.success("Assignment role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The role could not be updated.");
    }
  }

  async function handleUnassign(assignmentId: string) {
    try {
      await unassignMutation.mutateAsync({ projectId: project.id, assignmentId });
      toast.success("Employee unassigned");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The employee could not be unassigned.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>
          {project.assignments.length} member(s) assigned to this project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.assignments.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="size-5" />}
            title="No one assigned"
            description="Assign team members to track ownership and billable time."
          />
        ) : (
          <div className="divide-y rounded-md border">
            {project.assignments.map((assignment) => (
              <div key={assignment.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{assignment.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.employeeNumber} · Assigned {formatDate(assignment.assignedAt)}
                  </p>
                </div>
                {canAssign ? (
                  <Select
                    value={assignment.role}
                    onValueChange={(value) =>
                      void handleRole(assignment.id, value as ProjectAssignmentRole)
                    }
                  >
                    <SelectTrigger className="w-32" aria-label="Assignment role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_ASSIGNMENT_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status={assignment.role} />
                )}
                {canAssign ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleUnassign(assignment.id)}
                    aria-label={`Unassign ${assignment.employeeName}`}
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {canAssign ? (
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full sm:max-w-xs" aria-label="Employee to assign">
                <SelectValue placeholder="Select an active employee" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={(value) => setRole(value as ProjectAssignmentRole)}>
              <SelectTrigger className="w-full sm:w-36" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_ASSIGNMENT_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => void handleAssign()}
              disabled={!employeeId || assignMutation.isPending}
            >
              <Plus />
              Assign
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
