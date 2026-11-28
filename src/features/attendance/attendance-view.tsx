"use client";

import * as React from "react";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { MOCK_TODAY } from "@/config/constants";
import { useAuth, usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import { useAttendance } from "@/hooks/use-attendance";
import { formatDate } from "@/lib/utils";
import type { AttendanceQueryParams, AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { AttendanceAdjustDialog } from "./components/attendance-adjust-dialog";
import { AttendanceFilters } from "./components/attendance-filters";
import { AttendanceSummaryCards } from "./components/attendance-summary-cards";
import { EmployeeBirthdays } from "./components/employee-birthdays";
import { EmployeeLeaveSummary } from "./components/employee-leave-summary";
import { EmployeeTimeClock } from "./components/employee-time-clock";
import { AttendanceTable } from "./components/attendance-table";

export function AttendanceView() {
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [status, setStatus] = React.useState<AttendanceStatus | "">("");
  const [from, setFrom] = React.useState(MOCK_TODAY);
  const [to, setTo] = React.useState(MOCK_TODAY);
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<AttendanceRecord | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const filterKey = `${debouncedSearch}|${departmentId}|${status}|${from}|${to}`;
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const handlePageChange = (nextPage: number) => setPageState({ key: filterKey, page: nextPage });

  const { user } = useAuth();
  const isEmployee = user?.role === "employee";
  const canManage = usePermission("attendance:manage");
  const departmentsQuery = useDepartments();
  const employeesQuery = useEmployees({ limit: 100 });
  const todayQuery = useAttendance({ from: MOCK_TODAY, to: MOCK_TODAY, limit: 200 });

  const params: AttendanceQueryParams = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: "date",
    order: "desc",
  };
  const attendanceQuery = useAttendance(params);

  const departments = departmentsQuery.data?.data.items ?? [];
  const employees = employeesQuery.data?.data.items ?? [];
  const records = attendanceQuery.data?.data.items ?? [];
  const meta = attendanceQuery.data?.data.meta;
  const todayRecords = todayQuery.data?.data.items ?? [];
  const hasFilters = Boolean(search || departmentId || status || from || to);

  function clearFilters() {
    setSearch("");
    setDepartmentId("");
    setStatus("");
    setFrom(MOCK_TODAY);
    setTo(MOCK_TODAY);
  }

  function openAdjust(record: AttendanceRecord) {
    setSelectedRecord(record);
    setAdjustOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={
          isEmployee
            ? "Clock in and out, track your leave, and see upcoming birthdays."
            : `Daily attendance and time records for ${formatDate(MOCK_TODAY)}.`
        }
      />

      <EmployeeTimeClock />

      {isEmployee ? (
        <>
          <EmployeeLeaveSummary />
          <EmployeeBirthdays />
        </>
      ) : (
        <>
          <AttendanceSummaryCards
            total={todayRecords.length}
            present={todayRecords.filter((record) => record.status === "present").length}
            late={todayRecords.filter((record) => record.status === "late").length}
            absent={todayRecords.filter((record) => record.status === "absent").length}
            onLeave={todayRecords.filter((record) => record.status === "on_leave").length}
            overtime={todayRecords.filter((record) => record.status === "overtime").length}
            loading={todayQuery.isPending}
          />

          <Card className="overflow-hidden">
            <AttendanceFilters
              search={search}
              onSearchChange={setSearch}
              departmentId={departmentId}
              onDepartmentChange={setDepartmentId}
              status={status}
              onStatusChange={setStatus}
              from={from}
              onFromChange={setFrom}
              to={to}
              onToChange={setTo}
              departments={departments}
            />

            {attendanceQuery.isError ? (
              <div className="p-4">
                <ErrorState
                  title="Attendance unavailable"
                  description="Attendance records could not be loaded."
                  error={attendanceQuery.error}
                  onRetry={() => void attendanceQuery.refetch()}
                />
              </div>
            ) : attendanceQuery.isPending ? (
              <div className="p-4">
                <LoadingSkeleton variant="table" count={8} />
              </div>
            ) : records.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<SearchX className="size-5" />}
                  title="No attendance records"
                  description={
                    hasFilters
                      ? "Try a different date range or clear the active filters."
                      : "Adjust the filters to find attendance records."
                  }
                  action={
                    hasFilters ? (
                      <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
                        Clear filters
                      </button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <>
                <AttendanceTable
                  records={records}
                  employees={employees}
                  canManage={canManage}
                  onAdjust={openAdjust}
                />
                {meta ? <Pagination meta={meta} onPageChange={handlePageChange} /> : null}
              </>
            )}
          </Card>

          <AttendanceAdjustDialog
            open={adjustOpen}
            onOpenChange={setAdjustOpen}
            record={selectedRecord}
            employees={employees}
          />
        </>
      )}
    </div>
  );
}
