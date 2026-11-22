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
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useEmployees } from "@/hooks/use-employees";
import { usePayrollPeriods, usePayrollRecords, useUpdatePayrollPeriodStatus } from "@/hooks/use-payroll";
import { PAYROLL_PERIOD_STATUS_OPTIONS } from "@/config/constants";
import type { Employee } from "@/types/employee";
import type { PayrollPeriod, PayrollPeriodStatus, PayrollQueryParams, PayrollRecord } from "@/types/payroll";
import { GeneratePayrollDialog } from "./components/generate-payroll-dialog";
import { PayrollFilters } from "./components/payroll-filters";
import { PayrollPeriodsTable } from "./components/payroll-periods-table";
import { PayrollRecordsTable } from "./components/payroll-records-table";
import { PayrollSummaryCards } from "./components/payroll-summary-cards";
import { PayslipDialog } from "./components/payslip-dialog";

const EMPTY_EMPLOYEES: Employee[] = [];

function statusLabel(status: PayrollPeriodStatus) {
  return PAYROLL_PERIOD_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function periodDeductions(record: PayrollRecord) {
  return (
    record.deductions +
    record.taxDeductions +
    record.governmentContributions.sss +
    record.governmentContributions.philhealth +
    record.governmentContributions.pagibig
  );
}

export function PayrollView() {
  const [selectedPeriodId, setSelectedPeriodId] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [payslipRecord, setPayslipRecord] = React.useState<PayrollRecord | null>(null);
  const [confirmState, setConfirmState] = React.useState<{
    period: PayrollPeriod;
    status: PayrollPeriodStatus;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const filterKey = `${debouncedSearch}|${selectedPeriodId}`;
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const handlePageChange = (nextPage: number) => setPageState({ key: filterKey, page: nextPage });

  const canGenerate = usePermission("payroll:generate");
  const periodsQuery = usePayrollPeriods();
  const employeesQuery = useEmployees({ limit: 100 });
  const summaryQuery = usePayrollRecords({ periodId: selectedPeriodId || undefined, limit: 200 });
  const statusMutation = useUpdatePayrollPeriodStatus();

  const params: PayrollQueryParams = {
    page,
    limit: 10,
    periodId: selectedPeriodId || undefined,
    search: debouncedSearch || undefined,
    sort: "employeeId",
    order: "asc",
  };
  const recordsQuery = usePayrollRecords(params);

  const periods = periodsQuery.data?.data ?? [];
  const employees = employeesQuery.data?.data.items ?? EMPTY_EMPLOYEES;
  const records = recordsQuery.data?.data.items ?? [];
  const meta = recordsQuery.data?.data.meta;
  const summaryRecords = summaryQuery.data?.data.items ?? [];
  const generationPeriods = periods.filter((period) => period.status !== "paid");
  const defaultGeneratePeriodId = generationPeriods.some((period) => period.id === selectedPeriodId)
    ? selectedPeriodId
    : generationPeriods[0]?.id ?? "";
  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId);

  const grossPay = summaryRecords.reduce(
    (sum, record) => sum + record.basicSalary + record.allowances + record.overtimePay + record.bonuses,
    0,
  );
  const deductions = summaryRecords.reduce((sum, record) => sum + periodDeductions(record), 0);
  const netPay = summaryRecords.reduce((sum, record) => sum + record.netPay, 0);
  const hasFilters = Boolean(search || selectedPeriodId);

  function clearFilters() {
    setSearch("");
    setSelectedPeriodId("");
  }

  async function applyStatus(period: PayrollPeriod, status: PayrollPeriodStatus) {
    try {
      await statusMutation.mutateAsync({ id: period.id, status });
      toast.success(`${period.label} marked as ${statusLabel(status).toLowerCase()}`);
      setConfirmState(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The period could not be updated.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Review payroll records, payslips, and period statuses."
        actions={canGenerate ? (
          <Button onClick={() => setGenerateOpen(true)} disabled={generationPeriods.length === 0}>
            <Plus />
            Generate payroll
          </Button>
        ) : undefined}
      />

      <PayrollSummaryCards
        period={selectedPeriod}
        employeeCount={summaryRecords.length}
        grossPay={grossPay}
        deductions={deductions}
        netPay={netPay}
        loading={summaryQuery.isPending}
      />

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Payroll records</TabsTrigger>
          <TabsTrigger value="periods">Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card className="overflow-hidden">
            <PayrollFilters
              periods={periods}
              periodId={selectedPeriodId}
              onPeriodChange={setSelectedPeriodId}
              search={search}
              onSearchChange={setSearch}
            />
            {recordsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Payroll records unavailable"
                  description="Payroll records could not be loaded."
                  error={recordsQuery.error}
                  onRetry={() => void recordsQuery.refetch()}
                />
              </div>
            ) : recordsQuery.isPending ? (
              <div className="p-4">
                <LoadingSkeleton variant="table" count={8} />
              </div>
            ) : records.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title={hasFilters ? "No matching records" : "No payroll records yet"}
                  description={hasFilters ? "Try a different filter or clear the active filters." : "Generate a payroll preview to create records."}
                  action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
                />
              </div>
            ) : (
              <>
                <PayrollRecordsTable records={records} employees={employees} onView={setPayslipRecord} />
                {meta ? <Pagination meta={meta} onPageChange={handlePageChange} /> : null}
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          <Card className="overflow-hidden">
            {periodsQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Payroll periods unavailable"
                  description="Payroll periods could not be loaded."
                  error={periodsQuery.error}
                  onRetry={() => void periodsQuery.refetch()}
                />
              </div>
            ) : periodsQuery.isPending ? (
              <div className="p-4">
                <LoadingSkeleton variant="table" count={5} />
              </div>
            ) : (
              <PayrollPeriodsTable
                periods={periods}
                canManage={canGenerate}
                onStatusChange={(period, status) => setConfirmState({ period, status })}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <GeneratePayrollDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        periods={generationPeriods}
        employees={employees}
        defaultPeriodId={defaultGeneratePeriodId}
      />

      <PayslipDialog
        open={Boolean(payslipRecord)}
        onOpenChange={(open) => { if (!open) setPayslipRecord(null); }}
        record={payslipRecord}
        employees={employees}
        periods={periods}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onOpenChange={(open) => { if (!open) setConfirmState(null); }}
        title={`Mark ${confirmState?.period.label ?? "period"} as ${confirmState ? statusLabel(confirmState.status).toLowerCase() : ""}?`}
        description={confirmState ? `The period will be marked as ${statusLabel(confirmState.status).toLowerCase()}.` : ""}
        confirmLabel={confirmState ? statusLabel(confirmState.status) : "Confirm"}
        loading={statusMutation.isPending}
        onConfirm={() => { if (confirmState) void applyStatus(confirmState.period, confirmState.status); }}
      />
    </div>
  );
}
