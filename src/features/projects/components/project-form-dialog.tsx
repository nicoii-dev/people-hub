"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useClients } from "@/hooks/use-clients";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import type { Client } from "@/types/client";
import { PROJECT_STATUS_TRANSITIONS, type Project } from "@/types/project";
import {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  projectFormSchema,
  projectFormToInput,
  projectToFormValues,
  type ProjectFormValues,
} from "../schemas";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The project could not be saved.";
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const clientsQuery = useClients({ limit: 100 });
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectToFormValues(project),
  });
  const { reset, control, register, handleSubmit, formState } = form;
  const pending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    reset(projectToFormValues(project));
  }, [project, open, reset]);

  const clients = React.useMemo(() => {
    const items: Client[] = clientsQuery.data?.data.items ?? [];
    const active = items.filter((client) => client.status === "active" && !client.deletedAt);
    if (project && !active.some((client) => client.id === project.clientId)) {
      active.unshift({
        id: project.clientId,
        name: project.clientName || "Current client",
        companyName: "",
        code: project.clientCode || "—",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        industry: "",
        description: "",
        status: "inactive",
        projectCount: 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        deletedAt: null,
      });
    }
    return active;
  }, [clientsQuery.data, project]);

  const statusOptions = React.useMemo(() => {
    if (!project) return PROJECT_STATUS_OPTIONS.filter((option) => option.value !== "cancelled");
    const allowed = [project.status, ...PROJECT_STATUS_TRANSITIONS[project.status]];
    return PROJECT_STATUS_OPTIONS.filter((option) =>
      allowed.includes(option.value as (typeof allowed)[number]),
    );
  }, [project]);

  async function onSubmit(values: ProjectFormValues) {
    const input = projectFormToInput(values);
    try {
      if (project) {
        await updateMutation.mutateAsync({ id: project.id, input });
        toast.success("Project updated successfully");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Project created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={project ? "Edit project" : "New project"}
      description={
        project
          ? "Update the project details. Status changes use the workflow on the detail page."
          : "Create a project for an active client."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Project name" htmlFor="projectName" error={formState.errors.name?.message}>
            <Input id="projectName" {...register("name")} placeholder="Website Redesign" />
          </FormField>
          <FormField label="Code" htmlFor="projectCode" error={formState.errors.code?.message}>
            <Input id="projectCode" {...register("code")} placeholder="WEBRED" />
          </FormField>
        </div>

        <FormField label="Client" htmlFor="projectClient" error={formState.errors.clientId?.message}>
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="projectClient">
                  <SelectValue placeholder="Select an active client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="projectDescription"
          error={formState.errors.description?.message}
        >
          <Textarea id="projectDescription" {...register("description")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" error={formState.errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Priority" error={formState.errors.priority?.message}>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start date" htmlFor="projectStart" error={formState.errors.startDate?.message}>
            <Input id="projectStart" type="date" {...register("startDate")} />
          </FormField>
          <FormField label="End date" htmlFor="projectEnd" error={formState.errors.endDate?.message}>
            <Input id="projectEnd" type="date" {...register("endDate")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Budget (PHP)" htmlFor="projectBudget" error={formState.errors.budget?.message}>
            <Input
              id="projectBudget"
              type="number"
              min="0"
              step="0.01"
              {...register("budget")}
              placeholder="850000"
            />
          </FormField>
          <FormField label="Billable" hint="Track this project against billable hours.">
            <Controller
              control={control}
              name="billable"
              render={({ field }) => (
                <div className="flex h-10 items-center gap-3">
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="projectBillable" />
                  <span className="text-sm text-muted-foreground">
                    {field.value ? "Billable" : "Non-billable"}
                  </span>
                </div>
              )}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
