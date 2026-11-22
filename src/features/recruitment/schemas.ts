import { z } from "zod";

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, "Select an application"),
  scheduledAt: z.string().min(1, "Select a date and time"),
  interviewerId: z.string().min(1, "Select an interviewer"),
});

export type ScheduleInterviewFormValues = z.infer<typeof scheduleInterviewSchema>;
