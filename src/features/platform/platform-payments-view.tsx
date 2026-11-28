"use client";

import * as React from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  SearchX,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  usePlatformPayments,
  useRevenueSummary,
  useSubscriptionPlans,
} from "@/hooks/use-platform";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export function PlatformPaymentsView() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const payments = usePlatformPayments();
  const revenue = useRevenueSummary();
  const companies = usePlatformCompanies();
  const plans = useSubscriptionPlans();

  const isError =
    payments.isError || revenue.isError || companies.isError || plans.isError;
  const isPending =
    payments.isPending || revenue.isPending || companies.isPending || plans.isPending;

  const companyMap = React.useMemo(
    () => new Map((companies.data?.data ?? []).map((company) => [company.id, company.name])),
    [companies.data],
  );
  const planMap = React.useMemo(
    () => new Map((plans.data?.data ?? []).map((plan) => [plan.id, plan.name])),
    [plans.data],
  );

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (payments.data?.data ?? []).filter((payment) => {
      if (statusFilter && payment.status !== statusFilter) return false;
      if (!term) return true;
      return [
        payment.invoiceNumber,
        companyMap.get(payment.companyId) ?? "",
        planMap.get(payment.planId) ?? "",
        payment.method,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [companyMap, payments.data, planMap, search, statusFilter]);

  if (isError) {
    return (
      <ErrorState
        title="Payment data unavailable"
        description="Payments and revenue could not be loaded."
        error={payments.error ?? revenue.error ?? companies.error ?? plans.error}
        onRetry={() => {
          void payments.refetch();
          void revenue.refetch();
          void companies.refetch();
          void plans.refetch();
        }}
      />
    );
  }

  if (isPending) {
    return <LoadingSkeleton variant="table" count={8} />;
  }

  const summary = revenue.data?.data;
  const chartData = (summary?.revenueByPlan ?? []).map((item) => ({
    plan: item.planName,
    revenue: item.revenue,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & revenue"
        description="Monitor invoices, collection status, and recurring revenue across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Monthly recurring revenue"
          value={formatCurrency(summary?.monthlyRecurringRevenue ?? 0)}
          icon={WalletCards}
          description="From active company subscriptions"
        />
        <StatCard
          title="Collected this month"
          value={formatCurrency(summary?.collectedThisMonth ?? 0)}
          icon={CheckCircle2}
          description="Successful payments in the current period"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(summary?.outstanding ?? 0)}
          icon={Clock3}
          description="Awaiting payment confirmation"
        />
        <StatCard
          title="Failed payments"
          value={summary?.failedPayments ?? 0}
          icon={AlertCircle}
          description="Requires follow-up"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Revenue by plan
          </CardTitle>
          <CardDescription>Monthly recurring revenue grouped by subscription plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="plan" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search invoices…"
            className="w-full sm:max-w-sm"
          />
          <FilterDropdown
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={[
              { label: "Paid", value: "paid" },
              { label: "Pending", value: "pending" },
              { label: "Failed", value: "failed" },
              { label: "Refunded", value: "refunded" },
            ]}
            placeholder="Filter by status"
            className="sm:ml-auto"
          />
        </div>

        {filtered.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell>{companyMap.get(payment.companyId) ?? "Unknown company"}</TableCell>
                  <TableCell>{planMap.get(payment.planId) ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                  <TableCell><StatusBadge status={payment.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(payment.issuedAt)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {payment.paidAt ? formatDateTime(payment.paidAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No payments match your filters</p>
            <p className="text-xs text-muted-foreground">Try another invoice, company, or status.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
