"use client";

import * as React from "react";
import { Check, Package, Pencil, Plus, Sparkles } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePermission } from "@/features/auth/hooks";
import {
  usePlatformCompanies,
  useSubscriptionPlans,
} from "@/hooks/use-platform";
import { formatCurrency } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/platform";
import { SubscriptionPlanFormDialog } from "./components/subscription-plan-form-dialog";

export function PlatformPlansView() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);
  const canManage = usePermission("platform-plans:manage");
  const plans = useSubscriptionPlans();
  const companies = usePlatformCompanies();

  function openCreate() {
    setSelectedPlan(null);
    setDialogOpen(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setDialogOpen(true);
  }

  if (plans.isError) {
    return (
      <ErrorState
        title="Subscription plans unavailable"
        description="Plans could not be loaded."
        error={plans.error}
        onRetry={() => void plans.refetch()}
      />
    );
  }

  if (plans.isPending) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  const companyList = companies.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription plans"
        description="Set pricing, limits, and plan features for every company on PeopleHub."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus />
              Add plan
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(plans.data?.data ?? []).map((plan) => {
          const subscriberCount = companyList.filter((company) => company.planId === plan.id).length;
          return (
            <Card key={plan.id} className="flex h-full flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Package className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <CardDescription>{plan.status === "active" ? "Available" : "Archived"}</CardDescription>
                    </div>
                  </div>
                  {plan.popular ? (
                    <Badge className="gap-1">
                      <Sparkles className="size-3" /> Popular
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div>
                  <p className="text-2xl font-semibold">{formatCurrency(plan.priceMonthly)}</p>
                  <p className="text-xs text-muted-foreground">
                    per month · {formatCurrency(plan.priceYearly)} per year
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={plan.status} />
                  <Badge variant="secondary">{plan.employeeLimit} employees</Badge>
                  <Badge variant="outline">{subscriberCount} companies</Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {canManage ? (
                  <Button variant="outline" className="mt-auto" onClick={() => openEdit(plan)}>
                    <Pencil />
                    Edit plan
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SubscriptionPlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
      />
    </div>
  );
}
