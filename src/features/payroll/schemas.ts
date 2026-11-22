import { z } from "zod";
import type { GeneratePayrollInput } from "@/types/payroll";

export const generatePayrollSchema = z.object({
  periodId: z.string().min(1, "Select a payroll period"),
  employeeIds: z.array(z.string()),
});

export type GeneratePayrollFormValues = z.infer<typeof generatePayrollSchema>;

export function generatePayrollToInput(values: GeneratePayrollFormValues): GeneratePayrollInput {
  return {
    periodId: values.periodId,
    employeeIds: values.employeeIds.length > 0 ? values.employeeIds : undefined,
  };
}
