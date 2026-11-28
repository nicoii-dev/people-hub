import { z } from "zod";
import type { Project, ProjectCreateInput } from "@/types/project";

export const PROJECT_STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PROJECT_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const PROJECT_ASSIGNMENT_ROLE_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "member", label: "Member" },
  { value: "reviewer", label: "Reviewer" },
] as const;

export const projectFormSchema = z
  .object({
    clientId: z.string().min(1, "Select a client"),
    name: z.string().trim().min(1, "Project name is required").max(150),
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50)
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
        "Use letters, numbers, hyphens, or underscores only",
      ),
    description: z.string().trim().max(1000),
    status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.string().trim(),
    billable: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (
      values.startDate &&
      values.endDate &&
      new Date(values.endDate) < new Date(values.startDate)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before the start date",
      });
    }
    if (values.budget && !Number.isFinite(Number(values.budget))) {
      ctx.addIssue({
        code: "custom",
        path: ["budget"],
        message: "Enter a valid budget",
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function projectToFormValues(project?: Project | null): ProjectFormValues {
  if (!project) {
    return {
      clientId: "",
      name: "",
      code: "",
      description: "",
      status: "planning",
      priority: "medium",
      startDate: "",
      endDate: "",
      budget: "",
      billable: true,
    };
  }

  return {
    clientId: project.clientId,
    name: project.name,
    code: project.code,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget === null ? "" : String(project.budget),
    billable: project.billable,
  };
}

function optionalDate(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function projectFormToInput(values: ProjectFormValues): ProjectCreateInput {
  return {
    clientId: values.clientId,
    name: values.name,
    code: values.code.toUpperCase(),
    description: values.description || undefined,
    status: values.status,
    priority: values.priority,
    startDate: optionalDate(values.startDate),
    endDate: optionalDate(values.endDate),
    budget: values.budget ? Number(values.budget) : undefined,
    billable: values.billable,
  };
}
