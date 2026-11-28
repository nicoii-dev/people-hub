"use client";

import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  ListChecks,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks";
import { useOnboarding } from "@/hooks/use-employee-portal";
import { formatDate } from "@/lib/utils";
import type { OnboardingTaskStatus } from "@/types/employee-portal";

const statusConfig: Record<
  OnboardingTaskStatus,
  { label: string; variant: "success" | "warning" | "secondary"; icon: typeof CheckCircle2 }
> = {
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
  in_progress: { label: "In progress", variant: "warning", icon: Clock3 },
  pending: { label: "Pending", variant: "secondary", icon: CircleDashed },
};

export function EmployeeOnboardingView() {
  const { user } = useAuth();
  const onboarding = useOnboarding(user?.employeeId ?? "");

  if (onboarding.isPending) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  if (onboarding.isError || !onboarding.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Your onboarding checklist could not be loaded.
        </CardContent>
      </Card>
    );
  }

  const summary = onboarding.data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My onboarding"
        description="Track the tasks you have completed and the documents on file."
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardDescription>Onboarding progress</CardDescription>
          <CardTitle className="text-3xl">{summary.progressPercent}%</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${summary.progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {summary.completedCount} of {summary.totalCount} tasks completed. Keep going — only a few
            steps remain.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-5 text-primary" />
              Your checklist
            </CardTitle>
            <CardDescription>Required steps for a smooth start at PeopleHub.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.tasks.map((task) => {
              const status = statusConfig[task.status];
              const StatusIcon = status.icon;
              return (
                <div key={task.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <StatusIcon
                        className={`mt-0.5 size-5 shrink-0 ${
                          task.status === "completed" ? "text-emerald-600" : "text-muted-foreground"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {task.completedAt
                            ? `Completed ${formatDate(task.completedAt.slice(0, 10))}`
                            : `Due ${formatDate(task.dueDate)}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="size-5 text-primary" />
              Uploaded documents
            </CardTitle>
            <CardDescription>Files attached to your employee record.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.documents.length ? (
              <div className="space-y-3">
                {summary.documents.map((document) => (
                  <div key={document.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{document.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {document.type} · {document.sizeKb} KB
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Uploaded {formatDate(document.uploadedAt.slice(0, 10))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <UploadCloud className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No documents yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Uploaded files will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
