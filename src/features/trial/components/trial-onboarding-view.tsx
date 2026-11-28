"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Rocket,
  SquareKanban,
  Timer,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/empty-state";
import { getCompanyId } from "@/services/api/auth-store";
import { TRIAL_DAYS, trialService } from "@/services/trial.service";
import type {
  TrialChecklistKey,
  TrialFeature,
  TrialState,
} from "@/types/trial";

const featureLabels: Record<TrialFeature, string> = {
  employees: "Employee directory",
  projects: "Projects & clients",
  assignments: "Team assignments",
  "time-entries": "Timesheets & time entries",
};

interface ChecklistStep {
  key: TrialChecklistKey;
  title: string;
  description: string;
  href: string;
  action: string;
  feature: TrialFeature;
  icon: typeof UserPlus;
}

const checklistSteps: ChecklistStep[] = [
  {
    key: "add-employee",
    title: "Add your first employee",
    description: "Build a directory of the people who work with you.",
    href: "/employees",
    action: "Open employees",
    feature: "employees",
    icon: UserPlus,
  },
  {
    key: "create-project",
    title: "Create a project",
    description: "Set up a client project and give your team something to work toward.",
    href: "/projects",
    action: "Open projects",
    feature: "projects",
    icon: SquareKanban,
  },
  {
    key: "assign-employee",
    title: "Assign an employee",
    description: "Add people to a project so ownership is clear.",
    href: "/projects",
    action: "Assign on projects",
    feature: "assignments",
    icon: UsersRound,
  },
  {
    key: "submit-time-entry",
    title: "Submit a time entry",
    description: "Log hours against a project and see them appear in reports.",
    href: "/time-entries",
    action: "Open time entries",
    feature: "time-entries",
    icon: Timer,
  },
];

export function TrialOnboardingView() {
  const [trial, setTrial] = useState<TrialState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void trialService
      .getState(getCompanyId() ?? undefined)
      .then((state) => {
        if (active) setTrial(state);
      })
      .catch(() => {
        if (active) setTrial(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your trial...</p>;
  }

  if (!trial) {
    return (
      <EmptyState
        icon={<Rocket className="size-5" />}
        title="No active workspace trial"
        description="Register your company to get a 14-day trial with a guided setup checklist."
        action={
          <Button asChild>
            <Link href="/register">
              Start a free trial
              <ArrowRight />
            </Link>
          </Button>
        }
      />
    );
  }

  const isTrialing = trial.status === "TRIALING";
  const expired = trial.expired || (isTrialing && trial.daysRemaining === 0);
  const includedSteps = checklistSteps.filter((step) =>
    trial.features.includes(step.feature),
  );
  const completedSteps = includedSteps.filter(
    (step) => trial.checklist[step.key],
  ).length;
  const progress = includedSteps.length
    ? Math.round((completedSteps / includedSteps.length) * 100)
    : 0;

  function complete(key: TrialChecklistKey) {
    const checklist = trialService.markComplete(key);
    setTrial((current) => (current ? { ...current, checklist } : current));
  }

  const daysLabel = !isTrialing
    ? "Complete"
    : expired
      ? "Ended"
      : `${trial.daysRemaining} day${trial.daysRemaining === 1 ? "" : "s"}`;

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-primary" style={{ width: `${Math.max(progress, 2)}%` }} />
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={expired ? "destructive" : "secondary"}>
                {expired ? "Trial ended" : isTrialing ? "Free trial" : "Subscription active"}
              </Badge>
              <span className="text-sm text-muted-foreground">{trial.companyName}</span>
            </div>
            <CardTitle className="mt-4 text-2xl">Explore your HRIS, step by step</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">
              Your {TRIAL_DAYS}-day trial unlocks the features you selected at signup. Try the checklist below, then choose a plan before the window closes.
            </CardDescription>
          </div>
          <div className="rounded-xl border bg-muted/40 px-5 py-4 text-center sm:min-w-36">
            <Clock3 className="mx-auto size-5 text-primary" />
            <p className="mt-2 text-3xl font-semibold tracking-tight">{daysLabel}</p>
            <p className="text-xs text-muted-foreground">
              {trial.endsAt && isTrialing
                ? `Ends ${format(parseISO(trial.endsAt), "MMM d, yyyy")}`
                : "Setup progress"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Checklist progress</p>
            <p className="mt-1 text-2xl font-semibold">
              {completedSteps}/{includedSteps.length}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="rounded-lg border p-4 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Selected features</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {trial.features.length ? (
                trial.features.map((feature) => (
                  <Badge key={feature} variant="outline">
                    <Check className="mr-1 size-3" />
                    {featureLabels[feature] ?? feature}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No trial features selected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {expired || !isTrialing ? (
        <Card className="border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader className="gap-2 sm:flex-row sm:items-center">
            <CircleAlert className="size-5 text-amber-600" />
            <div>
              <CardTitle className="text-base">
                {isTrialing ? "Your trial has ended" : "Your trial is complete"}
              </CardTitle>
              <CardDescription>
                {isTrialing
                  ? "You can still review your workspace, but new HR records are locked until you upgrade."
                  : "Choose a subscription to keep all workspace features available."}
              </CardDescription>
            </div>
            <Button asChild className="sm:ml-auto">
              <Link href="/billing">
                Choose a plan
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Trial checklist</h2>
          <p className="text-sm text-muted-foreground">
            Click a step to mark it complete. Your progress is saved automatically.
          </p>
        </div>

        {includedSteps.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {includedSteps.map((step, index) => {
              const Icon = step.icon;
              const done = Boolean(trial.checklist[step.key]);
              return (
                <Card key={step.key} className={done ? "border-primary/40" : ""}>
                  <CardContent className="flex gap-4 p-5">
                    <Checkbox
                      checked={done}
                      onCheckedChange={(checked) => {
                        if (checked === true) complete(step.key);
                      }}
                      aria-label={`Mark ${step.title} complete`}
                      className="mt-1"
                    />
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Step {index + 1}</p>
                      <h3 className="mt-0.5 font-medium">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant={done ? "outline" : "default"}
                          onClick={() => complete(step.key)}
                        >
                          <Link href={step.href}>
                            {step.action}
                            <ArrowRight />
                          </Link>
                        </Button>
                        {done ? (
                          <Badge variant="secondary">
                            <ClipboardCheck className="mr-1 size-3" />
                            Done
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardCheck className="size-5" />}
            title="No checklist items in your trial"
            description="Your selected trial features did not include the guided setup steps. Choose a subscription to unlock the full workspace."
            action={
              <Button asChild>
                <Link href="/billing">View plans</Link>
              </Button>
            }
          />
        )}
      </div>

      {isTrialing ? (
        <p className="text-xs text-muted-foreground">
          Days remaining are based on a {TRIAL_DAYS}-day window from {trial.startedAt ? format(parseISO(trial.startedAt), "MMM d, yyyy") : "signup"}.
        </p>
      ) : null}
    </div>
  );
}
