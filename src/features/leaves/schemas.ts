import { z } from "zod";
import { LEAVE_TYPES } from "@/config/constants";
import type { LeaveCreateInput } from "@/types/leave";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function leaveDays(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export const leaveFormSchema = z
  .object({
    employeeId: z.string().min(1, "Select an employee"),
    type: z.enum(LEAVE_TYPES),
    startDate: z.string().regex(DATE_PATTERN, "Select a valid start date"),
    endDate: z.string().regex(DATE_PATTERN, "Select a valid end date"),
    reason: z.string().trim().min(1, "Reason is required").max(300),
  })
  .refine((values) => values.endDate >= values.startDate, {
    path: ["endDate"],
    message: "End date must be on or after the start date",
  });

export type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export function leaveFormToInput(values: LeaveFormValues): LeaveCreateInput {
  return {
    employeeId: values.employeeId,
    type: values.type,
    startDate: values.startDate,
    endDate: values.endDate,
    reason: values.reason,
  };
}
