import { z } from "zod";
import { NO_SELECTION } from "@/config/constants";
import type { Department, DepartmentCreateInput } from "@/types/department";

export const departmentFormSchema = z.object({
  name: z.string().trim().min(1, "Department name is required").max(80),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be 10 characters or fewer")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, or hyphens only"),
  description: z.string().trim().min(1, "Description is required").max(300),
  managerId: z.string(),
  parentId: z.string(),
  location: z.string().trim().min(1, "Location is required").max(80),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export function departmentToFormValues(department?: Department | null): DepartmentFormValues {
  if (!department) {
    return {
      name: "",
      code: "",
      description: "",
      managerId: NO_SELECTION,
      parentId: NO_SELECTION,
      location: "Pasig City",
    };
  }

  return {
    name: department.name,
    code: department.code,
    description: department.description,
    managerId: department.managerId ?? NO_SELECTION,
    parentId: department.parentId ?? NO_SELECTION,
    location: department.location,
  };
}

export function departmentFormToInput(values: DepartmentFormValues): DepartmentCreateInput {
  return {
    name: values.name,
    code: values.code.toUpperCase(),
    description: values.description,
    managerId: values.managerId === NO_SELECTION ? null : values.managerId,
    parentId: values.parentId === NO_SELECTION ? null : values.parentId,
    location: values.location,
  };
}
