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
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { NO_SELECTION } from "@/config/constants";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/use-departments";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import {
  departmentFormToInput,
  departmentToFormValues,
  departmentFormSchema,
  type DepartmentFormValues,
} from "../schemas";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  departments: Department[];
  employees: Employee[];
}

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The department could not be saved.";
}

function withDescendants(departments: Department[], rootId: string) {
  const blocked = new Set([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const department of departments) {
      if (department.parentId && blocked.has(department.parentId) && !blocked.has(department.id)) {
        blocked.add(department.id);
        changed = true;
      }
    }
  }

  return blocked;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  departments,
  employees,
}: DepartmentFormDialogProps) {
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: departmentToFormValues(department),
  });
  const { reset, control, register, handleSubmit, formState } = form;
  const pending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    reset(departmentToFormValues(department));
  }, [department, open, reset]);

  const blockedParentIds = department ? withDescendants(departments, department.id) : new Set<string>();
  const availableManagers = employees.filter((employee) => employee.employmentStatus !== "archived");

  async function onSubmit(values: DepartmentFormValues) {
    const input = departmentFormToInput(values);
    try {
      if (department) {
        await updateMutation.mutateAsync({ id: department.id, input });
        toast.success("Department updated successfully");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Department created successfully");
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
      title={department ? "Edit department" : "Add department"}
      description={department ? "Update the department details." : "Create a new department in the organization."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Department name" htmlFor="departmentName" error={formState.errors.name?.message}>
            <Input id="departmentName" {...register("name")} />
          </FormField>
          <FormField label="Code" htmlFor="departmentCode" error={formState.errors.code?.message}>
            <Input id="departmentCode" {...register("code")} placeholder="ENG" />
          </FormField>
        </div>

        <FormField label="Description" htmlFor="departmentDescription" error={formState.errors.description?.message}>
          <Textarea id="departmentDescription" {...register("description")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Location" htmlFor="departmentLocation" error={formState.errors.location?.message}>
            <Input id="departmentLocation" {...register("location")} />
          </FormField>
          <FormField label="Manager" error={formState.errors.managerId?.message}>
            <Controller
              control={control}
              name="managerId"
              render={({ field }) => (
                <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>No manager</SelectItem>
                    {availableManagers.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <FormField label="Parent department" error={formState.errors.parentId?.message}>
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No parent department</SelectItem>
                  {departments
                    .filter((item) => !blockedParentIds.has(item.id))
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : department ? "Save changes" : "Create department"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
