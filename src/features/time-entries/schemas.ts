import { z } from "zod";
import type { TimeEntry, TimeEntryCreateInput } from "@/types/time-entry";

export const timeEntryFormSchema = z
  .object({
    projectId: z.string().min(1, "Select a project"),
    employeeId: z.string().min(1, "Select an employee"),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid work date"),
    startTime: z.string(),
    endTime: z.string(),
    durationMinutes: z.string().trim(),
    billable: z.boolean(),
    description: z.string().trim().max(1000, "Keep the description under 1000 characters"),
  })
  .superRefine((values, ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    if (values.workDate > today) {
      ctx.addIssue({
        code: "custom",
        path: ["workDate"],
        message: "Work date cannot be in the future",
      });
    }

    const minutes = Number(values.durationMinutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      ctx.addIssue({
        code: "custom",
        path: ["durationMinutes"],
        message: "Enter a whole number of minutes between 1 and 1440",
      });
    }

    if (Boolean(values.startTime) !== Boolean(values.endTime)) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Provide both start and end times, or leave both empty",
      });
      return;
    }
    if (!values.startTime || !values.endTime) return;

    const start = new Date(`${values.workDate}T${values.startTime}:00.000Z`).getTime();
    const end = new Date(`${values.workDate}T${values.endTime}:00.000Z`).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
      return;
    }
    if (minutes > Math.floor((end - start) / 60_000)) {
      ctx.addIssue({
        code: "custom",
        path: ["durationMinutes"],
        message: "Duration cannot exceed the time between start and end",
      });
    }
  });

export type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

interface TimeEntryFormDefaults {
  projectId?: string;
  employeeId?: string;
  workDate?: string;
}

export function timeEntryToFormValues(
  entry?: TimeEntry | null,
  defaults: TimeEntryFormDefaults = {},
): TimeEntryFormValues {
  if (!entry) {
    return {
      projectId: defaults.projectId ?? "",
      employeeId: defaults.employeeId ?? "",
      workDate: defaults.workDate ?? new Date().toISOString().slice(0, 10),
      startTime: "",
      endTime: "",
      durationMinutes: "",
      billable: true,
      description: "",
    };
  }

  return {
    projectId: entry.projectId,
    employeeId: entry.employeeId,
    workDate: entry.workDate,
    startTime: entry.startTime?.slice(11, 16) ?? "",
    endTime: entry.endTime?.slice(11, 16) ?? "",
    durationMinutes: String(entry.durationMinutes),
    billable: entry.billable,
    description: entry.description ?? "",
  };
}

function clockToIso(day: string, clock: string): string | null {
  return clock ? `${day}T${clock}:00.000Z` : null;
}

export function timeEntryFormToInput(values: TimeEntryFormValues): TimeEntryCreateInput {
  return {
    projectId: values.projectId,
    employeeId: values.employeeId,
    workDate: values.workDate,
    startTime: clockToIso(values.workDate, values.startTime),
    endTime: clockToIso(values.workDate, values.endTime),
    durationMinutes: Number(values.durationMinutes),
    billable: values.billable,
    description: values.description || null,
  };
}
