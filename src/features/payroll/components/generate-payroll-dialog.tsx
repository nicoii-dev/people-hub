"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { NO_SELECTION } from "@/config/constants";
import { useGeneratePayroll } from "@/hooks/use-payroll";
import type { Employee } from "@/types/employee";
import type { PayrollPeriod } from "@/types/payroll";
import {
  generatePayrollSchema,
  generatePayrollToInput,
  type GeneratePayrollFormValues,
} from "../schemas";

interface GeneratePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periods: PayrollPeriod[];
  employees: Employee[];
  defaultPeriodId?: string;
}

export function GeneratePayrollDialog({
  open,
  onOpenChange,
  periods,
  employees,
  defaultPeriodId,
}: GeneratePayrollDialogProps) {
  const mutation = useGeneratePayroll();
  const form = useForm<GeneratePayrollFormValues>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: { periodId: defaultPeriodId ?? "", employeeIds: [] },
  });
  const { control, handleSubmit, reset, formState } = form;
  const employeeIds = useWatch({ control, name: "employeeIds" }) ?? [];
  const availableEmployees = employees.filter((employee) => employee.employmentStatus !== "archived");

  React.useEffect(() => {
    reset({ periodId: defaultPeriodId ?? "", employeeIds: [] });
  }, [defaultPeriodId, open, reset]);

  async function onSubmit(values: GeneratePayrollFormValues) {
    try {
      await mutation.mutateAsync(generatePayrollToInput(values));
      toast.success("Payroll preview generated");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payroll could not be generated.");
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate payroll preview"
      description="Recalculate payroll records for the selected period. Existing records for that period will be replaced."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Payroll period" error={formState.errors.periodId?.message}>
          <Controller
            control={control}
            name="periodId"
            render={({ field }) => (
              <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION} disabled>Select period</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>{period.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <div className="space-y-2">
          <p className="text-sm font-medium">Employees</p>
          <p className="text-xs text-muted-foreground">
            {employeeIds.length === 0
              ? `All ${availableEmployees.length} active employees will be included.`
              : `${employeeIds.length} employee(s) selected.`}
          </p>
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-3">
            <Controller
              control={control}
              name="employeeIds"
              render={({ field }) => (
                <>
                  {availableEmployees.map((employee) => {
                  const checked = field.value.includes(employee.id);
                  return (
                    <label key={employee.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          field.onChange(
                            value === true
                              ? [...field.value, employee.id]
                              : field.value.filter((id) => id !== employee.id),
                          )
                        }
                      />
                      {employee.firstName} {employee.lastName}
                    </label>
                  );
                  })}
                </>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || periods.length === 0}>
            {mutation.isPending ? "Generating…" : "Generate preview"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
