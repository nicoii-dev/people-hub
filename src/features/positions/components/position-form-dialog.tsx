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
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { NO_SELECTION, POSITION_LEVEL_OPTIONS } from "@/config/constants";
import { useCreatePosition, useUpdatePosition } from "@/hooks/use-departments";
import type { Department } from "@/types/department";
import type { Position } from "@/types/position";
import {
  positionFormToInput,
  positionToFormValues,
  positionFormSchema,
  type PositionFormValues,
} from "../schemas";

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position | null;
  departments: Department[];
}

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The position could not be saved.";
}

export function PositionFormDialog({
  open,
  onOpenChange,
  position,
  departments,
}: PositionFormDialogProps) {
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: positionToFormValues(position),
  });
  const { reset, control, register, handleSubmit, formState } = form;
  const pending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    reset(positionToFormValues(position));
  }, [position, open, reset]);

  async function onSubmit(values: PositionFormValues) {
    const input = positionFormToInput(values);
    try {
      if (position) {
        await updateMutation.mutateAsync({ id: position.id, input });
        toast.success("Position updated successfully");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Position created successfully");
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
      title={position ? "Edit position" : "Add position"}
      description={position ? "Update the position details." : "Create a new position in the organization."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Position title" htmlFor="positionTitle" error={formState.errors.title?.message}>
            <Input id="positionTitle" {...register("title")} />
          </FormField>
          <FormField label="Code" htmlFor="positionCode" error={formState.errors.code?.message}>
            <Input id="positionCode" {...register("code")} placeholder="SE" />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Department" error={formState.errors.departmentId?.message}>
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION} disabled>Select department</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Level" error={formState.errors.level?.message}>
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POSITION_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Salary grade" htmlFor="salaryGrade" error={formState.errors.salaryGrade?.message}>
            <Input
              id="salaryGrade"
              type="number"
              min={1}
              max={100}
              {...register("salaryGrade", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Minimum salary" htmlFor="salaryMin" error={formState.errors.salaryMin?.message}>
            <Input
              id="salaryMin"
              type="number"
              min={0}
              step={100}
              {...register("salaryMin", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Maximum salary" htmlFor="salaryMax" error={formState.errors.salaryMax?.message}>
            <Input
              id="salaryMax"
              type="number"
              min={0}
              step={100}
              {...register("salaryMax", { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : position ? "Save changes" : "Create position"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
