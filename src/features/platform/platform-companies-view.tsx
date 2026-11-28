"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, CheckCircle2, ExternalLink, PauseCircle, SearchX, Sunrise } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  usePlatformCompanies,
  useSetCompanyStatus,
  useSubscriptionPlans,
  useUpdateCompanyPlan,
} from "@/hooks/use-platform";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PlatformCompany } from "@/types/platform";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export function PlatformCompaniesView() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [statusTarget, setStatusTarget] = React.useState<PlatformCompany | null>(null);

  const companies = usePlatformCompanies();
  const plans = useSubscriptionPlans();
  const statusMutation = useSetCompanyStatus();
  const planMutation = useUpdateCompanyPlan();

  const allCompanies = React.useMemo(
    () => companies.data?.data ?? [],
    [companies.data],
  );
  const planMap = React.useMemo(
    () => new Map((plans.data?.data ?? []).map((plan) => [plan.id, plan.name])),
    [plans.data],
  );

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return allCompanies.filter((company) => {
      if (statusFilter && company.status !== statusFilter) return false;
      if (!term) return true;
      return [
        company.name,
        company.legalName,
        company.domain,
        company.ownerName,
        company.ownerEmail,
        planMap.get(company.planId) ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [allCompanies, planMap, search, statusFilter]);

  async function confirmStatusChange() {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "suspended" ? "active" : "suspended";
    try {
      await statusMutation.mutateAsync({ id: statusTarget.id, status: nextStatus });
      toast.success(
        nextStatus === "suspended"
          ? `${statusTarget.name} suspended`
          : `${statusTarget.name} activated`,
      );
      setStatusTarget(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function changePlan(company: PlatformCompany, planId: string) {
    if (planId === company.planId) return;
    try {
      await planMutation.mutateAsync({ id: company.id, planId });
      toast.success(`${company.name} moved to ${planMap.get(planId) ?? "the selected plan"}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  if (companies.isError) {
    return (
      <ErrorState
        title="Companies unavailable"
        description="Registered companies could not be loaded."
        error={companies.error}
        onRetry={() => void companies.refetch()}
      />
    );
  }

  if (companies.isPending) {
    return <LoadingSkeleton variant="table" count={8} />;
  }

  const activeCount = allCompanies.filter((company) => company.status === "active").length;
  const trialCount = allCompanies.filter((company) => company.status === "trial").length;
  const suspendedCount = allCompanies.filter((company) => company.status === "suspended").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage companies"
        description="Review registered tenants, change subscriptions, and suspend or activate company accounts."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total companies"
          value={allCompanies.length}
          icon={Building2}
          description="All registered tenants"
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={CheckCircle2}
          description="Paying and operational"
        />
        <StatCard
          title="On trial"
          value={trialCount}
          icon={Sunrise}
          description="Trial accounts in progress"
        />
        <StatCard
          title="Suspended"
          value={suspendedCount}
          icon={PauseCircle}
          description="Access currently blocked"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search companies…"
            className="w-full sm:max-w-sm"
          />
          <FilterDropdown
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={[
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Suspended", value: "suspended" },
            ]}
            placeholder="Filter by status"
            className="sm:ml-auto"
          />
        </div>

        {filtered.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                        style={{
                          backgroundColor: `${company.avatarColor}1a`,
                          color: company.avatarColor,
                        }}
                      >
                        {company.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/platform/companies/${company.id}`}
                          className="font-medium hover:underline"
                        >
                          {company.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{company.ownerEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={company.planId}
                      onValueChange={(value) => void changePlan(company, value)}
                      disabled={planMutation.isPending}
                    >
                      <SelectTrigger className="w-36" aria-label={`Plan for ${company.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(plans.data?.data ?? []).map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{company.employeeCount}</TableCell>
                  <TableCell>{formatCurrency(company.monthlyRevenue)}</TableCell>
                  <TableCell><StatusBadge status={company.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(company.lastActiveAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/platform/companies/${company.id}`}>
                          <ExternalLink />
                          Open workspace
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant={company.status === "suspended" ? "default" : "outline"}
                        onClick={() => setStatusTarget(company)}
                        disabled={statusMutation.isPending}
                      >
                        {company.status === "suspended" ? "Activate" : "Suspend"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No companies match your filters</p>
            <p className="text-xs text-muted-foreground">Try another search term or status.</p>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
        title={statusTarget?.status === "suspended" ? "Activate company account?" : "Suspend company account?"}
        description={
          statusTarget?.status === "suspended"
            ? `${statusTarget.name} will regain access to its PeopleHub workspace immediately.`
            : `${statusTarget?.name ?? "This company"} will lose access to its workspace until it is activated again.`
        }
        confirmLabel={statusTarget?.status === "suspended" ? "Activate company" : "Suspend company"}
        destructive={statusTarget?.status !== "suspended"}
        loading={statusMutation.isPending}
        onConfirm={() => void confirmStatusChange()}
      />
    </div>
  );
}
