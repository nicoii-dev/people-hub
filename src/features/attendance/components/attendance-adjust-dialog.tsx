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
import { ATTENDANCE_STATUS_OPTIONS } from "@/config/constants";
import { useAdjustAttendance } from "@/hooks/use-attendance";
import { formatDate } from "@/lib/utils";
import type { AttendanceRecord } from "@/types/attendance";
import type { Employee } from "@/types/employee";
import {
  attendanceAdjustmentSchema,
  attendanceFormToInput,
  attendanceToFormValues,
  type AttendanceAdjustmentFormValues,
} from "../schemas";

interface AttendanceAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
  employees: Employee[];
}

export function AttendanceAdjustDialog({
  open,
  onOpenChange,
  record,
  employees,
}: AttendanceAdjustDialogProps) {
  const mutation = useAdjustAttendance();
  const form = useForm<AttendanceAdjustmentFormValues>({
    resolver: zodResolver(attendanceAdjustmentSchema),
    defaultValues: record
      ? attendanceToFormValues(record)
      : { status: "present", timeIn: "", timeOut: "", breakMinutes: 60, remarks: "" },
  });
  const { control, register, handleSubmit, reset, setValue, formState } = form;
  const status = useWatch({ control, name: "status" });
  const noTime = status === "absent" || status === "on_leave";
  const employee = employees.find((item) => item.id === record?.employeeId);

  React.useEffect(() => {
    if (record) reset(attendanceToFormValues(record));
  }, [record, open, reset]);

  async function onSubmit(values: AttendanceAdjustmentFormValues) {
    if (!record) return;
    try {
      await mutation.mutateAsync({ id: record.id, input: attendanceFormToInput(values) });
      toast.success("Attendance record adjusted");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The record could not be adjusted.");
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adjust attendance"
      description={
        record
          ? `${employee ? `${employee.firstName} ${employee.lastName} · ` : ""}${formatDate(record.date)}`
          : undefined
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Status" error={formState.errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === "absent" || value === "on_leave") {
                    setValue("timeIn", "");
                    setValue("timeOut", "");
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Time in" htmlFor="adjustTimeIn" error={formState.errors.timeIn?.message}>
            <Input id="adjustTimeIn" type="time" disabled={noTime} {...register("timeIn")} />
          </FormField>
          <FormField label="Time out" htmlFor="adjustTimeOut" error={formState.errors.timeOut?.message}>
            <Input id="adjustTimeOut" type="time" disabled={noTime} {...register("timeOut")} />
          </FormField>
        </div>

        <FormField label="Break minutes" htmlFor="adjustBreak" error={formState.errors.breakMinutes?.message}>
          <Input
            id="adjustBreak"
            type="number"
            min={0}
            max={480}
            disabled={noTime}
            {...register("breakMinutes", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Remarks" htmlFor="adjustRemarks" error={formState.errors.remarks?.message}>
          <Textarea id="adjustRemarks" {...register("remarks")} />
        </FormField>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save adjustment"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
