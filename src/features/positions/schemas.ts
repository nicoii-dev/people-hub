import { z } from "zod";
import { POSITION_LEVELS } from "@/config/constants";
import type { Position, PositionCreateInput } from "@/types/position";

export const positionFormSchema = z
  .object({
    title: z.string().trim().min(1, "Position title is required").max(80),
    code: z
      .string()
      .trim()
      .min(2, "Code must be at least 2 characters")
      .max(10, "Code must be 10 characters or fewer")
      .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, or hyphens only"),
    departmentId: z.string().min(1, "Select a department"),
    level: z.enum(POSITION_LEVELS),
    salaryGrade: z
      .number()
      .int("Salary grade must be a whole number")
      .min(1, "Salary grade must be at least 1")
      .max(100, "Salary grade must be 100 or fewer"),
    salaryMin: z.number().min(0, "Minimum salary cannot be negative"),
    salaryMax: z.number().min(0, "Maximum salary cannot be negative"),
  })
  .refine((values) => values.salaryMax >= values.salaryMin, {
    path: ["salaryMax"],
    message: "Maximum salary must be greater than or equal to minimum salary",
  });

export type PositionFormValues = z.infer<typeof positionFormSchema>;

export function positionToFormValues(position?: Position | null): PositionFormValues {
  if (!position) {
    return {
      title: "",
      code: "",
      departmentId: "",
      level: "Mid",
      salaryGrade: 11,
      salaryMin: 30000,
      salaryMax: 60000,
    };
  }

  return {
    title: position.title,
    code: position.code,
    departmentId: position.departmentId,
    level: position.level,
    salaryGrade: position.salaryGrade,
    salaryMin: position.salaryMin,
    salaryMax: position.salaryMax,
  };
}

export function positionFormToInput(values: PositionFormValues): PositionCreateInput {
  return {
    title: values.title,
    code: values.code.toUpperCase(),
    departmentId: values.departmentId,
    level: values.level,
    salaryGrade: values.salaryGrade,
    salaryMin: values.salaryMin,
    salaryMax: values.salaryMax,
  };
}
