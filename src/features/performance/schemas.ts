import { z } from "zod";

const kpiScoreSchema = z.object({
  name: z.string().trim().min(1, "Enter a KPI name"),
  target: z.string().trim().min(1, "Enter a target"),
  actual: z.string().trim().min(1, "Enter the actual result"),
  score: z.number().int().min(1, "Minimum score is 1").max(5, "Maximum score is 5"),
});

export const reviewFormSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  reviewerId: z.string().min(1, "Select a reviewer"),
  period: z.string().trim().min(1, "Enter a review period"),
  rating: z.number().int().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  kpis: z.array(kpiScoreSchema).min(1, "Add at least one KPI"),
  strengths: z.string().trim().min(10, "Add at least 10 characters"),
  improvements: z.string().trim().min(10, "Add at least 10 characters"),
  managerComments: z.string().trim().min(10, "Add at least 10 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
