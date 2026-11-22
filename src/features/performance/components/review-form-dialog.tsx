"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import {
  NO_SELECTION,
  RATING_OPTIONS,
  REVIEW_PERIOD_OPTIONS,
} from "@/config/constants";
import { useSubmitReview } from "@/hooks/use-performance";
import type { Employee } from "@/types/employee";
import type { PerformanceReview, ReviewCreateInput } from "@/types/performance";
import { reviewFormSchema, type ReviewFormValues } from "../schemas";

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
}

const DEFAULT_VALUES: ReviewFormValues = {
  employeeId: "",
  reviewerId: "",
  period: "Q4 2026",
  rating: 4,
  kpis: [{ name: "", target: "", actual: "", score: 4 }],
  strengths: "",
  improvements: "",
  managerComments: "",
};

export function ReviewFormDialog({ open, onOpenChange, employees }: ReviewFormDialogProps) {
  const mutation = useSubmitReview();
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "kpis" });
  const activeEmployees = employees.filter((employee) => employee.employmentStatus !== "archived");

  React.useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  async function onSubmit(values: ReviewFormValues) {
    const payload: ReviewCreateInput = {
      employeeId: values.employeeId,
      reviewerId: values.reviewerId,
      period: values.period,
      rating: values.rating as PerformanceReview["rating"],
      kpis: values.kpis.map((kpi, index) => ({
        id: `KPI-NEW-${index + 1}`,
        name: kpi.name,
        target: kpi.target,
        actual: kpi.actual,
        score: kpi.score,
      })),
      strengths: values.strengths,
      improvements: values.improvements,
      managerComments: values.managerComments,
    };

    try {
      await mutation.mutateAsync(payload);
      toast.success("Performance review submitted");
      onOpenChange(false);
      reset(DEFAULT_VALUES);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The review could not be submitted.");
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New performance review"
      description="Record KPI results, an overall rating, and manager feedback."
      className="sm:max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Employee" error={formState.errors.employeeId?.message}>
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION} disabled>Select employee</SelectItem>
                    {activeEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Reviewer" error={formState.errors.reviewerId?.message}>
            <Controller
              control={control}
              name="reviewerId"
              render={({ field }) => (
                <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select reviewer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION} disabled>Select reviewer</SelectItem>
                    {activeEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Period" error={formState.errors.period?.message}>
            <Controller
              control={control}
              name="period"
              render={({ field }) => (
                <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION} disabled>Select period</SelectItem>
                    {REVIEW_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Overall rating" error={formState.errors.rating?.message}>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RATING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Key performance indicators</h3>
              <p className="text-xs text-muted-foreground">Add at least one measurable objective.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", target: "", actual: "", score: 4 })}
            >
              <Plus />
              Add KPI
            </Button>
          </div>

          {formState.errors.kpis?.message ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {formState.errors.kpis.message}
            </p>
          ) : null}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.4fr_1.4fr_0.7fr_auto]">
                <FormField label="KPI" htmlFor={`kpi-name-${field.id}`} error={formState.errors.kpis?.[index]?.name?.message}>
                  <Input id={`kpi-name-${field.id}`} {...register(`kpis.${index}.name`)} placeholder="Delivery reliability" />
                </FormField>
                <FormField label="Target" htmlFor={`kpi-target-${field.id}`} error={formState.errors.kpis?.[index]?.target?.message}>
                  <Input id={`kpi-target-${field.id}`} {...register(`kpis.${index}.target`)} placeholder="95% on-time delivery" />
                </FormField>
                <FormField label="Actual" htmlFor={`kpi-actual-${field.id}`} error={formState.errors.kpis?.[index]?.actual?.message}>
                  <Input id={`kpi-actual-${field.id}`} {...register(`kpis.${index}.actual`)} placeholder="92% on-time delivery" />
                </FormField>
                <FormField label="Score" error={formState.errors.kpis?.[index]?.score?.message}>
                  <Controller
                    control={control}
                    name={`kpis.${index}.score`}
                    render={({ field: scoreField }) => (
                      <Select value={String(scoreField.value)} onValueChange={(value) => scoreField.onChange(Number(value))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {RATING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={`Remove KPI ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Strengths" htmlFor="reviewStrengths" error={formState.errors.strengths?.message}>
            <Textarea id="reviewStrengths" rows={4} {...register("strengths")} placeholder="What did this employee do well?" />
          </FormField>
          <FormField label="Areas for improvement" htmlFor="reviewImprovements" error={formState.errors.improvements?.message}>
            <Textarea id="reviewImprovements" rows={4} {...register("improvements")} placeholder="Where should they focus next?" />
          </FormField>
          <FormField label="Manager comments" htmlFor="reviewComments" error={formState.errors.managerComments?.message}>
            <Textarea id="reviewComments" rows={4} {...register("managerComments")} placeholder="Additional context for the employee" />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting…" : "Submit review"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
