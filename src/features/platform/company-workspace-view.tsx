"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, PanelLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { companyWorkspaceNavigation, type NavItem } from "@/config/navigation";
import { useSubscriptionPlans, usePlatformCompanies } from "@/hooks/use-platform";
import { cn, formatCurrency } from "@/lib/utils";

import { AttendanceView } from "@/features/attendance/attendance-view";
import { ClientsView } from "@/features/clients/clients-view";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { DepartmentsView } from "@/features/departments/departments-view";
import { EmployeeDirectory } from "@/features/employees/employee-directory";
import { LeaveView } from "@/features/leaves/leave-view";
import { PayrollView } from "@/features/payroll/payroll-view";
import { PerformanceView } from "@/features/performance/performance-view";
import { PositionsView } from "@/features/positions/positions-view";
import { ProjectsView } from "@/features/projects/projects-view";
import { RecruitmentView } from "@/features/recruitment/recruitment-view";
import { ReportsView } from "@/features/reports/reports-view";
import { CompanyProfileView } from "@/features/settings/company-profile-view";
import { SettingsView } from "@/features/settings/settings-view";
import { UsersRolesView } from "@/features/settings/users-roles-view";
import { TimeEntriesView } from "@/features/time-entries/time-entries-view";
import { TimesheetView } from "@/features/timesheet/timesheet-view";

const WORKSPACE_VIEWS: Record<string, React.ComponentType> = {
  "/dashboard": DashboardView,
  "/employees": EmployeeDirectory,
  "/departments": DepartmentsView,
  "/positions": PositionsView,
  "/attendance": AttendanceView,
  "/timesheet": TimesheetView,
  "/time-entries": TimeEntriesView,
  "/leave": LeaveView,
  "/payroll": PayrollView,
  "/clients": ClientsView,
  "/projects": ProjectsView,
  "/recruitment": RecruitmentView,
  "/performance": PerformanceView,
  "/reports": ReportsView,
  "/settings": SettingsView,
  "/settings/company": CompanyProfileView,
  "/settings/users": UsersRolesView,
};

interface CompanyWorkspaceViewProps {
  companyId: string;
}

export function CompanyWorkspaceView({ companyId }: CompanyWorkspaceViewProps) {
  const [activeHref, setActiveHref] = React.useState("/dashboard");
  const [openGroups, setOpenGroups] = React.useState<string[]>(["/employees", "/settings"]);

  const companies = usePlatformCompanies();
  const plans = useSubscriptionPlans();

  const company = React.useMemo(
    () => (companies.data?.data ?? []).find((item) => item.id === companyId),
    [companies.data, companyId],
  );
  const planName = React.useMemo(
    () => (plans.data?.data ?? []).find((item) => item.id === company?.planId)?.name ?? "—",
    [company?.planId, plans.data],
  );

  function toggleGroup(href: string) {
    setOpenGroups((current) =>
      current.includes(href) ? current.filter((entry) => entry !== href) : [...current, href],
    );
  }

  function selectItem(item: NavItem) {
    setActiveHref(item.href);
    if (item.children?.length && !openGroups.includes(item.href)) {
      toggleGroup(item.href);
    }
  }

  if (companies.isError) {
    return (
      <ErrorState
        title="Company workspace unavailable"
        description="The selected company could not be loaded."
        error={companies.error}
        onRetry={() => void companies.refetch()}
      />
    );
  }

  if (companies.isPending) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (!company) {
    return (
      <EmptyState
        icon={<PanelLeft className="size-5" />}
        title="Company not found"
        description="This company is no longer registered on the platform."
        action={
          <Button asChild variant="outline">
            <Link href="/platform/companies">
              <ArrowLeft />
              Back to Manage companies
            </Link>
          </Button>
        }
      />
    );
  }

  const ActiveView = WORKSPACE_VIEWS[activeHref] ?? DashboardView;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
          <Link href="/platform/companies">
            <ArrowLeft />
            Manage companies
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Platform Administration</span>
          <span>/</span>
          <span className="font-medium text-foreground">{company.name}</span>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
              style={{
                backgroundColor: `${company.avatarColor}1a`,
                color: company.avatarColor,
              }}
            >
              {company.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold">{company.name}</h1>
                <StatusBadge status={company.status} />
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {company.legalName} · {company.domain}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{planName} plan</Badge>
            <Badge variant="outline">{company.employeeCount} employees</Badge>
            <Badge variant="outline">{formatCurrency(company.monthlyRevenue)} / month</Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="shrink-0 lg:w-56" aria-label="Company workspace navigation">
          <div className="mb-3 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <PanelLeft className="size-3.5" />
            Workspace pages
          </div>
          <nav className="space-y-1 lg:sticky lg:top-4">
            {companyWorkspaceNavigation.map((item) => {
              const children = item.children ?? [];
              const groupActive =
                activeHref === item.href || children.some((child) => child.href === activeHref);
              const isOpen = openGroups.includes(item.href);

              if (children.length) {
                return (
                  <div key={item.href} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.href)}
                      aria-expanded={isOpen}
                      className={cn(
                        "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                        groupActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    {isOpen ? (
                      <div className="ml-4 space-y-1 border-l pl-3">
                        {children.map((child) => (
                          <WorkspaceNavButton
                            key={child.href}
                            item={child}
                            active={activeHref === child.href}
                            onClick={() => selectItem(child)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <WorkspaceNavButton
                  key={item.href}
                  item={item}
                  active={activeHref === item.href}
                  onClick={() => selectItem(item)}
                />
              );
            })}
          </nav>
          <Separator className="my-4" />
          <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
            These workspace pages are scoped to {company.name} for this preview.
          </p>
        </aside>

        <section className="min-w-0 flex-1">
          <ActiveView />
        </section>
      </div>
    </div>
  );
}

function WorkspaceNavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
    </button>
  );
}
