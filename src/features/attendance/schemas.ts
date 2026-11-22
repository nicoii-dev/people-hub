import { z } from "zod";
import { ATTENDANCE_STATUSES } from "@/config/constants";
import type { AttendanceAdjustmentInput, AttendanceRecord } from "@/types/attendance";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = z.union([z.literal(""), z.string().regex(TIME_PATTERN, "Use HH:MM")]);

export const attendanceAdjustmentSchema = z
  .object({
    status: z.enum(ATTENDANCE_STATUSES),
    timeIn: timeField,
    timeOut: timeField,
    breakMinutes: z
      .number()
      .int("Break minutes must be a whole number")
      .min(0, "Break minutes cannot be negative")
      .max(480, "Break minutes cannot exceed 480"),
    remarks: z.string().trim().min(1, "Remarks are required").max(300),
  })
  .refine(
    (values) => {
      const noTime = values.status === "absent" || values.status === "on_leave";
      return noTime ? !values.timeIn && !values.timeOut : Boolean(values.timeIn && values.timeOut);
    },
    {
      path: ["timeIn"],
      message: "Time in and time out are required unless the status is absent or on leave",
    },
  )
  .refine(
    (values) => !values.timeIn || !values.timeOut || values.timeOut > values.timeIn,
    { path: ["timeOut"], message: "Time out must be after time in" },
  );

export type AttendanceAdjustmentFormValues = z.infer<typeof attendanceAdjustmentSchema>;

export function attendanceToFormValues(record: AttendanceRecord): AttendanceAdjustmentFormValues {
  return {
    status: record.status,
    timeIn: record.timeIn ?? "",
    timeOut: record.timeOut ?? "",
    breakMinutes: record.breakMinutes,
    remarks: record.remarks,
  };
}

export function attendanceFormToInput(values: AttendanceAdjustmentFormValues): AttendanceAdjustmentInput {
  return {
    status: values.status,
    timeIn: values.timeIn || null,
    timeOut: values.timeOut || null,
    breakMinutes: values.breakMinutes,
    remarks: values.remarks,
  };
}
