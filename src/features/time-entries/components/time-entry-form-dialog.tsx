"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { useEmployees } from "@/hooks/use-employees";
import { useProjects } from "@/hooks/use-projects";
import {
  useCreateTimeEntry,
  useUpdateTimeEntry,
} from "@/hooks/use-time-entries";
import type { Project } from "@/types/project";
import type { TimeEntry } from "@/types/time-entry";
import {
  timeEntryFormSchema,
  timeEntryFormToInput,
  timeEntryToFormValues,
  type TimeEntryFormValues,
} from "../schemas";

interface TimeEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: TimeEntry | null;
  /** Pre-select a project when launched from its detail page. */
  defaultProjectId?: string;
  /** Employees without cross-company access can only log their own time. */
  forcedEmployeeId?: string;
}

export function TimeEntryFormDialog({
  open,
  onOpenChange,
  entry,
  defaultProjectId,
  forcedEmployeeId,
}: TimeEntryFormDialogProps) {
  const createMutation = useCreateTimeEntry();
  const updateMutation = useUpdateTimeEntry();
  const projectsQuery = useProjects({ limit: 100 });
  const employeesQuery = useEmployees({ status: "active", limit: 100 });
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: timeEntryToFormValues(entry, {
      projectId: defaultProjectId,
      employeeId: forcedEmployeeId,
    }),
  });
  const { reset, control, register, handleSubmit, formState } = form;
  const pending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    reset(
      timeEntryToFormValues(entry, {
        projectId: defaultProjectId,
        employeeId: forcedEmployeeId,
      }),
    );
  }, [entry, defaultProjectId, forcedEmployeeId, open, reset]);

  const projects = React.useMemo(() => {
    const items: Project[] = projectsQuery.data?.data.items ?? [];
    const options = items.filter(
      (project) => !project.deletedAt && project.status !== "cancelled",
    );
    if (entry && !options.some((project) => project.id === entry.projectId)) {
      options.unshift({
        id: entry.projectId,
        clientId: "",
        clientName: "",
        clientCode: "",
        name: entry.projectName ?? "Current project",
        code: entry.projectCode ?? "—",
        description: "",
        status: "cancelled",
        priority: "medium",
        startDate: "",
        endDate: "",
        budget: null,
        billable: entry.billable,
        createdById: null,
        createdByName: null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        deletedAt: null,
        tags: [],
        assignments: [],
      });
    }
    return options;
  }, [projectsQuery.data, entry]);

  const employees = React.useMemo(
    () => employeesQuery.data?.data.items ?? [],
    [employeesQuery.data],
  );

  async function onSubmit(values: TimeEntryFormValues) {
    const input = timeEntryFormToInput(values);
    try {
      if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, input });
        toast.success("Time entry updated successfully");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Time entry logged successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The time entry could not be saved.",
      );
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={entry ? "Edit time entry" : "Log time"}
      description="Record billable or non-billable work against a project."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Project" error={formState.errors.projectId?.message}>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="timeEntryProject">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {forcedEmployeeId ? (
          <input type="hidden" {...register("employeeId")} />
        ) : (
          <FormField label="Employee" error={formState.errors.employeeId?.message}>
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="timeEntryEmployee">
                    <SelectValue placeholder="Select an active employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        )}

        <FormField
          label="Work date"
          htmlFor="timeEntryDate"
          error={formState.errors.workDate?.message}
        >
          <Input id="timeEntryDate" type="date" {...register("workDate")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Start time"
            htmlFor="timeEntryStart"
            error={formState.errors.startTime?.message}
            hint="Optional; provide together with end time."
          >
            <Input id="timeEntryStart" type="time" {...register("startTime")} />
          </FormField>
          <FormField
            label="End time"
            htmlFor="timeEntryEnd"
            error={formState.errors.endTime?.message}
          >
            <Input id="timeEntryEnd" type="time" {...register("endTime")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Duration (minutes)"
            htmlFor="timeEntryDuration"
            error={formState.errors.durationMinutes?.message}
            hint="Between 1 and 1440; 480 is a full day."
          >
            <Input
              id="timeEntryDuration"
              type="number"
              min={1}
              max={1440}
              step={1}
              {...register("durationMinutes")}
              placeholder="480"
            />
          </FormField>
          <FormField label="Billable" hint="Non-billable work still counts toward totals.">
            <Controller
              control={control}
              name="billable"
              render={({ field }) => (
                <div className="flex h-10 items-center gap-3">
                  <Switch
                    id="timeEntryBillable"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value ? "Billable" : "Non-billable"}
                  </span>
                </div>
              )}
            />
          </FormField>
        </div>

        <FormField
          label="Description"
          htmlFor="timeEntryDescription"
          error={formState.errors.description?.message}
        >
          <Textarea
            id="timeEntryDescription"
            {...register("description")}
            placeholder="What was worked on?"
          />
        </FormField>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : entry ? "Save changes" : "Log time"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
