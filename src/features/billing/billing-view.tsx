"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CreditCard,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { env } from "@/config/env";
import { MOCK_WORKSPACE_COMPANY_ID } from "@/data/platform";
import { useStartCheckout } from "@/hooks/use-billing";
import {
  usePlatformCompanies,
  usePlatformPayments,
  useSubscriptionPlans,
} from "@/hooks/use-platform";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getCompanyId } from "@/services/api/auth-store";
import {
  isBillingCycle,
  isBillingPlanKey,
  planKeyFromName,
  type BillingCycle,
} from "@/types/billing";
import type { SubscriptionPlan } from "@/types/platform";

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The checkout could not be started.";
}

export function BillingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plansQuery = useSubscriptionPlans();
  const companiesQuery = usePlatformCompanies();
  const paymentsQuery = usePlatformPayments();
  const checkout = useStartCheckout();

  const planParam = searchParams.get("plan");
  const cycleParam = searchParams.get("cycle");
  const checkoutStatus = searchParams.get("checkout");
  const planFromUrl = isBillingPlanKey(planParam) ? planParam : null;
  const cycleFromUrl = isBillingCycle(cycleParam) ? cycleParam : null;

  const [cycleOverride, setCycleOverride] = React.useState<BillingCycle | null>(null);
  const [manualPlan, setManualPlan] = React.useState<SubscriptionPlan | null>(null);
  const [dismissedPlanParam, setDismissedPlanParam] = React.useState<string | null>(null);
  const [demoPlanName, setDemoPlanName] = React.useState<string | null>(null);
  const cycle = cycleOverride ?? cycleFromUrl ?? "monthly";

  const plans = React.useMemo(
    () =>
      (plansQuery.data?.data ?? [])
        .filter((plan) => plan.status === "active")
        .sort((a, b) => a.priceMonthly - b.priceMonthly),
    [plansQuery.data?.data],
  );

  // A plan CTA on the landing page lands here with ?plan=&cycle=; derive the
  // same confirmation dialog as if the admin had clicked the plan card.
  const urlPlan =
    planFromUrl && dismissedPlanParam !== planFromUrl
      ? plans.find((item) => planKeyFromName(item.name) === planFromUrl) ?? null
      : null;
  const selectedPlan = manualPlan ?? urlPlan;

  function closeDialog() {
    setManualPlan(null);
    if (planFromUrl) setDismissedPlanParam(planFromUrl);
  }

  const companies = companiesQuery.data?.data ?? [];
  const requestedCompanyId = getCompanyId() ?? env.companyId;
  // Platform company records are still local mock data. In API mode the active
  // tenant comes from the auth session; never substitute a mock tenant id.
  const currentCompany = env.useMockData
    ? (companies.find((item) => item.id === requestedCompanyId) ??
      companies.find((item) => item.id === MOCK_WORKSPACE_COMPANY_ID) ??
      companies[0])
    : (companies.find((item) => item.id === requestedCompanyId) ?? null);

  const payments = React.useMemo(
    () =>
      (paymentsQuery.data?.data ?? [])
        .filter((payment) => payment.companyId === currentCompany?.id)
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
        .slice(0, 5),
    [paymentsQuery.data?.data, currentCompany?.id],
  );

  function confirmCheckout() {
    if (!selectedPlan) return;
    const companyId = env.useMockData ? currentCompany?.id : requestedCompanyId;
    if (!companyId) {
      toast.error("No company is selected. Sign in or set NEXT_PUBLIC_COMPANY_ID.");
      return;
    }
    const planKey = planKeyFromName(selectedPlan.name);
    if (!planKey) {
      toast.error("This plan cannot be subscribed to from the workspace.");
      return;
    }

    checkout.mutate(
      {
        plan: planKey,
        cycle,
        companyId,
      },
      {
        onSuccess(result) {
          if (result.data.mode === "redirect") {
            toast.info("Redirecting to secure Stripe checkout…");
            window.location.assign(result.data.url);
            return;
          }

          setDemoPlanName(result.data.planName);
          closeDialog();
          toast.success(result.message);
          if (planFromUrl) {
            router.replace("/billing", { scroll: false });
          }
        },
        onError(error) {
          toast.error(mutationMessage(error));
        },
      },
    );
  }

  if (plansQuery.isError) {
    return (
      <ErrorState
        title="Subscription plans unavailable"
        description="Plans could not be loaded."
        error={plansQuery.error}
        onRetry={() => void plansQuery.refetch()}
      />
    );
  }

  if (plansQuery.isPending) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  const maxSavings = Math.max(
    0,
    ...plans.map((plan) =>
      plan.priceMonthly > 0
        ? Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)
        : 0,
    ),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & subscription"
        description={`Manage the subscription for ${currentCompany?.name ?? (env.useMockData ? "your workspace" : "your active company")}.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Back to dashboard
              <ArrowRight />
            </Link>
          </Button>
        }
      />

      {checkoutStatus === "success" ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium">Payment received</p>
            <p className="text-muted-foreground">
              Stripe is confirming your subscription. Your plan will update in this workspace as soon as the webhook arrives.
            </p>
          </div>
        </div>
      ) : null}

      {checkoutStatus === "cancel" ? (
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
          <Receipt className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">Checkout cancelled</p>
            <p className="text-muted-foreground">No charge was made. You can try again below.</p>
          </div>
        </div>
      ) : null}

      {demoPlanName ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium">{demoPlanName} is now active</p>
            <p className="text-muted-foreground">
              Demo checkout recorded a payment and updated this workspace. No real charge was made.
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base">Current subscription</CardTitle>
                <CardDescription>
                  {currentCompany
                    ? `${currentCompany.name} · ${currentCompany.employeeCount} employees`
                    : env.useMockData
                      ? "Select a company to manage billing"
                      : "Subscription data is synced from Stripe"}
                </CardDescription>
              </div>
            </div>
            {currentCompany ? (
              <Badge variant="secondary" className="capitalize">
                {currentCompany.status}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="font-medium">
              {plans.find((plan) => plan.id === currentCompany?.planId)?.name ??
                (currentCompany ? "Starter" : "Managed by Stripe")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly price</p>
            <p className="font-medium">
              {currentCompany
                ? formatCurrency(
                    plans.find((plan) => plan.id === currentCompany?.planId)?.priceMonthly ?? 0,
                  )
                : "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            {env.useMockData ? "Demo billing — no real charges" : "Secure checkout powered by Stripe"}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Choose a plan</h2>
            <p className="text-sm text-muted-foreground">
              Upgrade or change your subscription at any time.
            </p>
          </div>
          <div className="inline-flex rounded-lg border bg-card p-1" role="group" aria-label="Billing cycle">
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={cycle === option}
                onClick={() => setCycleOverride(option)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  cycle === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "monthly" ? "Monthly" : "Yearly"}
                {option === "yearly" && maxSavings > 0 ? (
                  <span className="ml-2 text-xs opacity-80">Save up to {maxSavings}%</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentCompany?.planId;
            const amount = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "flex h-full flex-col",
                  plan.popular && "border-primary shadow-lg shadow-primary/10",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.popular ? (
                      <Badge className="gap-1">
                        <Sparkles className="size-3" /> Popular
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div>
                    <p className="text-2xl font-semibold">{formatCurrency(amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {cycle === "monthly" ? "per month" : "per year"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Up to {plan.employeeLimit.toLocaleString("en-PH")} employees
                  </p>
                  <ul className="flex-1 space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrent || (env.useMockData && !currentCompany)}
                    onClick={() => setManualPlan(plan)}
                    className="mt-auto w-full"
                  >
                    {isCurrent ? "Current plan" : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent payments</CardTitle>
          <CardDescription>
            Latest invoices for {currentCompany?.name ?? (env.useMockData ? "this workspace" : "the active company")}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {payments.map((payment) => (
                <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <span className="font-medium">{payment.invoiceNumber}</span>
                  <span className="text-muted-foreground">{formatDate(payment.issuedAt)}</span>
                  <StatusBadge status={payment.status} className="ml-auto" />
                  <span className="w-28 text-right font-medium">
                    {formatCurrency(payment.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedPlan !== null}
        onOpenChange={(open) => {
          if (!open && !checkout.isPending) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {selectedPlan?.name ?? "subscription"}</DialogTitle>
            <DialogDescription>
              {env.useMockData
                ? "Demo checkout simulates a payment and activates the plan locally."
                : "You will be redirected to Stripe to complete the payment securely."}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Workspace</span>
                <span className="font-medium text-right">
                  {currentCompany?.name ?? "Active company"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Billing cycle</span>
                <span className="font-medium capitalize">{cycle}</span>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3 text-base">
                <span className="font-medium">Total today</span>
                <span className="font-semibold">
                  {formatCurrency(
                    cycle === "monthly"
                      ? selectedPlan.priceMonthly
                      : selectedPlan.priceYearly,
                  )}
                </span>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={checkout.isPending}
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button onClick={confirmCheckout} disabled={checkout.isPending || !selectedPlan}>
              {checkout.isPending
                ? "Starting checkout…"
                : env.useMockData
                  ? "Confirm demo payment"
                  : "Continue to Stripe"}
              {!checkout.isPending ? <ArrowRight /> : null}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
