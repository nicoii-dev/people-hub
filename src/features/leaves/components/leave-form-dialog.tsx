"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { LEAVE_TYPE_OPTIONS, MOCK_TODAY, NO_SELECTION } from "@/config/constants";
import { useCreateLeave } from "@/hooks/use-leaves";
import type { Employee } from "@/types/employee";
import type { LeaveBalance } from "@/types/leave";
import {
  leaveDays,
  leaveFormToInput,
  leaveFormSchema,
  type LeaveFormValues,
} from "../schemas";

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  balances: LeaveBalance[];
  defaultEmployeeId?: string;
}

export function LeaveFormDialog({
  open,
  onOpenChange,
  employees,
  balances,
  defaultEmployeeId,
}: LeaveFormDialogProps) {
  const mutation = useCreateLeave();
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      employeeId: defaultEmployeeId ?? "",
      type: "Vacation Leave",
      startDate: MOCK_TODAY,
      endDate: MOCK_TODAY,
      reason: "",
    },
  });
  const { control, register, handleSubmit, reset, setError, formState } = form;
  const employeeId = useWatch({ control, name: "employeeId" });
  const type = useWatch({ control, name: "type" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const days = leaveDays(startDate, endDate);
  const balance = balances.find((item) => item.employeeId === employeeId && item.type === type);
  const availableEmployees = employees.filter((employee) => employee.employmentStatus !== "archived");

  React.useEffect(() => {
    reset({
      employeeId: defaultEmployeeId ?? "",
      type: "Vacation Leave",
      startDate: MOCK_TODAY,
      endDate: MOCK_TODAY,
      reason: "",
    });
  }, [defaultEmployeeId, open, reset]);

  async function onSubmit(values: LeaveFormValues) {
    const requestedDays = leaveDays(values.startDate, values.endDate);
    const matchingBalance = balances.find(
      (item) => item.employeeId === values.employeeId && item.type === values.type,
    );

    if (values.type !== "Unpaid Leave" && matchingBalance && requestedDays > matchingBalance.remaining) {
      setError("endDate", {
        message: `Only ${matchingBalance.remaining} day(s) remaining for ${values.type}`,
      });
      return;
    }

    try {
      await mutation.mutateAsync(leaveFormToInput(values));
      toast.success("Leave request submitted");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The leave request could not be submitted.");
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request leave"
      description="Submit a leave request for an employee."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Employee" error={formState.errors.employeeId?.message}>
          <Controller
            control={control}
            name="employeeId"
            render={({ field }) => (
              <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION} disabled>Select employee</SelectItem>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} · {employee.employeeNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Leave type" error={formState.errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Start date" htmlFor="leaveStartDate" error={formState.errors.startDate?.message}>
            <Input id="leaveStartDate" type="date" {...register("startDate")} />
          </FormField>
          <FormField label="End date" htmlFor="leaveEndDate" error={formState.errors.endDate?.message}>
            <Input id="leaveEndDate" type="date" {...register("endDate")} />
          </FormField>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requested days</span>
            <span className="font-medium">{days}</span>
          </div>
          {balance ? (
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Remaining balance</span>
              <span className="font-medium">{balance.remaining}</span>
            </div>
          ) : null}
        </div>

        <FormField label="Reason" htmlFor="leaveReason" error={formState.errors.reason?.message}>
          <Textarea id="leaveReason" {...register("reason")} />
        </FormField>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
