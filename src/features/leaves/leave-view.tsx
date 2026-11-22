"use client";

import * as React from "react";
import { Plus, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { MOCK_TODAY } from "@/config/constants";
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useEmployees } from "@/hooks/use-employees";
import { useLeaveBalances, useLeaves, useUpdateLeaveStatus } from "@/hooks/use-leaves";
import { useAppSelector } from "@/store";
import type { Employee } from "@/types/employee";
import type { LeaveBalance, LeaveQueryParams, LeaveRequest, LeaveStatus, LeaveType } from "@/types/leave";
import { LeaveBalanceTable } from "./components/leave-balance-table";
import { LeaveFilters } from "./components/leave-filters";
import { LeaveFormDialog } from "./components/leave-form-dialog";
import { LeaveRequestsTable } from "./components/leave-requests-table";
import { LeaveSummaryCards } from "./components/leave-summary-cards";

const EMPTY_EMPLOYEES: Employee[] = [];
const EMPTY_BALANCES: LeaveBalance[] = [];

function statusLabel(status: LeaveStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function LeaveView() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<LeaveStatus | "">("");
  const [type, setType] = React.useState<LeaveType | "">("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState<{
    request: LeaveRequest;
    status: LeaveStatus;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const filterKey = `${debouncedSearch}|${status}|${type}|${from}|${to}`;
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const handlePageChange = (nextPage: number) => setPageState({ key: filterKey, page: nextPage });

  const canCreate = usePermission("leave:create");
  const canApprove = usePermission("leave:approve");
  const approverId = useAppSelector((state) => state.auth.user?.employeeId ?? "");

  const employeesQuery = useEmployees({ limit: 100 });
  const balancesQuery = useLeaveBalances();
  const pendingQuery = useLeaves({ status: "pending", limit: 200 });
  const approvedQuery = useLeaves({ status: "approved", limit: 200 });
  const rejectedQuery = useLeaves({ status: "rejected", limit: 200 });
  const todayQuery = useLeaves({ status: "approved", from: MOCK_TODAY, to: MOCK_TODAY, limit: 200 });
  const statusMutation = useUpdateLeaveStatus();

  const params: LeaveQueryParams = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: "createdAt",
    order: "desc",
  };
  const requestsQuery = useLeaves(params);

  const employees = employeesQuery.data?.data.items ?? EMPTY_EMPLOYEES;
  const balances = balancesQuery.data?.data ?? EMPTY_BALANCES;
  const requests = requestsQuery.data?.data.items ?? [];
  const meta = requestsQuery.data?.data.meta;
  const hasFilters = Boolean(search || status || type || from || to);

  const filteredBalances = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return balances;
    return balances.filter((balance) => {
      const employee = employees.find((item) => item.id === balance.employeeId);
      return employee
        ? `${employee.firstName} ${employee.lastName} ${employee.employeeNumber}`.toLowerCase().includes(query)
        : false;
    });
  }, [balances, employees, debouncedSearch]);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setType("");
    setFrom("");
    setTo("");
  }

  async function applyStatus(request: LeaveRequest, nextStatus: LeaveStatus) {
    try {
      await statusMutation.mutateAsync({
        id: request.id,
        status: nextStatus,
        approverId: approverId || undefined,
      });
      toast.success(`Leave request ${statusLabel(nextStatus).toLowerCase()}`);
      setConfirmState(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request could not be updated.");
    }
  }

  function requestStatusChange(request: LeaveRequest, nextStatus: LeaveStatus) {
    if (nextStatus === "approved") {
      void applyStatus(request, nextStatus);
      return;
    }
    setConfirmState({ request, status: nextStatus });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Track leave requests, approvals, and remaining balances."
        actions={
          canCreate ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus />
              New request
            </Button>
          ) : undefined
        }
      />

      <LeaveSummaryCards
        pending={pendingQuery.data?.data.meta.total ?? 0}
        approved={approvedQuery.data?.data.meta.total ?? 0}
        rejected={rejectedQuery.data?.data.meta.total ?? 0}
        onLeaveToday={todayQuery.data?.data.meta.total ?? 0}
        loading={pendingQuery.isPending || approvedQuery.isPending || rejectedQuery.isPending || todayQuery.isPending}
      />

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card className="overflow-hidden">
            <LeaveFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              type={type}
              onTypeChange={setType}
              from={from}
              onFromChange={setFrom}
              to={to}
              onToChange={setTo}
            />

            {requestsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Leave requests unavailable"
                  description="Leave requests could not be loaded."
                  error={requestsQuery.error}
                  onRetry={() => void requestsQuery.refetch()}
                />
              </div>
            ) : requestsQuery.isPending ? (
              <div className="p-4">
                <LoadingSkeleton variant="table" count={8} />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title={hasFilters ? "No matching requests" : "No leave requests yet"}
                  description={
                    hasFilters
                      ? "Try a different filter or clear the active filters."
                      : "Submit a leave request to get started."
                  }
                  action={
                    hasFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    ) : canCreate ? (
                      <Button onClick={() => setFormOpen(true)}>
                        <Plus />
                        New request
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <>
                <LeaveRequestsTable
                  requests={requests}
                  employees={employees}
                  canApprove={canApprove}
                  onUpdateStatus={requestStatusChange}
                />
                {meta ? <Pagination meta={meta} onPageChange={handlePageChange} /> : null}
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b p-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search employee balances…"
                className="w-full sm:max-w-sm"
              />
            </div>

            {balancesQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Leave balances unavailable"
                  description="Leave balances could not be loaded."
                  error={balancesQuery.error}
                  onRetry={() => void balancesQuery.refetch()}
                />
              </div>
            ) : balancesQuery.isPending ? (
              <div className="p-4">
                <LoadingSkeleton variant="table" count={8} />
              </div>
            ) : filteredBalances.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No balances found"
                  description="Try a different employee search."
                />
              </div>
            ) : (
              <LeaveBalanceTable balances={filteredBalances} employees={employees} />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <LeaveFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employees={employees}
        balances={balances}
        defaultEmployeeId={approverId}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
        title={`${confirmState ? statusLabel(confirmState.status) : "Update"} leave request?`}
        description={
          confirmState
            ? `Request ${confirmState.request.id} will be marked as ${statusLabel(confirmState.status).toLowerCase()}.`
            : ""
        }
        confirmLabel={confirmState ? statusLabel(confirmState.status) : "Confirm"}
        destructive={confirmState?.status === "rejected"}
        loading={statusMutation.isPending}
        onConfirm={() => {
          if (confirmState) void applyStatus(confirmState.request, confirmState.status);
        }}
      />
    </div>
  );
}
