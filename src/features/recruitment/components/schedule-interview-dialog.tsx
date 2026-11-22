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
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { MOCK_TODAY, NO_SELECTION } from "@/config/constants";
import { useScheduleInterview } from "@/hooks/use-recruitment";
import type { Employee } from "@/types/employee";
import type { Application, Candidate, JobOpening } from "@/types/recruitment";
import {
  scheduleInterviewSchema,
  type ScheduleInterviewFormValues,
} from "../schemas";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
  candidates: Candidate[];
  jobs: JobOpening[];
  employees: Employee[];
  defaultApplicationId?: string;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  applications,
  candidates,
  jobs,
  employees,
  defaultApplicationId,
}: ScheduleInterviewDialogProps) {
  const mutation = useScheduleInterview();
  const form = useForm<ScheduleInterviewFormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      applicationId: defaultApplicationId ?? "",
      scheduledAt: `${MOCK_TODAY}T10:00`,
      interviewerId: "",
    },
  });
  const { control, register, handleSubmit, reset, formState } = form;
  const applicationId = useWatch({ control, name: "applicationId" });
  const application = applications.find((item) => item.id === applicationId);
  const candidate = candidates.find((item) => item.id === application?.candidateId);
  const job = jobs.find((item) => item.id === application?.jobId);
  const interviewers = employees.filter((employee) => employee.employmentStatus !== "archived");

  React.useEffect(() => {
    reset({
      applicationId: defaultApplicationId ?? "",
      scheduledAt: `${MOCK_TODAY}T10:00`,
      interviewerId: "",
    });
  }, [defaultApplicationId, open, reset]);

  async function onSubmit(values: ScheduleInterviewFormValues) {
    try {
      await mutation.mutateAsync(values);
      toast.success("Interview scheduled");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The interview could not be scheduled.");
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule interview"
      description="Assign an interviewer and date for this application."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Application" error={formState.errors.applicationId?.message}>
          <Controller
            control={control}
            name="applicationId"
            render={({ field }) => (
              <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select application" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION} disabled>Select application</SelectItem>
                  {applications.map((item) => {
                    const itemCandidate = candidates.find((entry) => entry.id === item.candidateId);
                    const itemJob = jobs.find((entry) => entry.id === item.jobId);
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {itemCandidate ? `${itemCandidate.firstName} ${itemCandidate.lastName}` : item.id} · {itemJob?.title ?? item.jobId}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Date and time" htmlFor="interviewSchedule" error={formState.errors.scheduledAt?.message}>
          <Input id="interviewSchedule" type="datetime-local" {...register("scheduledAt")} />
        </FormField>

        <FormField label="Interviewer" error={formState.errors.interviewerId?.message}>
          <Controller
            control={control}
            name="interviewerId"
            render={({ field }) => (
              <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select interviewer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION} disabled>Select interviewer</SelectItem>
                  {interviewers.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} · {employee.positionId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {candidate && job ? (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
            <p className="text-muted-foreground">{job.title}</p>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || applications.length === 0}>
            {mutation.isPending ? "Scheduling…" : "Schedule interview"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
