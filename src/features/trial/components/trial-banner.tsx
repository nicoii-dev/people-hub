"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompanyId } from "@/services/api/auth-store";
import { trialService } from "@/services/trial.service";
import type { TrialState } from "@/types/trial";

/** Tenant-wide trial status that stays visible while admins explore the app. */
export function TrialBanner() {
  const [trial, setTrial] = useState<TrialState | null>(null);

  useEffect(() => {
    let active = true;
    void trialService
      .getState(getCompanyId() ?? undefined)
      .then((state) => {
        if (active) setTrial(state);
      })
      .catch(() => {
        if (active) setTrial(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!trial || trial.status !== "TRIALING") return null;

  const expired = trial.expired || trial.daysRemaining === 0;
  const urgent = !expired && trial.daysRemaining <= 3;

  return (
    <div
      className={`mb-4 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        expired || urgent
          ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          : "border-primary/20 bg-primary/5 text-foreground"
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-sm font-medium">
            {expired
              ? "Your trial has ended"
              : `${trial.daysRemaining} day${trial.daysRemaining === 1 ? "" : "s"} left in your free trial`}
          </p>
          <p className="text-xs opacity-80">
            {expired
              ? "Read-only access is still available. Upgrade to continue adding and editing HR records."
              : `${trial.companyName} is exploring ${trial.features.length} selected HRIS feature${trial.features.length === 1 ? "" : "s"}.`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {!expired ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/onboarding">View setup checklist</Link>
          </Button>
        ) : null}
        <Button asChild size="sm" variant={expired ? "default" : "outline"}>
          <Link href="/billing">
            Upgrade now
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
