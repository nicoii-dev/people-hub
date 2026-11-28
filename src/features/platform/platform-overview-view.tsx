"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CreditCard,
  Package,
  Settings,
  UsersRound,
} from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlatformCompanies,
  useRevenueSummary,
  useSubscriptionPlans,
  usePlatformUsage,
} from "@/hooks/use-platform";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const quickActions = [
  {
    label: "Manage companies",
    description: "Review tenants and account status.",
    href: "/platform/companies",
    icon: Building2,
  },
  {
    label: "Plans",
    description: "Configure subscription tiers.",
    href: "/platform/plans",
    icon: Package,
  },
  {
    label: "Payments",
    description: "Monitor invoices and revenue.",
    href: "/platform/payments",
    icon: CreditCard,
  },
  {
    label: "Usage",
    description: "Track platform adoption.",
    href: "/platform/usage",
    icon: Activity,
  },
  {
    label: "Settings",
    description: "Control platform-wide options.",
    href: "/platform/settings",
    icon: Settings,
  },
];

export function PlatformOverviewView() {
  const companies = usePlatformCompanies();
  const revenue = useRevenueSummary();
  const usage = usePlatformUsage();
  const plans = useSubscriptionPlans();

  const isError = companies.isError || revenue.isError || usage.isError || plans.isError;
  const isPending = companies.isPending || revenue.isPending || usage.isPending || plans.isPending;

  if (isError) {
    return (
      <ErrorState
        title="Platform overview unavailable"
        description="Platform metrics could not be loaded."
        error={companies.error ?? revenue.error ?? usage.error ?? plans.error}
        onRetry={() => {
          void companies.refetch();
          void revenue.refetch();
          void usage.refetch();
          void plans.refetch();
        }}
      />
    );
  }

  if (isPending) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  const companyList = companies.data?.data ?? [];
  const revenueData = revenue.data?.data;
  const usageData = usage.data?.data;
  const planMap = new Map((plans.data?.data ?? []).map((plan) => [plan.id, plan.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="A control-plane view of every company, subscription, and system metric on PeopleHub."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Registered companies"
          value={companyList.length}
          icon={Building2}
          description={`${usageData?.totals.activeCompanies ?? 0} active · ${usageData?.totals.trialCompanies ?? 0} on trial`}
        />
        <StatCard
          title="Monthly recurring revenue"
          value={formatCurrency(revenueData?.monthlyRecurringRevenue ?? 0)}
          icon={CreditCard}
          description={`${formatCurrency(revenueData?.collectedThisMonth ?? 0)} collected this month`}
        />
        <StatCard
          title="Monthly active users"
          value={(usageData?.totals.activeUsers ?? 0).toLocaleString()}
          icon={UsersRound}
          description="Across all active tenants"
        />
        <StatCard
          title="Platform uptime"
          value={`${usageData?.totals.uptimePercent ?? 0}%`}
          icon={Activity}
          description="Rolling 30-day availability"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Platform controls</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
                <CardContent className="space-y-3 p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Open <ArrowRight className="size-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recently registered companies</CardTitle>
            <CardDescription>The newest tenants on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyList.slice(0, 5).map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.ownerEmail}</p>
                    </TableCell>
                    <TableCell>{planMap.get(company.planId) ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={company.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(company.lastActiveAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by plan</CardTitle>
            <CardDescription>Monthly recurring revenue from active tenants.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(revenueData?.revenueByPlan ?? []).map((item) => (
              <div key={item.planId} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.planName}</p>
                  <Badge variant="secondary">{item.companies} companies</Badge>
                </div>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(item.revenue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
